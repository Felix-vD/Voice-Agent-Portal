'use client'

import { useState, useTransition, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { SettingsService } from '@/services/settings.service'
import { DEFAULT_SETTINGS, type AgentSettings } from '@/types/settings'
import { areSettingsEqual, validateSettings, cloneSettings } from '@/utils/settings-helpers'

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
  { value: '11labs-Clyde', label: 'Clyde (Male, Warm)' },
  { value: '11labs-Emily', label: 'Emily (Female, Calm)' },
  { value: '11labs-Josh', label: 'Josh (Male, Casual)' },
  { value: '11labs-Rachel', label: 'Rachel (Female, Professional)' },
  { value: '11labs-Sam', label: 'Sam (Male, Friendly)' },
]

export function VoiceAgentForm() {
  // State management
  const [initialSettings, setInitialSettings] = useState<AgentSettings>(DEFAULT_SETTINGS)
  const [currentSettings, setCurrentSettings] = useState<AgentSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState('')
  
  const [, startTransition] = useTransition()
  const { showToast } = useToast()

  // Calculate if form has unsaved changes
  const isDirty = !areSettingsEqual(initialSettings, currentSettings)

  // Load user settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true)
      try {
        const savedSettings = await SettingsService.loadUserSettings()
        
        if (savedSettings) {
          // User has saved settings - use them
          setInitialSettings(savedSettings)
          setCurrentSettings(cloneSettings(savedSettings))
          console.log('Loaded saved settings')
        } else {
          // New user - use defaults
          setInitialSettings(DEFAULT_SETTINGS)
          setCurrentSettings(cloneSettings(DEFAULT_SETTINGS))
          console.log('Using default settings (new user)')
        }
      } catch (error) {
        console.error('Error loading settings:', error)
        showToast('Failed to load settings', 'error')
        // Fallback to defaults
        setInitialSettings(DEFAULT_SETTINGS)
        setCurrentSettings(cloneSettings(DEFAULT_SETTINGS))
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [showToast])

  // Update helper to maintain immutability
  const updateSetting = <K extends keyof AgentSettings>(
    key: K,
    value: AgentSettings[K]
  ) => {
    setCurrentSettings(prev => ({ ...prev, [key]: value }))
    // Clear field error when user starts typing
    if (fieldErrors[key]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[key]
        return newErrors
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear previous errors
    setFieldErrors({})
    setGeneralError('')

    // Validate settings
    const validationError = validateSettings(currentSettings)
    if (validationError) {
      setGeneralError(validationError)
      showToast(validationError, 'error')
      return
    }

    setIsSaving(true)

    startTransition(async () => {
      try {
        // 1. Update Retell APIs (Agent + LLM)
        const retellResponse = await fetch('/api/agent/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(currentSettings),
        })

        const retellResult = await retellResponse.json()

        if (!retellResponse.ok) {
          // Handle field-specific errors from Retell
          if (retellResult.field && retellResult.error) {
            setFieldErrors({ [retellResult.field]: retellResult.error })
            showToast(`Error: ${retellResult.error}`, 'error')
          } else {
            setGeneralError(retellResult.error || 'Failed to update agent')
            showToast(retellResult.error || 'Failed to update agent', 'error')
          }
          setIsSaving(false)
          return
        }

        // 2. Save to Supabase (for persistence)
        const saveSuccess = await SettingsService.saveUserSettings(currentSettings)
        
        if (!saveSuccess) {
          // Retell updated but Supabase failed - warn but don't fail
          console.warn('Settings saved to Retell but failed to save to Supabase')
          showToast('Settings updated but may not persist', 'warning')
        }

        // 3. Update initial settings to new saved state
        setInitialSettings(cloneSettings(currentSettings))
        setFieldErrors({})
        setGeneralError('')
        showToast('Agent configuration saved successfully!', 'success')
        console.log('Settings saved successfully')

      } catch (error: unknown) {
        setGeneralError('Network error occurred')
        showToast('Failed to save configuration', 'error')
        console.error('Error saving voice agent:', error)
      } finally {
        setIsSaving(false)
      }
    })
  }

  const handleReset = () => {
    setCurrentSettings(cloneSettings(initialSettings))
    setFieldErrors({})
    setGeneralError('')
    showToast('Changes discarded', 'info')
  }

  const charCount = currentSettings.prompt.length
  const charLimit = 2000

  // Show loading state
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '48px' }}>
        <div style={{ color: '#A8F0F0', fontSize: '16px' }}>Loading settings...</div>
      </div>
    )
  }

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
        {isDirty && (
          <p style={{ fontSize: "14px", lineHeight: "20px", color: "#FFC300", marginTop: "8px" }}>
            ● Unsaved changes
          </p>
        )}
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
                Agent Prompt *
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
              value={currentSettings.prompt}
              onChange={(e) => updateSetting('prompt', e.target.value)}
              placeholder="Describe how your voice agent should behave..."
              rows={6}
              maxLength={charLimit}
              required
              disabled={isSaving}
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
                value={currentSettings.language}
                onChange={(e) => updateSetting('language', e.target.value)}
                required
                disabled={isSaving}
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
                value={currentSettings.voice_id}
                onChange={(e) => updateSetting('voice_id', e.target.value)}
                disabled={isSaving}
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
            Voice Speed: <span style={{ color: "#FFC300" }}>{currentSettings.voice_speed.toFixed(2)}x</span>
          </label>
          <div style={{ position: "relative", marginBottom: "8px" }}>
            <input
              type="range"
              id="voice_speed"
              name="voice_speed"
              min="0.5"
              max="2.0"
              step="0.05"
              value={currentSettings.voice_speed}
              onChange={(e) => updateSetting('voice_speed', parseFloat(e.target.value))}
              disabled={isSaving}
              style={{
                width: "100%",
                height: "8px"
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
            Responsiveness: <span style={{ color: "#FFC300" }}>{currentSettings.responsiveness.toFixed(2)}</span>
          </label>
          <div style={{ position: "relative", marginBottom: "8px" }}>
            <input
              type="range"
              id="responsiveness"
              name="responsiveness"
              min="0"
              max="1"
              step="0.05"
              value={currentSettings.responsiveness}
              onChange={(e) => updateSetting('responsiveness', parseFloat(e.target.value))}
              disabled={isSaving}
              style={{
                width: "100%",
                height: "8px"
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
            Interruption Sensitivity: <span style={{ color: "#FFC300" }}>{currentSettings.interruption_sensitivity.toFixed(2)}</span>
          </label>
          <div style={{ position: "relative", marginBottom: "8px" }}>
            <input
              type="range"
              id="interruption_sensitivity"
              name="interruption_sensitivity"
              min="0"
              max="1"
              step="0.05"
              value={currentSettings.interruption_sensitivity}
              onChange={(e) => updateSetting('interruption_sensitivity', parseFloat(e.target.value))}
              disabled={isSaving}
              style={{
                width: "100%",
                height: "8px"
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
            Voice Temperature: <span style={{ color: "#FFC300" }}>{currentSettings.voice_temperature.toFixed(1)}</span>
          </label>
          <div style={{ position: "relative", marginBottom: "8px" }}>
            <input
              type="range"
              id="voice_temperature"
              name="voice_temperature"
              min="0"
              max="2"
              step="0.1"
              value={currentSettings.voice_temperature}
              onChange={(e) => updateSetting('voice_temperature', parseFloat(e.target.value))}
              disabled={isSaving}
              style={{
                width: "100%",
                height: "8px"
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
            Volume: <span style={{ color: "#FFC300" }}>{currentSettings.volume.toFixed(1)}</span>
          </label>
          <div style={{ position: "relative", marginBottom: "8px" }}>
            <input
              type="range"
              id="volume"
              name="volume"
              min="0"
              max="2"
              step="0.1"
              value={currentSettings.volume}
              onChange={(e) => updateSetting('volume', parseFloat(e.target.value))}
              disabled={isSaving}
              style={{
                width: "100%",
                height: "8px"
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
            disabled={!isDirty || isSaving || charCount > charLimit || !currentSettings.prompt.trim()}
          >
            {isSaving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save Changes'
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
            disabled={!isDirty || isSaving}
          >
            Discard
          </Button>
        </div>
      </form>
    </div>
  )
}
