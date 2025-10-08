// Agent settings type - Single source of truth
export interface AgentSettings {
  voice_speed: number
  responsiveness: number
  interruption_sensitivity: number
  voice_temperature: number
  volume: number
  language: string
  voice_id: string
  prompt: string
}

// Database row type
export interface UserSettingsRow {
  id: string
  user_id: string
  settings: AgentSettings
  created_at: string
  updated_at: string
}

// Default settings for new users
export const DEFAULT_SETTINGS: AgentSettings = {
  voice_speed: 1.0,
  responsiveness: 1.0,
  interruption_sensitivity: 1.0,
  voice_temperature: 1.0,
  volume: 1.0,
  language: 'en-US',
  voice_id: '11labs-Adrian',
  prompt: '',
}

// Validation constraints (matches Retell API specs)
export const SETTINGS_CONSTRAINTS = {
  voice_speed: { min: 0.5, max: 2.0, step: 0.05 },
  responsiveness: { min: 0, max: 1, step: 0.05 },
  interruption_sensitivity: { min: 0, max: 1, step: 0.05 },
  voice_temperature: { min: 0, max: 2, step: 0.1 },
  volume: { min: 0, max: 2, step: 0.1 },
  prompt: { minLength: 10, maxLength: 2000 },
} as const

