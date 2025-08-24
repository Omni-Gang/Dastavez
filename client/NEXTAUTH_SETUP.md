# NextAuth.js Setup Guide

## Environment Variables

Create a `.env.local` file in the client directory with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
```

## Setting up OAuth Providers

### Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create an OAuth 2.0 Client ID
5. Set the authorized redirect URI to: `http://localhost:3000/api/auth/callback/google`
6. Copy the Client ID and Client Secret to your `.env.local` file

### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - **Application name**: Your app name (e.g., "Collaborative Editor")
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Click "Register application"
5. Copy the Client ID and Client Secret to your `.env.local` file

## Generate NextAuth Secret

You can generate a secure secret using:

```bash
openssl rand -base64 32
```

Or use any secure random string generator.

## Running the Application

1. Install dependencies: `npm install`
2. Set up your environment variables
3. Run the development server: `npm run dev`
4. Visit `http://localhost:3000`

The application will now require authentication before accessing the collaborative editor.
