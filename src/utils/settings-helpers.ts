import type { AgentSettings } from '@/types/settings'

/**
 * Utility functions for working with settings
 */

/**
 * Check if two settings objects are equal
 * Used to determine if form has unsaved changes
 */
export function areSettingsEqual(a: AgentSettings, b: AgentSettings): boolean {
  return (
    a.voice_speed === b.voice_speed &&
    a.responsiveness === b.responsiveness &&
    a.interruption_sensitivity === b.interruption_sensitivity &&
    a.voice_temperature === b.voice_temperature &&
    a.volume === b.volume &&
    a.language === b.language &&
    a.voice_id === b.voice_id &&
    a.prompt.trim() === b.prompt.trim()
  )
}

/**
 * Validate settings before saving
 * Returns error message if invalid, null if valid
 */
export function validateSettings(settings: AgentSettings): string | null {
  // Validate prompt
  if (!settings.prompt || settings.prompt.trim().length === 0) {
    return 'Prompt is required'
  }
  if (settings.prompt.trim().length < 10) {
    return 'Prompt must be at least 10 characters'
  }
  if (settings.prompt.length > 2000) {
    return 'Prompt must be less than 2000 characters'
  }

  // Validate ranges
  if (settings.voice_speed < 0.5 || settings.voice_speed > 2.0) {
    return 'Voice speed must be between 0.5 and 2.0'
  }
  if (settings.responsiveness < 0 || settings.responsiveness > 1) {
    return 'Responsiveness must be between 0 and 1'
  }
  if (settings.interruption_sensitivity < 0 || settings.interruption_sensitivity > 1) {
    return 'Interruption sensitivity must be between 0 and 1'
  }
  if (settings.voice_temperature < 0 || settings.voice_temperature > 2) {
    return 'Voice temperature must be between 0 and 2'
  }
  if (settings.volume < 0 || settings.volume > 2) {
    return 'Volume must be between 0 and 2'
  }

  // Validate language and voice_id
  if (!settings.language) {
    return 'Language is required'
  }
  if (!settings.voice_id) {
    return 'Voice is required'
  }

  return null
}

/**
 * Deep clone settings to avoid mutation
 */
export function cloneSettings(settings: AgentSettings): AgentSettings {
  return {
    voice_speed: settings.voice_speed,
    responsiveness: settings.responsiveness,
    interruption_sensitivity: settings.interruption_sensitivity,
    voice_temperature: settings.voice_temperature,
    volume: settings.volume,
    language: settings.language,
    voice_id: settings.voice_id,
    prompt: settings.prompt,
  }
}

