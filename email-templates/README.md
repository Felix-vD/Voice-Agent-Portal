# Email Templates for Supabase

Beautiful email templates designed with the outofhours.ai color palette (dark theme with purple/indigo gradients).

## 📧 Templates Included

1. **confirm-signup.html** - Email verification after signup
2. **magic-link.html** - Passwordless sign-in link
3. **reset-password.html** - Password reset request

## 🎨 Design Features

- **Dark Theme**: `#0a0a0f` background with `#18181b` card backgrounds
- **Gradient Accents**: Purple (`#8b5cf6`) to Indigo (`#6366f1`)
- **Modern Icons**: SVG icons with gradient backgrounds
- **Responsive**: Works across all email clients
- **Accessible**: High contrast text for readability

## 📝 How to Use in Supabase

### 1. Access Email Templates

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **Email Templates**

### 2. Configure Each Template

#### **Confirm Signup Template**

1. Select "Confirm signup" from the template dropdown
2. Copy the contents of `confirm-signup.html`
3. Paste into the HTML editor
4. **Important**: Update the confirmation URL in the template settings to:
   ```
   {{ .SiteURL }}/auth/callback?code={{ .TokenHash }}&type=signup&next=/home
   ```

#### **Magic Link Template**

1. Select "Magic Link" from the template dropdown
2. Copy the contents of `magic-link.html`
3. Paste into the HTML editor
4. Update the confirmation URL to:
   ```
   {{ .SiteURL }}/auth/callback?code={{ .TokenHash }}&type=magiclink&next=/home
   ```

#### **Reset Password Template**

1. Select "Reset password" from the template dropdown
2. Copy the contents of `reset-password.html`
3. Paste into the HTML editor
4. Update the confirmation URL to:
   ```
   {{ .SiteURL }}/auth/callback?code={{ .TokenHash }}&type=recovery&next=/update-password
   ```

### 3. Variables Available

These Supabase variables are automatically replaced in your templates:

- `{{ .ConfirmationURL }}` - The full confirmation/action URL
- `{{ .Token }}` - The OTP token
- `{{ .TokenHash }}` - The hashed token
- `{{ .SiteURL }}` - Your configured site URL
- `{{ .Email }}` - The recipient's email address

## 🎨 Color Palette Used

```css
/* Backgrounds */
--background: #0a0a0f;
--card: #18181b;
--card-alt: #27272a;

/* Text */
--foreground: #e4e4e7;
--muted: #a1a1aa;
--subtle: #71717a;

/* Accents */
--primary: #8b5cf6;
--secondary: #6366f1;
--accent: #a78bfa;

/* Borders */
--border: #27272a;
```

## 🧪 Testing Your Templates

### Test in Supabase Dashboard

1. After saving your template, use the **"Send test email"** button
2. Enter your email address
3. Check your inbox for the styled email

### Test in Your App

1. Sign up with a new email address
2. Check the email you receive
3. Verify the styling and links work correctly

## 📱 Email Client Compatibility

These templates are tested and compatible with:

- ✅ Gmail (Desktop & Mobile)
- ✅ Outlook (Desktop & Mobile)
- ✅ Apple Mail (macOS & iOS)
- ✅ Yahoo Mail
- ✅ ProtonMail
- ✅ Thunderbird
- ✅ Mobile email apps (iOS Mail, Gmail app, etc.)

## 🔧 Customization Tips

### Change the Logo Text

Find this line in each template:
```html
<div style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); ...">
    Voice Agent Portal
</div>
```

Replace "Voice Agent Portal" with your app name.

### Adjust Colors

All colors are inline styles for maximum compatibility. Search and replace:
- `#8b5cf6` (purple) with your primary color
- `#6366f1` (indigo) with your secondary color
- `#0a0a0f` (dark bg) with your background color

### Add Your Logo Image

Replace the SVG icon section with an image:
```html
<img src="https://yourdomain.com/logo.png" 
     alt="Your Logo" 
     width="64" 
     height="64" 
     style="display: block; border-radius: 12px;" />
```

## 🚨 Important Notes

1. **Always use inline styles** in email templates (external CSS doesn't work in most email clients)
2. **Test thoroughly** across different email clients before going live
3. **Keep file sizes small** - avoid large images
4. **Use absolute URLs** for all images and links
5. **Provide text alternatives** for when images don't load

## 📞 Support

If you need to customize these templates further or encounter issues:
1. Check the [Supabase Auth Emails Documentation](https://supabase.com/docs/guides/auth/auth-email-templates)
2. Test your templates using [Litmus](https://www.litmus.com/) or [Email on Acid](https://www.emailonacid.com/)
3. Validate your HTML using [W3C Markup Validator](https://validator.w3.org/)

## 🎉 Preview

The emails feature:
- Gradient brand header
- Icon-based visual hierarchy
- Large, accessible CTA button
- Alternative link for copy/paste
- Security disclaimers
- Professional footer

Enjoy your beautifully branded authentication emails! ✨

