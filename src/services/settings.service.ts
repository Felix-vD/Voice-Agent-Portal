import { createClient } from '@/lib/supabase/client'
import type { AgentSettings } from '@/types/settings'

/**
 * Service for managing user settings in Supabase
 * Handles all database operations for agent settings
 */
export class SettingsService {
  /**
   * Load user's saved settings from Supabase
   * Returns null if user has no saved settings (first time user)
   */
  static async loadUserSettings(): Promise<AgentSettings | null> {
    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.error('Auth error loading settings:', authError)
        return null
      }

      // Fetch settings from database
      const { data, error } = await supabase
        .from('user_agent_settings')
        .select('settings')
        .eq('user_id', user.id)
        .single()

      if (error) {
        // No settings found is not an error - just a new user
        if (error.code === 'PGRST116') {
          console.log('No saved settings found for user (first time user)')
          return null
        }
        console.error('Error loading settings:', error)
        return null
      }

      return data?.settings || null
    } catch (error) {
      console.error('Exception loading settings:', error)
      return null
    }
  }

  /**
   * Save user's settings to Supabase
   * Uses upsert to create or update settings
   */
  static async saveUserSettings(settings: AgentSettings): Promise<boolean> {
    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.error('Auth error saving settings:', authError)
        return false
      }

      // Upsert settings (insert or update)
      const { error } = await supabase
        .from('user_agent_settings')
        .upsert({
          user_id: user.id,
          settings: settings,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        })

      if (error) {
        console.error('Error saving settings:', error)
        return false
      }

      console.log('Settings saved successfully')
      return true
    } catch (error) {
      console.error('Exception saving settings:', error)
      return false
    }
  }

  /**
   * Check if user has saved settings
   */
  static async hasUserSettings(): Promise<boolean> {
    try {
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data, error } = await supabase
        .from('user_agent_settings')
        .select('id')
        .eq('user_id', user.id)
        .single()

      return !error && !!data
    } catch {
      return false
    }
  }
}

