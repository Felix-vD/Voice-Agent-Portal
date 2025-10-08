# Voice Agent Portal

A modern web-based admin portal for managing Retell AI voice agent configurations with persistent user settings and real-time updates.

## 🚀 Features

- **Secure Authentication** - Supabase authentication with email verification
- **Voice Agent Configuration** - Configure voice speed, responsiveness, interruption sensitivity, temperature, and volume
- **Prompt Management** - Update your AI agent's behavior with custom prompts
- **Persistent Settings** - User-specific settings saved to Supabase database
- **Real-time Updates** - Changes pushed directly to Retell AI APIs
- **Smart State Management** - Track unsaved changes with intelligent save button
- **Error Handling** - Comprehensive validation and user-friendly error messages

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Retell AI account with API access

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Felix-vD/Voice-Agent-Portal.git
cd Voice-Agent-Portal
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- Next.js 15 (App Router with Turbopack)
- React 19
- Supabase SSR (`@supabase/ssr`) and Supabase JS client
- Tailwind CSS v4
- Radix UI components (for UI elements)
- TypeScript 5

**Note**: No additional manual installations are needed. All dependencies are specified in `package.json`.

### 3. Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Retell AI Configuration
RETELL_API_KEY=your_retell_api_key
RETELL_AGENT_ID=your_retell_agent_id
RETELL_LLM_ID=your_retell_llm_id
```

#### How to Get Credentials:

**Supabase:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
5. Copy `anon/public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Retell AI:**
1. Go to [Retell AI Dashboard](https://app.retellai.com/)
2. Navigate to Settings → API Keys → Copy API Key → `RETELL_API_KEY`
3. Go to Agents → Select your agent → Copy Agent ID → `RETELL_AGENT_ID`
4. Go to Response Engine → Select your LLM → Copy LLM ID → `RETELL_LLM_ID`

### 4. Database Setup

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create user agent settings table
CREATE TABLE user_agent_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE user_agent_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own settings
CREATE POLICY "Users can manage their own settings" ON user_agent_settings
  FOR ALL USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_user_agent_settings_user_id ON user_agent_settings(user_id);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_agent_settings_updated_at 
    BEFORE UPDATE ON user_agent_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

### 5. Configure Email Templates (Optional)

For email verification, you can customize the templates in `email-templates/` and upload them to Supabase:

1. Go to Supabase Dashboard → Authentication → Email Templates
2. Customize the templates as needed
3. Use the color palette from the templates provided

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## 📁 Project Structure

```
voice-agent-portal/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/
│   │   │   └── agent/
│   │   │       └── update/       # API endpoint for updating agent
│   │   ├── auth/
│   │   │   └── callback/         # Supabase auth callback
│   │   ├── home/                 # Protected dashboard page
│   │   ├── login/                # Login page
│   │   ├── signup/               # Signup page
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Root redirect
│   │   └── globals.css           # Global styles
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthForm.tsx      # Reusable auth form (login/signup)
│   │   ├── voice-agent/
│   │   │   └── VoiceAgentForm.tsx # Voice agent configuration form
│   │   └── ui/                   # UI components (button, input, etc.)
│   │
│   ├── lib/
│   │   └── supabase/             # Supabase client utilities
│   │       ├── client.ts         # Browser client
│   │       ├── server.ts         # Server client
│   │       └── middleware.ts     # Auth middleware utility
│   │
│   ├── services/
│   │   └── settings.service.ts   # Supabase settings operations
│   │
│   ├── types/
│   │   ├── agent.ts              # Retell API types
│   │   └── settings.ts           # Settings types & defaults
│   │
│   ├── utils/
│   │   └── settings-helpers.ts   # Validation & comparison utilities
│   │
│   └── middleware.ts             # Next.js middleware (route protection)
│
├── email-templates/              # Email verification templates
├── public/                       # Static assets
├── .env.local                    # Environment variables (create this)
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
└── README.md                     # This file
```

## 🔑 Key Technologies

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **External API**: Retell AI
- **State Management**: React Hooks
- **Form Handling**: Native React

## 📚 Documentation

- [`RETELL_SETUP.md`](./RETELL_SETUP.md) - Detailed Retell AI integration guide
- [`SETTINGS_PERSISTENCE.md`](./SETTINGS_PERSISTENCE.md) - Settings architecture and implementation
- [`DEBUG_PROMPT_ISSUE.md`](./DEBUG_PROMPT_ISSUE.md) - Debugging guide for prompt issues
- [`email-templates/README.md`](./email-templates/README.md) - Email template setup

## 🎯 Usage

### First Time Setup

1. **Sign Up**: Create an account at `/signup`
2. **Verify Email**: Check your email for verification link
3. **Log In**: Sign in at `/login`
4. **Configure Agent**: Update settings on `/home`
5. **Save**: Changes automatically persist to your account

### Managing Settings

1. **Prompt**: Enter your agent's behavior instructions (required, min 10 chars)
2. **Language**: Select the language for speech recognition
3. **Voice**: Choose from available ElevenLabs voices
4. **Sliders**: Adjust voice speed, responsiveness, interruption sensitivity, temperature, and volume
5. **Save**: Click "Save Changes" (only enabled when changes are made)
6. **Discard**: Click "Discard" to revert to last saved state

### Features

- ✅ **Unsaved Changes Indicator**: See when you have unsaved changes
- ✅ **Character Counter**: Track prompt length (max 2000 chars)
- ✅ **Real-time Validation**: Instant feedback on invalid inputs
- ✅ **Error Messages**: Field-specific and general error handling
- ✅ **Loading States**: Visual feedback during operations
- ✅ **Toast Notifications**: Success, error, and info messages

## 🔒 Security Features

- **Row Level Security (RLS)**: Users can only access their own settings
- **Environment Variables**: API keys never exposed to client
- **Session Management**: Secure JWT tokens with HTTPOnly cookies
- **Protected Routes**: Middleware guards authenticated pages
- **Input Validation**: Server-side and client-side validation
- **CORS Protection**: API endpoints require authentication

## 🐛 Troubleshooting

### Common Issues

**"Server configuration error: Missing API key"**
- Check that all environment variables are set in `.env.local`
- Restart dev server after adding variables

**"Failed to load settings"**
- Verify database table was created correctly
- Check RLS policies are enabled
- Ensure user is authenticated

**"Voice not available" error**
- Check that voice ID exists in Retell dashboard
- Some voices may not be available in all regions

**Authentication issues**
- Clear browser cookies
- Check Supabase project is active
- Verify email confirmation was clicked

### Getting Help

1. Check console logs (browser and server)
2. Review documentation files
3. Verify environment variables
4. Test API keys with curl commands

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in project settings
4. Deploy

### Other Platforms

Ensure all environment variables are set in your deployment platform's settings.

## 📈 Performance

- **Initial Load**: ~170KB (including all components)
- **Middleware**: ~77KB
- **Database Queries**: Single query on page load
- **API Calls**: Parallel requests to Retell APIs
- **Caching**: Supabase client-side caching enabled

## 🧪 Testing

Currently no automated tests. Manual testing checklist:

- [ ] Sign up new user
- [ ] Email verification
- [ ] Login
- [ ] Load default settings
- [ ] Modify settings
- [ ] Save settings
- [ ] Reload page (settings should persist)
- [ ] Test all sliders
- [ ] Test all dropdowns
- [ ] Test validation errors
- [ ] Test Retell API integration
- [ ] Logout
- [ ] Login again (settings should load)


## 📝 License

MIT License - Feel free to use this project as a template.



