import { createClient, createAdminClient } from '@/lib/supabase/server'
import {
  CreateProductSchema,
  UpdateProductSchema,
  type CreateProductInput,
  type UpdateProductInput,
  type Product,
  type ProductSpecification,
} from '@/lib/models/product'
import { CreatePriceHistoryInput } from '@/lib/models/price-history'

export class ProductService {
  private async getSupabase() {
    return await createClient()
  }

  private async getAdminSupabase() {
    return await createAdminClient()
  }

  async create(data: CreateProductInput): Promise<Product> {
    const validated = CreateProductSchema.parse(data)
    const supabase = await this.getAdminSupabase()

    const { specifications, ...productData } = validated

    // Create product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single()

    if (productError) throw productError

    // Create specifications if provided
    if (specifications) {
      const { error: specError } = await supabase
        .from('product_specifications')
        .insert({
          ...specifications,
          product_id: product.id,
        })

      if (specError) throw specError
    }

    // Skip price history for initial creation
    // The database constraint doesn't accept 'initial' as change_type

    return product
  }

  async update(id: string, data: UpdateProductInput): Promise<Product> {
    const validated = UpdateProductSchema.parse(data)
    const supabase = await this.getAdminSupabase()

    // Get current product for price comparison
    const { data: currentProduct, error: fetchError } = await supabase
      .from('products')
      .select('base_price_usd')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    // Update product
    const { data: product, error: updateError } = await supabase
      .from('products')
      .update({
        ...validated,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    // Track price change if applicable
    if (validated.base_price_usd && validated.base_price_usd !== currentProduct.base_price_usd) {
      await this.createPriceHistory({
        product_id: id,
        old_price: currentProduct.base_price_usd,
        new_price: validated.base_price_usd,
        change_type: 'admin_update',
        user_id: null,
      })
    }

    return product
  }

  async delete(id: string): Promise<void> {
    const supabase = await this.getAdminSupabase()

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw error
  }

  async findById(id: string): Promise<Product & { specifications?: ProductSpecification }> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        specifications:product_specifications(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async findAll(filters?: {
    category_id?: string
    is_active?: boolean
    search?: string
  }): Promise<Product[]> {
    const supabase = await this.getSupabase()

    let query = supabase.from('products').select('*')

    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id)
    }

    if (filters?.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`)
    }

    const { data, error } = await query.order('name')

    if (error) throw error
    return data
  }

  async findByCode(code: string): Promise<Product | null> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('code', code)
      .maybeSingle()

    if (error) throw error
    return data
  }

  async addTreatments(
    productId: string,
    treatments: Array<{ treatment_id: string; additional_cost?: number }>
  ): Promise<void> {
    const supabase = await this.getSupabase()

    const { error } = await supabase.from('product_treatments').insert(
      treatments.map(t => ({
        product_id: productId,
        treatment_id: t.treatment_id,
        additional_cost: t.additional_cost,
      }))
    )

    if (error) throw error
  }

  private async createPriceHistory(data: CreatePriceHistoryInput): Promise<void> {
    const supabase = await this.getAdminSupabase()

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('price_history').insert({
      ...data,
      changed_by: user?.id || null,
      changed_at: new Date().toISOString(),
    })

    if (error) throw error
  }
}