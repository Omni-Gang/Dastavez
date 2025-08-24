# Collaborative Editor with NextAuth Authentication

A real-time collaborative document editor built with Next.js, Y.js, and NextAuth.js for authentication.

## Features

- **Real-time Collaboration**: Multiple users can edit documents simultaneously
- **Authentication**: Secure sign-in with Google and GitHub OAuth
- **Modern UI**: Clean, responsive interface with Tailwind CSS
- **Document Export**: Export documents as text files
- **User Presence**: See who's currently editing the document
- **Undo/Redo**: Full history support for collaborative editing

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Authentication**: NextAuth.js v4
- **Real-time**: Y.js, y-websocket, y-prosemirror
- **Editor**: ProseMirror
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   cd client
   npm install
   ```

3. Set up environment variables by creating a `.env.local` file:

   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-key-here
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GITHUB_ID=your-github-client-id
   GITHUB_SECRET=your-github-client-secret
   ```

4. Set up OAuth providers (see `NEXTAUTH_SETUP.md` for detailed instructions)

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Authentication Setup

See `NEXTAUTH_SETUP.md` for detailed instructions on setting up Google and GitHub OAuth providers.

## Usage

1. Visit the application and sign in with your Google or GitHub account
2. Start editing the document - changes are saved automatically
3. Share the URL with others to collaborate in real-time
4. Use the export button to download the document as a text file

## Project Structure

```
client/
├── src/
│   ├── app/
│   │   ├── api/auth/[...nextauth]/route.ts  # NextAuth API route
│   │   ├── auth/                            # Authentication pages
│   │   │   ├── signin/page.tsx
│   │   │   ├── signout/page.tsx
│   │   │   └── error/page.tsx
│   │   ├── landing/page.tsx                 # Landing page
│   │   ├── page.tsx                         # Main editor
│   │   ├── layout.tsx                       # Root layout
│   │   └── providers.tsx                    # NextAuth provider
│   ├── components/
│   │   ├── AuthButton.tsx                   # Authentication button
│   │   └── Editor.tsx                       # Editor component
│   └── middleware.ts                        # Route protection
├── NEXTAUTH_SETUP.md                        # Authentication setup guide
└── package.json
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
