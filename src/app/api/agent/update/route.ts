import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Helper function to identify which field caused the error
function getErrorField(responseData: Record<string, unknown>): string | null {
  if (!responseData.message || typeof responseData.message !== 'string') return null
  
  const message = responseData.message.toLowerCase()
  
  if (message.includes('voice')) return 'voice_id'
  if (message.includes('language')) return 'language'
  if (message.includes('voice_speed') || message.includes('speed')) return 'voice_speed'
  if (message.includes('responsiveness')) return 'responsiveness'
  if (message.includes('interruption_sensitivity')) return 'interruption_sensitivity'
  if (message.includes('voice_temperature') || message.includes('temperature')) return 'voice_temperature'
  if (message.includes('volume')) return 'volume'
  if (message.includes('prompt')) return 'prompt'
  
  return null
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get request body
    const body = await request.json()

    // Validate required environment variables
    const retellApiKey = process.env.RETELL_API_KEY
    const agentId = process.env.RETELL_AGENT_ID
    const llmId = process.env.RETELL_LLM_ID

    if (!retellApiKey) {
      console.error('RETELL_API_KEY is not set')
      return NextResponse.json(
        { success: false, error: 'Server configuration error: Missing API key' },
        { status: 500 }
      )
    }

    if (!agentId) {
      console.error('RETELL_AGENT_ID is not set')
      return NextResponse.json(
        { success: false, error: 'Server configuration error: Missing Agent ID' },
        { status: 500 }
      )
    }

    if (!llmId) {
      console.error('RETELL_LLM_ID is not set')
      return NextResponse.json(
        { success: false, error: 'Server configuration error: Missing LLM ID' },
        { status: 500 }
      )
    }

    // Validate and sanitize input
    const {
      voice_speed,
      responsiveness,
      interruption_sensitivity,
      voice_temperature,
      volume,
      language,
      voice_id,
      prompt
    } = body

    // Validation
    if (voice_speed !== undefined && (voice_speed < 0.5 || voice_speed > 2)) {
      return NextResponse.json(
        { success: false, error: 'voice_speed must be between 0.5 and 2' },
        { status: 400 }
      )
    }

    if (responsiveness !== undefined && (responsiveness < 0 || responsiveness > 1)) {
      return NextResponse.json(
        { success: false, error: 'responsiveness must be between 0 and 1' },
        { status: 400 }
      )
    }

    if (interruption_sensitivity !== undefined && (interruption_sensitivity < 0 || interruption_sensitivity > 1)) {
      return NextResponse.json(
        { success: false, error: 'interruption_sensitivity must be between 0 and 1' },
        { status: 400 }
      )
    }

    if (voice_temperature !== undefined && (voice_temperature < 0 || voice_temperature > 2)) {
      return NextResponse.json(
        { success: false, error: 'voice_temperature must be between 0 and 2' },
        { status: 400 }
      )
    }

    if (volume !== undefined && (volume < 0 || volume > 2)) {
      return NextResponse.json(
        { success: false, error: 'volume must be between 0 and 2' },
        { status: 400 }
      )
    }

    if (!language || typeof language !== 'string') {
      return NextResponse.json(
        { success: false, error: 'language is required' },
        { status: 400 }
      )
    }

    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Build payload for Agent API (voice/language/speeds/etc.)
    const agentPayload: Record<string, unknown> = {
      voice_speed,
      responsiveness,
      interruption_sensitivity,
      voice_temperature,
      volume,
      language,
    }

    // Add optional fields if provided
    if (voice_id) {
      agentPayload.voice_id = voice_id
    }

    // Build payload for LLM API (prompt only)
    const llmPayload = {
      general_prompt: prompt.trim(),
    }

    // Make requests to both Retell APIs
    const agentUrl = `https://api.retellai.com/update-agent/${agentId}`
    const llmUrl = `https://api.retellai.com/update-retell-llm/${llmId}`
    
    console.log('Sending requests to Retell APIs:', {
      agentUrl,
      llmUrl,
      agentPayload,
      llmPayload: { ...llmPayload, general_prompt: `${prompt.substring(0, 50)}...` }
    })
    
    // Debug: Log full payloads
    console.log('Full payloads being sent:', {
      agent: {
        voice_speed: agentPayload.voice_speed,
        responsiveness: agentPayload.responsiveness,
        interruption_sensitivity: agentPayload.interruption_sensitivity,
        voice_temperature: agentPayload.voice_temperature,
        volume: agentPayload.volume,
        language: agentPayload.language,
        voice_id: agentPayload.voice_id,
      },
      llm: {
        general_prompt: llmPayload.general_prompt,
        prompt_length: llmPayload.general_prompt.length
      }
    })

    // Make both API calls in parallel
    const [agentResponse, llmResponse] = await Promise.all([
      fetch(agentUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${retellApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentPayload),
      }),
      fetch(llmUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${retellApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(llmPayload),
      })
    ])

    const agentData = await agentResponse.json()
    const llmData = await llmResponse.json()

    // Check if either request failed
    if (!agentResponse.ok || !llmResponse.ok) {
      console.error('Retell API error:', {
        agent: {
          status: agentResponse.status,
          data: agentData,
          payload: agentPayload
        },
        llm: {
          status: llmResponse.status,
          data: llmData,
          payload: llmPayload
        }
      })

      // Determine which API failed and parse error
      let humanReadableError = 'Failed to update configuration'
      let errorField = null
      let failedResponse = null
      let failedData = null

      if (!agentResponse.ok) {
        failedResponse = agentResponse
        failedData = agentData
        humanReadableError = 'Failed to update agent settings'
      } else if (!llmResponse.ok) {
        failedResponse = llmResponse
        failedData = llmData
        humanReadableError = 'Failed to update prompt'
        errorField = 'prompt'
      }

      // Log the raw error for debugging
      console.log('Raw Retell API error:', {
        failedApi: !agentResponse.ok ? 'agent' : 'llm',
        status: failedResponse?.status,
        message: failedData?.message,
        error: failedData?.error,
        details: failedData
      })
      
      if (failedData?.message && typeof failedData.message === 'string') {
        const message = failedData.message.toLowerCase()
        
        // Voice ID errors - check for various voice-related error patterns
        if (message.includes('voice') || message.includes('11labs') || message.includes('aria') || message.includes('adrian') || message.includes('voice_id') || message.includes('not found')) {
          humanReadableError = `Voice "${voice_id}" is not available. Please select a different voice.`
          errorField = 'voice_id'
        }
        // Language errors
        else if (message.includes('language') || message.includes('locale')) {
          humanReadableError = `Language "${language}" is not supported. Please select a different language.`
          errorField = 'language'
        }
        // Range errors
        else if (message.includes('voice_speed') || message.includes('speed')) {
          humanReadableError = `Voice speed value ${voice_speed} is out of range. Must be between 0.5 and 2.0.`
          errorField = 'voice_speed'
        } else if (message.includes('responsiveness')) {
          humanReadableError = `Responsiveness value ${responsiveness} is out of range. Must be between 0 and 1.`
          errorField = 'responsiveness'
        } else if (message.includes('interruption_sensitivity')) {
          humanReadableError = `Interruption sensitivity value ${interruption_sensitivity} is out of range. Must be between 0 and 1.`
          errorField = 'interruption_sensitivity'
        } else if (message.includes('voice_temperature') || message.includes('temperature')) {
          humanReadableError = `Voice temperature value ${voice_temperature} is out of range. Must be between 0 and 2.`
          errorField = 'voice_temperature'
        } else if (message.includes('volume')) {
          humanReadableError = `Volume value ${volume} is out of range. Must be between 0 and 2.`
          errorField = 'volume'
        }
        // Prompt errors
        else if (message.includes('prompt') || message.includes('instruction') || message.includes('general_prompt')) {
          humanReadableError = `Prompt error: ${failedData.message}`
          errorField = 'prompt'
        }
        // Authentication errors
        else if (message.includes('unauthorized') || message.includes('forbidden') || message.includes('auth')) {
          humanReadableError = `Authentication failed. Please check your API credentials.`
          errorField = 'auth'
        }
        // Agent/LLM not found
        else if (message.includes('agent') && message.includes('not found')) {
          humanReadableError = `Agent not found. Please check your Agent ID configuration.`
          errorField = 'agent'
        } else if (message.includes('llm') && message.includes('not found')) {
          humanReadableError = `LLM not found. Please check your LLM ID configuration.`
          errorField = 'llm'
        }
        // Check for specific field validation errors
        else if (message.includes('validation') || message.includes('invalid')) {
          // Try to extract field name from error message
          if (message.includes('voice_id') || message.includes('voice')) {
            humanReadableError = `Voice "${voice_id}" is not valid. Please select a different voice.`
            errorField = 'voice_id'
          } else if (message.includes('language')) {
            humanReadableError = `Language "${language}" is not valid. Please select a different language.`
            errorField = 'language'
          } else {
            humanReadableError = `Validation error: ${failedData.message}`
          }
        }
        // Generic fallback
        else {
          humanReadableError = failedData.message
        }
      } else if (failedData?.error && typeof failedData.error === 'string') {
        humanReadableError = failedData.error
      }
      
      // If we still don't have a field, try to guess from the error content
      if (!errorField) {
        const message = typeof failedData?.message === 'string' ? failedData.message : ''
        const error = typeof failedData?.error === 'string' ? failedData.error : ''
        const fullError = (message || error || '').toLowerCase()
        if (fullError.includes('voice') || fullError.includes('11labs')) {
          errorField = 'voice_id'
        } else if (fullError.includes('language')) {
          errorField = 'language'
        } else if (fullError.includes('prompt') || fullError.includes('llm')) {
          errorField = 'prompt'
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: humanReadableError,
          details: failedData,
          field: errorField || getErrorField(failedData || {})
        },
        { status: failedResponse?.status || 500 }
      )
    }

    // Success
    console.log('Successfully updated both Retell agent and LLM')

    return NextResponse.json({
      success: true,
      message: 'Agent configuration and prompt updated successfully',
      data: {
        agent: agentData,
        llm: llmData
      }
    })

  } catch (error: unknown) {
    console.error('Error in agent update endpoint:', error)

    const errorMessage = error instanceof Error ? error.message : 'Internal server error'

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}

