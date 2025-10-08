# Retell AI Integration Setup Guide

## Overview

This application integrates with Retell AI to manage voice agent configurations. Users can update various voice agent parameters through an intuitive form interface.

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# Retell AI Configuration
RETELL_API_KEY=your_retell_api_key_here
RETELL_AGENT_ID=your_agent_id_here
RETELL_LLM_ID=your_llm_id_here

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### How to Get Your Retell Credentials

1. **RETELL_API_KEY**:
   - Go to [Retell AI Dashboard](https://app.retellai.com/)
   - Navigate to Settings → API Keys
   - Create a new API key or copy existing one
   - Paste it in `.env.local`

2. **RETELL_AGENT_ID**:
   - In Retell Dashboard, go to Agents
   - Select your agent or create a new one
   - Copy the Agent ID (format: `16b980523634a6dc504898cda492e939`)
   - Paste it in `.env.local`

3. **RETELL_LLM_ID**:
   - In Retell Dashboard, go to Response Engine
   - Select your LLM or create a new one
   - Copy the LLM ID (format: `llm_1234567890abcdef`)
   - Paste it in `.env.local`

## Configuration Parameters

### 1. Voice Speed
- **Range**: 0.5 - 2.0
- **Default**: 1.0
- **Description**: Controls how fast the agent speaks
- **Usage**: Lower = slower speech, Higher = faster speech

### 2. Responsiveness
- **Range**: 0 - 1
- **Default**: 1.0
- **Description**: How quickly the agent responds to user input
- **Usage**: Higher = replies sooner with tighter turn-taking

### 3. Interruption Sensitivity
- **Range**: 0 - 1
- **Default**: 1.0
- **Description**: How easily the agent can be interrupted
- **Usage**: 0 = never interrupted, 1 = easily interrupted

### 4. Voice Temperature
- **Range**: 0 - 2
- **Default**: 1.0
- **Description**: Variation in voice output (ElevenLabs voices)
- **Usage**: Lower = more stable, Higher = more variety

### 5. Volume
- **Range**: 0 - 2
- **Default**: 1.0
- **Description**: Output loudness of the agent's TTS
- **Usage**: Adjust to control how loud the agent speaks

### 6. Language
- **Type**: String
- **Default**: en-US
- **Options**: en-US, en-GB, es-ES, es-MX, fr-FR, de-DE, it-IT, pt-BR, ja-JP, zh-CN, ko-KR, ar-SA, hi-IN, ru-RU, multilingual
- **Description**: Language for speech recognition and TTS

### 7. Voice ID
- **Type**: String
- **Default**: 11labs-Adrian
- **Options**: Various ElevenLabs voices (Adrian, Aria, Clyde, Emily, Josh, Rachel, Sam)
- **Description**: The specific voice model to use

### 8. Prompt (Optional)
- **Type**: String
- **Max Length**: 2000 characters
- **Description**: Instructions for how the agent should behave

## API Endpoint

### Update Agent Configuration

**Endpoint**: `/api/agent/update`  
**Method**: POST  
**Authentication**: Supabase session required

**Request Body**:
```json
{
  "voice_speed": 1.05,
  "responsiveness": 0.9,
  "interruption_sensitivity": 0.8,
  "voice_temperature": 1.0,
  "volume": 1.2,
  "language": "en-US",
  "voice_id": "11labs-Adrian",
  "prompt": "You are a helpful assistant..."
}
```

**What happens internally**:
1. **Agent Update**: `PATCH /update-agent/{agent_id}` with voice/language/speeds
2. **LLM Update**: `PATCH /update-retell-llm/{llm_id}` with `{"general_prompt": "..."}`

**Success Response** (200):
```json
{
  "success": true,
  "message": "Agent configuration updated successfully",
  "data": { /* Retell API response */ }
}
```

**Error Response** (400/401/500):
```json
{
  "success": false,
  "error": "Error message here"
}
```

## Implementation Details

### Backend (API Route)

Located at: `src/app/api/agent/update/route.ts`

**Features**:
- ✅ Authentication check via Supabase
- ✅ Input validation for all parameters
- ✅ Secure API key handling
- ✅ Proper error handling and logging
- ✅ CORS-compliant
- ✅ TypeScript types

**Security**:
- API keys stored in environment variables (never exposed to client)
- User authentication required
- Input sanitization and validation
- Error messages don't leak sensitive information

### Frontend (Form Component)

Located at: `src/components/voice-agent/VoiceAgentForm.tsx`

**Features**:
- ✅ All 8 configuration parameters
- ✅ Proper input constraints (sliders with correct min/max/step)
- ✅ Real-time validation
- ✅ Loading states
- ✅ Toast notifications
- ✅ Reset to defaults
- ✅ Character counter for prompt
- ✅ Responsive design

**UX Polish**:
- Loading spinner during submission
- Success/error toast notifications
- Disabled state during submission
- Visual feedback on all interactions
- Proper spacing and layout

## Testing

### Test the Integration

1. **Start your dev server**:
   ```bash
   npm run dev
   ```

2. **Log in to your account**

3. **Navigate to home page** (`/home`)

4. **Configure your agent**:
   - Adjust sliders for voice parameters
   - Select language and voice
   - Optionally add a prompt
   - Click "Save Configuration"

5. **Verify the update**:
   - Check console for logs
   - Check toast notifications
   - Verify in Retell Dashboard that agent was updated

### Console Logs

The API logs important events:

```
Sending request to Retell API: { url, payload }
Successfully updated Retell agent
```

Or on error:
```
Retell API error: { status, data }
Error in agent update endpoint: { error }
```

## Troubleshooting

### Common Issues

1. **"Server configuration error: Missing API key"**
   - Check that `RETELL_API_KEY` is set in `.env.local`
   - Restart your dev server after adding env variables

2. **"Server configuration error: Missing Agent ID"**
   - Check that `RETELL_AGENT_ID` is set in `.env.local`
   - Verify the agent ID exists in your Retell Dashboard

3. **"Unauthorized"**
   - User is not logged in
   - Session may have expired

4. **"voice_speed must be between 0.5 and 2"**
   - Frontend validation should prevent this
   - Check that slider constraints are correct

5. **401 from Retell API**
   - API key is invalid or expired
   - Regenerate API key in Retell Dashboard

6. **404 from Retell API**
   - Agent ID doesn't exist or is incorrect
   - Verify agent ID in Retell Dashboard

## Production Deployment

### Vercel

1. Add environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add `RETELL_API_KEY`
   - Add `RETELL_AGENT_ID`

2. Redeploy your application

### Other Platforms

Ensure environment variables are set in your deployment platform's settings.

## Retell API Documentation

- [Update Agent API](https://docs.retellai.com/api-references/update-agent)
- [Authentication](https://docs.retellai.com/api-references/authentication)
- [Voice Configuration](https://docs.retellai.com/guides/voice-configuration)
- [Language Support](https://docs.retellai.com/guides/language-support)

## Support

If you encounter issues:

1. Check console logs (both browser and server)
2. Verify environment variables are set
3. Test API key with a direct Retell API call
4. Check Retell Dashboard for agent status
5. Review Retell API documentation

## Security Best Practices

✅ **DO**:
- Keep API keys in environment variables
- Use server-side API routes for Retell calls
- Validate all inputs
- Log errors for debugging
- Use authentication for all protected routes

❌ **DON'T**:
- Expose API keys in client-side code
- Call Retell API directly from the browser
- Store sensitive data in frontend state
- Skip input validation
- Ignore error handling

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-08

