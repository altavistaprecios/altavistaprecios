import { createClient } from '@/lib/supabase/server'
import {
  CreateClientPriceSchema,
  UpdateClientPriceSchema,
  type CreateClientPriceInput,
  type UpdateClientPriceInput,
  type ClientPrice,
} from '@/lib/models/client-price'
import { CreatePriceHistoryInput } from '@/lib/models/price-history'

export class ClientPriceService {
  private async getSupabase() {
    return await createClient()
  }

  async create(data: CreateClientPriceInput): Promise<ClientPrice> {
    const validated = CreateClientPriceSchema.parse(data)
    const supabase = await this.getSupabase()

    // Validate price is not below base price
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('base_price_usd')
      .eq('id', validated.product_id)
      .single()

    if (productError) throw productError

    if (validated.custom_price_usd < product.base_price_usd) {
      throw new Error(`Custom price cannot be below base price of $${product.base_price_usd}`)
    }

    // Check if price already exists
    const { data: existingPrice } = await supabase
      .from('client_prices')
      .select('id, custom_price_usd')
      .eq('user_id', validated.user_id)
      .eq('product_id', validated.product_id)
      .single()

    let price: ClientPrice
    let oldPrice: number | null = null

    if (existingPrice) {
      // Update existing price
      oldPrice = existingPrice.custom_price_usd
      const { data: updatedPrice, error: updateError } = await supabase
        .from('client_prices')
        .update({
          custom_price_usd: validated.custom_price_usd,
          markup_percentage: validated.markup_percentage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingPrice.id)
        .select()
        .single()

      if (updateError) throw updateError
      price = updatedPrice
    } else {
      // Create new price
      const { data: newPrice, error: createError } = await supabase
        .from('client_prices')
        .insert(validated)
        .select()
        .single()

      if (createError) throw createError
      price = newPrice
    }

    // Track price history
    await this.createPriceHistory({
      product_id: validated.product_id,
      user_id: validated.user_id,
      old_price: oldPrice,
      new_price: validated.custom_price_usd,
      change_type: 'client_custom',
    })

    return price
  }

  async findById(id: string): Promise<ClientPrice | null> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('client_prices')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async update(
    id: string,
    data: UpdateClientPriceInput
  ): Promise<ClientPrice> {
    const validated = UpdateClientPriceSchema.parse(data)
    const supabase = await this.getSupabase()

    // Get current price
    const { data: currentPrice, error: fetchError } = await supabase
      .from('client_prices')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    // Update price
    const { data: price, error: updateError } = await supabase
      .from('client_prices')
      .update({
        ...validated,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    // Track price change if applicable
    if (validated.custom_price_usd && validated.custom_price_usd !== currentPrice.custom_price_usd) {
      await this.createPriceHistory({
        product_id: currentPrice.product_id,
        user_id: currentPrice.user_id,
        old_price: currentPrice.custom_price_usd,
        new_price: validated.custom_price_usd,
        change_type: 'client_custom',
      })
    }

    return price
  }

  async delete(id: string): Promise<void> {
    const supabase = await this.getSupabase()

    const { error } = await supabase
      .from('client_prices')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  async findByUser(userId: string): Promise<ClientPrice[]> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('client_prices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async findByProduct(productId: string): Promise<ClientPrice[]> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('client_prices')
      .select('*')
      .eq('product_id', productId)

    if (error) throw error
    return data
  }

  async findByUserAndProduct(userId: string, productId: string): Promise<ClientPrice | null> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('client_prices')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async bulkCreate(userId: string, prices: CreateClientPriceInput[]): Promise<{
    imported: number
    failed: number
    errors: string[]
  }> {
    const results = {
      imported: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (const priceData of prices) {
      try {
        await this.create({ ...priceData, user_id: userId })
        results.imported++
      } catch (error) {
        results.failed++
        results.errors.push(
          `Product ${priceData.product_id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }

    // Track bulk update in history
    if (results.imported > 0) {
      const supabase = await this.getSupabase()
      const { data: { user } } = await supabase.auth.getUser()

      await supabase.from('price_history').insert({
        product_id: prices[0].product_id, // Use first product as reference
        user_id: userId,
        new_price: 0, // Placeholder for bulk operation
        change_type: 'bulk_update',
        changed_by: user?.id || null,
        changed_at: new Date().toISOString(),
      })
    }

    return results
  }

  private async createPriceHistory(data: CreatePriceHistoryInput): Promise<void> {
    const supabase = await this.getSupabase()

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('price_history').insert({
      ...data,
      changed_by: user?.id || null,
      changed_at: new Date().toISOString(),
    })

    if (error) throw error
  }
}