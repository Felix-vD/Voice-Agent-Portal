'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import type { RetellAgentConfig } from '@/types/agent'

interface VoiceAgentFormProps {
  onSave?: (data: RetellAgentConfig) => Promise<void>
}

const LANGUAGES = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'es-ES', label: 'Spanish (Spain)' },
  { value: 'es-MX', label: 'Spanish (Mexico)' },
  { value: 'fr-FR', label: 'French' },
  { value: 'de-DE', label: 'German' },
  { value: 'it-IT', label: 'Italian' },
  { value: 'pt-BR', label: 'Portuguese (Brazil)' },
  { value: 'ja-JP', label: 'Japanese' },
  { value: 'zh-CN', label: 'Chinese (Simplified)' },
  { value: 'ko-KR', label: 'Korean' },
  { value: 'ar-SA', label: 'Arabic' },
  { value: 'hi-IN', label: 'Hindi' },
  { value: 'ru-RU', label: 'Russian' },
  { value: 'multilingual', label: 'Multilingual' },
]

const VOICES = [
  { value: '11labs-Adrian', label: 'Adrian (Male, Authoritative)' },
  { value: '11labs-Aria', label: 'Aria (Female, Expressive)' },
  { value: '11labs-Clyde', label: 'Clyde (Male, Warm)' },
  { value: '11labs-Emily', label: 'Emily (Female, Calm)' },
  { value: '11labs-Josh', label: 'Josh (Male, Casual)' },
  { value: '11labs-Rachel', label: 'Rachel (Female, Professional)' },
  { value: '11labs-Sam', label: 'Sam (Male, Friendly)' },
]

