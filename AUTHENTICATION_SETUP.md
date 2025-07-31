# Authentication Setup Guide

This guide will help you set up the complete authentication system for the MCS Health platform, including Google OAuth integration.

## Prerequisites

- Supabase project created
- Google Cloud Console project with OAuth 2.0 credentials
- Environment variables configured

## 1. Database Setup

### Step 1: Run SQL Scripts

Execute the SQL files in your Supabase SQL editor in this order:

1. **`sql/01-users-schema.sql`** - Creates user tables and indexes
2. **`sql/02-security-policies.sql`** - Sets up Row Level Security policies
3. **`sql/03-functions.sql`** - Creates database functions and triggers

### Step 2: Verify Tables

After running the scripts, verify these tables exist:
- `public.profiles`
- `public.user_sessions`
- `public.user_preferences`
- `public.user_activity_log`
- `public.oauth_accounts`

## 2. Google OAuth Setup

### Step 1: Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (if not already enabled)
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen:
   - Add your app name: "MCS Health"
   - Add your domain
   - Add scopes: `email`, `profile`, `openid`

### Step 2: Create OAuth 2.0 Client ID

1. Application type: **Web application**
2. Name: "MCS Health Web Client"
3. Authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - `https://your-domain.com` (production)
4. Authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://your-domain.com/auth/callback` (production)
   - `https://your-supabase-project.supabase.co/auth/v1/callback` (Supabase)

### Step 3: Get Credentials

Copy the following from Google Cloud Console:
- **Client ID** 
- **Client Secret**

## 3. Supabase Configuration

### Step 1: Enable Google Provider

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Providers**
3. Find **Google** and toggle it on
4. Enter your Google OAuth credentials:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret
5. Click **Save**

### Step 2: Configure Redirect URLs

In Supabase Dashboard:
1. Go to **Authentication** > **Settings**
2. Add these to **Site URL**:
   - `http://localhost:3000` (development)
   - `https://your-domain.com` (production)
3. Add these to **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback`

## 4. Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: For server-side operations
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Existing API Keys
SWARMS_API_KEY=your_swarms_api_key
```

## 5. Install Dependencies

Run the following command to install the required packages:

```bash
npm install @supabase/auth-helpers-nextjs
```

or if using pnpm:

```bash
pnpm install @supabase/auth-helpers-nextjs
```

## 6. Test the Authentication System

### Step 1: Start the Development Server

```bash
npm run dev
```

### Step 2: Test Email Authentication

1. Go to `http://localhost:3000`
2. Click **Sign In**
3. Try signing up with email and password
4. Check your email for verification link
5. Try signing in with the same credentials

### Step 3: Test Google OAuth

1. Click **Sign In**
2. Click **Continue with Google**
3. Complete the Google OAuth flow
4. Verify you're redirected back to the app
5. Check that your profile is created in the database

## 7. Verify Database Records

After successful authentication, check your Supabase database:

1. Go to **Table Editor** in Supabase Dashboard
2. Check the `profiles` table for your user record
3. Check the `user_activity_log` table for activity records
4. Check the `oauth_accounts` table for OAuth linkage (if using Google)

## 8. Common Issues and Solutions

### Issue: OAuth Redirect URI Mismatch

**Solution**: Ensure all redirect URIs match exactly between Google Cloud Console and Supabase settings.

### Issue: Email Verification Not Working

**Solution**: 
1. Check email provider settings in Supabase
2. Verify SMTP configuration
3. Check spam folder

### Issue: Database Functions Not Working

**Solution**: 
1. Verify all SQL scripts ran successfully
2. Check for any error messages in Supabase logs
3. Ensure RLS policies are properly configured

### Issue: Session Not Persisting

**Solution**: 
1. Check browser cookies are enabled
2. Verify Supabase URL and keys are correct
3. Check for any CORS issues

## 9. Security Considerations

### Row Level Security (RLS)

- All tables have RLS enabled
- Users can only access their own data
- Service role has administrative access

### Session Management

- Sessions are tracked in the `user_sessions` table
- Expired sessions are automatically cleaned up
- Activity logging provides audit trail

### Data Protection

- Medical information is stored securely
- Personal data follows privacy settings
- OAuth tokens are encrypted

## 10. Additional Features

### Profile Management

Users can update their profiles including:
- Basic information (name, email, avatar)
- Medical information (conditions, allergies, medications)
- Insurance information
- Emergency contacts
- Preferences and settings

### Activity Logging

All user actions are logged:
- Authentication events
- Profile updates
- File uploads
- API interactions

### Session Tracking

- Active sessions are tracked
- Users can view and manage their sessions
- Automatic cleanup of expired sessions

## 11. Development vs Production

### Development Setup

- Use `localhost:3000` for all URLs
- Enable debug logging
- Use development OAuth credentials

### Production Setup

- Use your production domain
- Configure proper CORS settings
- Use production OAuth credentials
- Enable security headers
- Set up proper monitoring

## 12. Troubleshooting

### Check Logs

1. Browser console for client-side errors
2. Supabase logs for database issues
3. Vercel/deployment logs for server errors

### Common Commands

```bash
# Check database connection
npm run db:check

# Reset database (development only)
npm run db:reset

# Run migrations
npm run db:migrate
```

## 13. Next Steps

After setting up authentication:

1. Test all authentication flows
2. Customize the user interface
3. Add additional OAuth providers (GitHub, etc.)
4. Implement role-based access control
5. Set up monitoring and analytics
6. Configure backup and recovery

## Support

If you encounter issues:

1. Check the [Supabase Documentation](https://supabase.com/docs/guides/auth)
2. Review the [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
3. Check the project's GitHub issues
4. Contact the development team

---

**Note**: This setup provides a complete authentication system with user profiles, activity logging, and secure session management. The system is designed to be scalable and secure for production use. 