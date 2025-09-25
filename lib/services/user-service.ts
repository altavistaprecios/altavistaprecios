import { createClient, createAdminClient } from '@/lib/supabase/server'
import {
  CreateUserSchema,
  UpdateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
  type UserProfile,
} from '@/lib/models/user'

export class UserService {
  private async getSupabase() {
    return await createClient()
  }

  async create(data: CreateUserInput): Promise<{ user: UserProfile; tempPassword: string }> {
    const validated = CreateUserSchema.parse(data)
    const supabase = await this.getSupabase()

    // Generate temporary password if not provided
    const tempPassword = validated.password || this.generateTempPassword()

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validated.email,
      password: tempPassword,
      options: {
        data: {
          company_name: validated.company_name,
          is_admin: false,
        },
      },
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Failed to create user')

    const user: UserProfile = {
      id: authData.user.id,
      email: authData.user.email!,
      company_name: validated.company_name,
      is_admin: false,
      created_at: authData.user.created_at,
    }

    return { user, tempPassword }
  }

  async update(id: string, data: UpdateUserInput): Promise<UserProfile> {
    const validated = UpdateUserSchema.parse(data)
    const supabase = await this.getSupabase()

    // Update user metadata in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(
      id,
      {
        user_metadata: validated,
      }
    )

    if (authError) throw authError

    const user: UserProfile = {
      id: authData.user.id,
      email: authData.user.email!,
      company_name: authData.user.user_metadata?.company_name,
      is_admin: authData.user.user_metadata?.is_admin || false,
      updated_at: authData.user.updated_at,
    }

    return user
  }

  async findById(id: string): Promise<UserProfile | null> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase.auth.admin.getUserById(id)

    if (error) throw error

    if (!data.user) return null

    const user: UserProfile = {
      id: data.user.id,
      email: data.user.email!,
      company_name: data.user.user_metadata?.company_name,
      is_admin: data.user.user_metadata?.is_admin || false,
      created_at: data.user.created_at,
      updated_at: data.user.updated_at,
    }

    return user
  }

  async findAll(filters?: { is_admin?: boolean }): Promise<UserProfile[]> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase.auth.admin.listUsers()

    if (error) throw error

    let users = data.users.map(u => ({
      id: u.id,
      email: u.email!,
      company_name: u.user_metadata?.company_name,
      is_admin: u.user_metadata?.is_admin || false,
      created_at: u.created_at,
      updated_at: u.updated_at,
    }))

    if (filters?.is_admin !== undefined) {
      users = users.filter(u => u.is_admin === filters.is_admin)
    }

    return users
  }

  async inviteClient(email: string, companyName: string): Promise<void> {
    const supabase = await this.getSupabase()

    // Create user with temporary password
    const { user, tempPassword } = await this.create({
      email,
      company_name: companyName,
    })

    // Send magic link for password reset
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/set-password`,
    })

    if (error) throw error

    // TODO: Send email with invitation details and temporary password
    console.log(`Invited ${email} with temporary password: ${tempPassword}`)
  }

  async checkIsAdmin(userId: string): Promise<boolean> {
    try {
      // Use admin client for admin operations
      const supabase = await createAdminClient()

      // Get user by ID using admin client
      const { data, error } = await supabase.auth.admin.getUserById(userId)

      if (error || !data.user) return false

      return data.user.user_metadata?.is_admin === true
    } catch (error) {
      console.error('Error checking admin status:', error)
      return false
    }
  }

  private generateTempPassword(): string {
    const chars = 'ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789!@#$%'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }
}