export function VoiceAgentForm({ onSave }: VoiceAgentFormProps) {
  // Form state
  const [prompt, setPrompt] = useState('')
  const [language, setLanguage] = useState('en-US')
  const [voiceId, setVoiceId] = useState('11labs-Adrian')
  const [voiceSpeed, setVoiceSpeed] = useState(1.0)
  const [responsiveness, setResponsiveness] = useState(1.0)
  const [interruptionSensitivity, setInterruptionSensitivity] = useState(1.0)
  const [voiceTemperature, setVoiceTemperature] = useState(1.0)
  const [volume, setVolume] = useState(1.0)
  
  // Error state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState('')
  
  const [isPending, startTransition] = useTransition()
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear previous errors
    setFieldErrors({})
    setGeneralError('')

    // Validation
    if (prompt && prompt.trim().length < 10) {
      setFieldErrors({ prompt: 'Prompt must be at least 10 characters' })
      showToast('Prompt must be at least 10 characters', 'error')
      return
    }

    // Build payload
    const data: RetellAgentConfig = {
      voice_speed: voiceSpeed,
      responsiveness: responsiveness,
      interruption_sensitivity: interruptionSensitivity,
      voice_temperature: voiceTemperature,
      volume: volume,
      language: language,
      voice_id: voiceId,
      prompt: prompt.trim() || undefined,
    }

    startTransition(async () => {
      try {
        if (onSave) {
          await onSave(data)
        } else {
          // Call our API endpoint
          const response = await fetch('/api/agent/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          })

          const result = await response.json()

          if (!response.ok) {
            // Handle field-specific errors
            if (result.field && result.error) {
              setFieldErrors({ [result.field]: result.error })
              showToast(`Error in ${result.field}: ${result.error}`, 'error')
            } else {
              setGeneralError(result.error || 'Failed to update agent')
              showToast(result.error || 'Failed to update agent', 'error')
            }
            console.error('API error:', result)
            return
          }

          // Clear errors on success
          setFieldErrors({})
          setGeneralError('')
          showToast('Agent configuration updated successfully!', 'success')
          console.log('Update successful:', result)
        }
      } catch (error: any) {
        setGeneralError('Network error occurred')
        showToast('Failed to save configuration', 'error')
        console.error('Error saving voice agent:', error)
      }
    })
  }

  const handleReset = () => {
    setPrompt('')
    setLanguage('en-US')
    setVoiceId('11labs-Adrian')
    setVoiceSpeed(1.0)
    setResponsiveness(1.0)
    setInterruptionSensitivity(1.0)
    setVoiceTemperature(1.0)
    setVolume(1.0)
    showToast('Form reset to defaults', 'info')
  }

  const charCount = prompt.length
  const charLimit = 2000

  return (
    <div>
      {/* Form Header */}
      <div style={{ marginBottom: "32px" }}>
        <h2
          style={{ fontSize: "32px", lineHeight: "40px", color: "#FFC300", marginBottom: "8px" }}
          className="font-bold tracking-tight"
        >
          Agent Configuration
        </h2>
        <p style={{ fontSize: "16px", lineHeight: "24px", color: "rgba(168, 240, 240, 0.7)" }}>
          Customize your voice agent&apos;s behavior and voice settings
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* General Error Display */}
        {generalError && (
          <div style={{ 
            marginBottom: "24px", 
            padding: "16px", 
            backgroundColor: "rgba(255, 68, 68, 0.1)", 
            border: "1px solid #ff4444", 
            borderRadius: "8px",
            color: "#ff4444"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <span style={{ fontWeight: "500" }}>Error:</span>
              <span>{generalError}</span>
            </div>
          </div>
        )}

        {/* Prompt Textarea */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label
                htmlFor="prompt"
                style={{ fontSize: "14px", lineHeight: "20px", color: "#A8F0F0" }}
                className="font-medium"
              >
                Agent Prompt (Optional)
              </label>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "500",
                  color: charCount > charLimit ? "#fca5a5" : "rgba(168, 240, 240, 0.6)"
                }}
              >
                {charCount} / {charLimit}
              </span>
            </div>
            <Textarea
              id="prompt"
              name="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe how your voice agent should behave..."
              rows={6}
              maxLength={charLimit}
              disabled={isPending}
              style={{
                height: "120px",
                backgroundColor: "#002929",
                borderColor: fieldErrors.prompt ? "#ff4444" : "#004d4d",
                color: "#A8F0F0",
                resize: "vertical"
              }}
              className="w-full placeholder:text-[#004d4d] focus:border-[#FFC300] focus:ring-[#FFC300]/20"
            />
            {fieldErrors.prompt && (
              <p style={{ color: "#ff4444", fontSize: "12px", marginTop: "4px" }}>
                {fieldErrors.prompt}
              </p>
            )}
          </div>
        </div>

        {/* Language & Voice Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
          {/* Language */}
          <div>
            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="language"
                style={{ fontSize: "14px", lineHeight: "20px", color: "#A8F0F0", marginBottom: "8px" }}
                className="font-medium block"
              >
                Language *
              </label>
              <Select
                id="language"
                name="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                required
                disabled={isPending}
                style={{
                  height: "48px",
                  backgroundColor: "#002929",
                  borderColor: fieldErrors.language ? "#ff4444" : "#004d4d",
                  color: "#A8F0F0"
                }}
                className="w-full focus:border-[#FFC300] focus:ring-[#FFC300]/20"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value} style={{ backgroundColor: "#002929", color: "#A8F0F0" }}>
                    {lang.label}
                  </option>
                ))}
              </Select>
              {fieldErrors.language && (
                <p style={{ color: "#ff4444", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.language}
                </p>
              )}
            </div>
          </div>

          {/* Voice */}
          <div>
            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="voice"
                style={{ fontSize: "14px", lineHeight: "20px", color: "#A8F0F0", marginBottom: "8px" }}
                className="font-medium block"
              >
                Voice
              </label>
              <Select
                id="voice"
                name="voice"
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                disabled={isPending}
                style={{
                  height: "48px",
                  backgroundColor: "#002929",
                  borderColor: fieldErrors.voice_id ? "#ff4444" : "#004d4d",
                  color: "#A8F0F0"
                }}
                className="w-full focus:border-[#FFC300] focus:ring-[#FFC300]/20"
              >
                {VOICES.map((v) => (
                  <option key={v.value} value={v.value} style={{ backgroundColor: "#002929", color: "#A8F0F0" }}>
                    {v.label}
                  </option>
                ))}
              </Select>
              {fieldErrors.voice_id && (
                <p style={{ color: "#ff4444", fontSize: "12px", marginTop: "4px" }}>
                  {fieldErrors.voice_id}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Voice Speed Slider */}
        <div style={{ marginBottom: "24px" }}>
          <label
            htmlFor="voice_speed"
            style={{ fontSize: "14px", lineHeight: "20px", color: "#A8F0F0", marginBottom: "8px" }}
            className="font-medium block"
          >
            Voice Speed: <span style={{ color: "#FFC300" }}>{voiceSpeed.toFixed(2)}x</span>
          </label>
          <div style={{ position: "relative", marginBottom: "8px" }}>
            <input
              type="range"
              id="voice_speed"
              name="voice_speed"
              min="0.5"
              max="2.0"
              step="0.05"
              value={voiceSpeed}
              onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
              disabled={isPending}
              style={{
                width: "100%",
                height: "8px",
                background: `linear-gradient(to right, #FFC300 0%, #FFC300 ${((voiceSpeed - 0.5) / 1.5) * 100}%, #004d4d ${((voiceSpeed - 0.5) / 1.5) * 100}%, #004d4d 100%)`,
                borderRadius: "4px",
                outline: "none",
                appearance: "none",
                cursor: isPending ? "not-allowed" : "pointer"
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "rgba(168, 240, 240, 0.5)" }}>
            <span>0.5x (Slower)</span>
            <span>1.0x (Normal)</span>
            <span>2.0x (Faster)</span>
          </div>
        </div>

        {/* Responsiveness Slider */}
        <div style={{ marginBottom: "24px" }}>
          <label
            htmlFor="responsiveness"
            style={{ fontSize: "14px", lineHeight: "20px", color: "#A8F0F0", marginBottom: "8px" }}
            className="font-medium block"
          >
            Responsiveness: <span style={{ color: "#FFC300" }}>{responsiveness.toFixed(2)}</span>
          </label>
          <div style={{ position: "relative", marginBottom: "8px" }}>
            <input
              type="range"
              id="responsiveness"
              name="responsiveness"
              min="0"
              max="1"
              step="0.05"
              value={responsiveness}
              onChange={(e) => setResponsiveness(parseFloat(e.target.value))}
              disabled={isPending}
              style={{
                width: "100%",
                height: "8px",
                background: `linear-gradient(to right, #FFC300 0%, #FFC300 ${responsiveness * 100}%, #004d4d ${responsiveness * 100}%, #004d4d 100%)`,
                borderRadius: "4px",
                outline: "none",
                appearance: "none",
                cursor: isPending ? "not-allowed" : "pointer"
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "rgba(168, 240, 240, 0.5)" }}>
            <span>0 (Slower)</span>
            <span>1 (Instant)</span>
          </div>
        </div>

        {/* Interruption Sensitivity Slider */}
        <div style={{ marginBottom: "24px" }}>
          <label
            htmlFor="interruption_sensitivity"
            style={{ fontSize: "14px", lineHeight: "20px", color: "#A8F0F0", marginBottom: "8px" }}
            className="font-medium block"
          >
            Interruption Sensitivity: <span style={{ color: "#FFC300" }}>{interruptionSensitivity.toFixed(2)}</span>
          </label>
          <div style={{ position: "relative", marginBottom: "8px" }}>
            <input
              type="range"
              id="interruption_sensitivity"
              name="interruption_sensitivity"
              min="0"
              max="1"
              step="0.05"
              value={interruptionSensitivity}
              onChange={(e) => setInterruptionSensitivity(parseFloat(e.target.value))}
              disabled={isPending}
              style={{
                width: "100%",
                height: "8px",
                background: `linear-gradient(to right, #FFC300 0%, #FFC300 ${interruptionSensitivity * 100}%, #004d4d ${interruptionSensitivity * 100}%, #004d4d 100%)`,
                borderRadius: "4px",
                outline: "none",
                appearance: "none",
                cursor: isPending ? "not-allowed" : "pointer"
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "rgba(168, 240, 240, 0.5)" }}>
            <span>0 (Never)</span>
            <span>1 (Easily)</span>
          </div>
        </div>

        {/* Voice Temperature Slider */}
        <div style={{ marginBottom: "24px" }}>
          <label
            htmlFor="voice_temperature"
            style={{ fontSize: "14px", lineHeight: "20px", color: "#A8F0F0", marginBottom: "8px" }}
            className="font-medium block"
          >
            Voice Temperature: <span style={{ color: "#FFC300" }}>{voiceTemperature.toFixed(1)}</span>
          </label>
          <div style={{ position: "relative", marginBottom: "8px" }}>
            <input
              type="range"
              id="voice_temperature"
              name="voice_temperature"
              min="0"
              max="2"
              step="0.1"
              value={voiceTemperature}
              onChange={(e) => setVoiceTemperature(parseFloat(e.target.value))}
              disabled={isPending}
              style={{
                width: "100%",
                height: "8px",
                background: `linear-gradient(to right, #FFC300 0%, #FFC300 ${(voiceTemperature / 2) * 100}%, #004d4d ${(voiceTemperature / 2) * 100}%, #004d4d 100%)`,
                borderRadius: "4px",
                outline: "none",
                appearance: "none",
                cursor: isPending ? "not-allowed" : "pointer"
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "rgba(168, 240, 240, 0.5)" }}>
            <span>0 (Stable)</span>
            <span>1 (Default)</span>
            <span>2 (Variable)</span>
          </div>
        </div>

        {/* Volume Slider */}
        <div style={{ marginBottom: "32px" }}>
          <label
            htmlFor="volume"
            style={{ fontSize: "14px", lineHeight: "20px", color: "#A8F0F0", marginBottom: "8px" }}
            className="font-medium block"
          >
            Volume: <span style={{ color: "#FFC300" }}>{volume.toFixed(1)}</span>
          </label>
          <div style={{ position: "relative", marginBottom: "8px" }}>
            <input
              type="range"
              id="volume"
              name="volume"
              min="0"
              max="2"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              disabled={isPending}
              style={{
                width: "100%",
                height: "8px",
                background: `linear-gradient(to right, #FFC300 0%, #FFC300 ${(volume / 2) * 100}%, #004d4d ${(volume / 2) * 100}%, #004d4d 100%)`,
                borderRadius: "4px",
                outline: "none",
                appearance: "none",
                cursor: isPending ? "not-allowed" : "pointer"
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "rgba(168, 240, 240, 0.5)" }}>
            <span>0 (Quiet)</span>
            <span>1 (Default)</span>
            <span>2 (Loud)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "16px" }}>
          <Button
            type="submit"
            style={{
              flex: 1,
              height: "48px",
              fontSize: "16px",
              backgroundColor: "#FFC300",
              color: "#001a1a"
            }}
            className="font-semibold hover:bg-[#ffcd1a] transition-all"
            disabled={isPending || charCount > charLimit}
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Updating Agent...
              </span>
            ) : (
              'Save Configuration'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            style={{
              height: "48px",
              paddingLeft: "24px",
              paddingRight: "24px",
              borderColor: "#004d4d",
              color: "#A8F0F0"
            }}
            className="hover:bg-[#004d4d] transition-all"
            onClick={handleReset}
            disabled={isPending}
          >
            Reset
          </Button>
        </div>
      </form>

    </div>
  )
}
