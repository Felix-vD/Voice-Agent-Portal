export interface RetellAgentConfig {
  voice_speed: number // 0.5 - 2.0
  responsiveness: number // 0 - 1
  interruption_sensitivity: number // 0 - 1
  voice_temperature: number // 0 - 2
  volume: number // 0 - 2
  language: string // "en-US", "es-ES", etc.
  voice_id?: string // Optional: "11labs-Adrian" etc.
  prompt?: string // Agent behavior prompt
}

export interface RetellApiResponse {
  success: boolean
  message?: string
  error?: string
  data?: Record<string, unknown>
}

