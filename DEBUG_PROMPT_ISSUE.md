# Debugging LLM Prompt Issue

## Problem
The LLM prompt isn't making it through to Retell AI. Let's debug this step by step.

## Step 1: Check Console Logs

### Backend Logs (Server Console)
When you submit the form, check your terminal/console for these logs:

```bash
# Look for this log:
Sending request to Retell API: { url: '...', payload: { ... } }

# And this detailed log:
Full payload being sent to Retell: {
  voice_speed: 1.0,
  responsiveness: 1.0,
  interruption_sensitivity: 1.0,
  voice_temperature: 1.0,
  volume: 1.0,
  language: 'en-US',
  voice_id: '11labs-Adrian',
  prompt: 'Your actual prompt text here...',
  prompt_length: 150
}
```

**If you see `prompt: undefined` or `prompt_length: 0`**, the issue is in the frontend.

**If you see the prompt in the logs but Retell still doesn't receive it**, the issue is in the API call.

## Step 2: Check Frontend State

### Browser Console
Open browser dev tools (F12) and check:

1. **Network Tab**: Look for the POST request to `/api/agent/update`
2. **Request Payload**: Click on the request and check if `prompt` is in the JSON
3. **Console Tab**: Look for any JavaScript errors

### React State Debugging
Add this temporary code to the form to debug:

```tsx
// Add this after the form state declarations
console.log('Current form state:', {
  prompt,
  language,
  voiceId,
  voiceSpeed,
  responsiveness,
  interruptionSensitivity,
  voiceTemperature,
  volume
})
```

## Step 3: Check Retell Dashboard

### Where to Look in Retell
1. Go to [Retell Dashboard](https://app.retellai.com/)
2. Navigate to your agent
3. Look for these sections:
   - **Agent Settings** → **System Prompt** or **Instructions**
   - **Voice Settings** → **Prompt** or **Behavior**
   - **Advanced Settings** → **LLM Configuration**

### What to Look For
- Is there a "System Prompt" or "Instructions" field?
- Does it show your prompt text?
- Is it empty or showing the old value?

## Step 4: Test with Retell API Directly

### Manual API Test
Use curl or Postman to test the Retell API directly:

```bash
curl -X PATCH "https://api.retellai.com/update-agent/YOUR_AGENT_ID" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "voice_speed": 1.0,
    "responsiveness": 1.0,
    "interruption_sensitivity": 1.0,
    "voice_temperature": 1.0,
    "volume": 1.0,
    "language": "en-US",
    "voice_id": "11labs-Adrian",
    "prompt": "You are a helpful assistant. Please be friendly and professional."
  }'
```

### Check Response
Look for:
- **200 OK**: Success
- **400 Bad Request**: Check the error message
- **401 Unauthorized**: API key issue
- **404 Not Found**: Agent ID issue

## Step 5: Common Issues & Solutions

### Issue 1: Prompt Field Name
**Problem**: Retell might expect a different field name for the prompt.

**Solution**: Check Retell API docs for the correct field name:
- `prompt` ❌
- `system_prompt` ✅
- `instructions` ✅
- `behavior` ✅

### Issue 2: Prompt Length Limits
**Problem**: Prompt might be too long or too short.

**Solution**: Check Retell's prompt length limits:
- Minimum: Usually 10-50 characters
- Maximum: Usually 1000-4000 characters

### Issue 3: Prompt Format
**Problem**: Retell might expect specific prompt formatting.

**Solution**: Try different formats:
```json
// Format 1: Direct prompt
{ "prompt": "You are a helpful assistant." }

// Format 2: System message format
{ "system_prompt": "You are a helpful assistant." }

// Format 3: Instructions format
{ "instructions": "You are a helpful assistant." }
```

### Issue 4: API Version
**Problem**: Using wrong API endpoint or version.

**Solution**: Check if you're using the correct endpoint:
- Current: `https://api.retellai.com/update-agent/{agent_id}`
- Alternative: `https://api.retellai.com/v1/agents/{agent_id}`

## Step 6: Fix the Code

### If Frontend Issue
Check the form submission in `VoiceAgentForm.tsx`:
```tsx
const data: RetellAgentConfig = {
  // ... other fields
  prompt: prompt.trim() || undefined, // Make sure this is correct
}
```

### If Backend Issue
Check the API route in `src/app/api/agent/update/route.ts`:
```tsx
if (prompt) {
  payload.prompt = prompt // Make sure this is correct
}
```

### If Retell API Issue
Update the field name in the payload:
```tsx
// Try different field names
payload.system_prompt = prompt
// or
payload.instructions = prompt
// or
payload.behavior = prompt
```

## Step 7: Test Again

1. **Clear browser cache**
2. **Restart dev server**
3. **Submit form with a simple prompt**: "Hello, I am a test prompt."
4. **Check all logs again**
5. **Check Retell Dashboard**

## Still Not Working?

### Debug Checklist
- [ ] Console shows prompt in frontend state
- [ ] Console shows prompt in API request
- [ ] Console shows prompt in Retell API call
- [ ] Retell API returns 200 OK
- [ ] Retell Dashboard shows updated prompt
- [ ] Test with different field names
- [ ] Test with different prompt lengths
- [ ] Check Retell API documentation for correct field names

### Get Help
If still not working, provide:
1. **Console logs** (frontend and backend)
2. **Network request/response** from browser dev tools
3. **Retell API response** from the manual test
4. **Current prompt value** you're trying to send
5. **Retell Dashboard screenshot** showing the prompt field

---

**Next Steps**: Run through this debugging process and let me know what you find!
