# Spotify Podcast Timestamp Player

A Next.js application that allows you to search for Spotify podcast episodes and play them starting at a specific timestamp using the official Spotify Web API and Web Playback SDK.

## Features

- 🎵 **Official Spotify Integration**: Uses Spotify Web API and Web Playback SDK (no scraping or automation)
- 🔍 **Smart Episode Matching**: Fuzzy search algorithm to find the best matching episode
- ⏱️ **Precise Timestamp Seeking**: Jump to exact positions using HH:MM:SS or MM:SS format
- 🔐 **Secure OAuth Authentication**: Industry-standard OAuth 2.0 flow with PKCE
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS
- ⚡ **Real-time Playback**: Browser-based playback with play/pause controls

## Prerequisites

- **Node.js** 18+ and npm
- **Spotify Premium Account** (required for Web Playback SDK)
- **Spotify Developer Account** (free to create)

## Setup Instructions

### 1. Create Spotify Developer App

1. Go to [https://developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click **"Create app"**
4. Fill in the form:
   - **App name**: "Podcast Timestamp Player" (or any name)
   - **App description**: "Play Spotify podcasts at specific timestamps"
   - **Redirect URI**: `http://localhost:3000/api/auth/callback`
   - **API/SDKs**: Check "Web API" and "Web Playback SDK"
5. Accept the Terms of Service and click **"Save"**
6. Click **"Settings"** to view your credentials
7. Copy your **Client ID** and **Client Secret**

### 2. Install Dependencies

```bash
# Install dependencies
npm install
```

### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Spotify credentials:
   ```env
   SPOTIFY_CLIENT_ID=your_client_id_here
   SPOTIFY_CLIENT_SECRET=your_client_secret_here
   SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/callback
   NEXTAUTH_SECRET=your_random_secret_here
   ```

3. Generate a random secret for `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### 1. Login with Spotify

Click the **"Login with Spotify"** button and authorize the application with the following permissions:
- **streaming**: Play audio in your browser
- **user-read-playback-state**: Monitor playback status
- **user-modify-playback-state**: Control playback and seeking

### 2. Search for a Podcast Episode

Enter the podcast details in the form:

**Podcast Episode Name:**
- Examples:
  - "The Daily Jan 15"
  - "Huberman Lab episode about sleep"
  - "Joe Rogan 2024"
- The app will search for the show and use fuzzy matching to find the best episode

**Timestamp:**
- Formats supported:
  - `MM:SS` (e.g., `12:30` for 12 minutes 30 seconds)
  - `HH:MM:SS` (e.g., `1:23:45` for 1 hour 23 minutes 45 seconds)

### 3. Episode Selection

- **High Confidence Match**: If the fuzzy matching algorithm finds a strong match (>70% confidence), it will automatically start playing
- **Multiple Matches**: If confidence is low, you'll see a list of top 5 matches to choose from

### 4. Playback

Once an episode is selected:
1. The Spotify Web Playback SDK initializes
2. Playback starts at the beginning
3. After 2 seconds, the player seeks to your specified timestamp
4. Use play/pause controls to manage playback

## Architecture

### Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Spotify OAuth 2.0
- **Fuzzy Matching**: fuse.js

### Project Structure

```
├── app/                     # Next.js app directory
│   ├── api/                 # API routes (backend)
│   │   ├── auth/            # OAuth flow (login, callback, token)
│   │   ├── search/          # Show search
│   │   ├── show/            # Episode fetching
│   │   ├── episodes/        # Fuzzy matching
│   │   └── playback/        # Playback control (play, seek, state)
│   ├── page.tsx             # Main application page
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── LoginButton.tsx
│   ├── PodcastSearchForm.tsx
│   ├── EpisodeSelector.tsx
│   └── PodcastPlayer.tsx
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts
│   └── useSpotifyPlayer.ts
├── lib/                     # Utility libraries
│   ├── spotify-auth.ts      # OAuth utilities
│   ├── spotify-client.ts    # API client
│   ├── fuzzy-match.ts       # Episode matching
│   └── timestamp-parser.ts  # Timestamp parsing
└── types/                   # TypeScript types
    ├── spotify.d.ts
    └── global.d.ts
```

### API Flow

```
Frontend → /api/search/show → Spotify Search API
         → /api/show/{id}/episodes → Spotify Shows API
         → /api/episodes/match → Fuzzy matching (fuse.js)
         → /api/playback/play → Spotify Player API
         → /api/playback/seek → Spotify Seek API
```

## Troubleshooting

### "Not authenticated" error

- Make sure you've completed the OAuth flow by clicking "Login with Spotify"
- Check that your `.env.local` has valid `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`

### "Spotify Premium required" error

- The Spotify Web Playback SDK only works with Spotify Premium accounts
- Upgrade your account at [spotify.com/premium](https://spotify.com/premium)

### Player not initializing

- Check browser console for errors
- Ensure you're using a modern browser (Chrome, Firefox, Safari, Edge)
- Try refreshing the page

### Episode not found

- Be more specific in your search (include show name and episode identifier)
- Try different search terms
- If multiple matches appear, select the correct one from the list

### Playback not seeking to timestamp

- Wait for the player to fully initialize (status shows "Ready")
- Ensure the timestamp is within the episode duration
- Check browser console for API errors

## Security Notes

- **Never commit `.env.local`** to version control
- Access tokens are stored in HTTP-only cookies for security
- OAuth state parameter prevents CSRF attacks
- All API routes validate authentication before processing

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `SPOTIFY_REDIRECT_URI` (update to production URL)
   - `NEXTAUTH_SECRET`
4. Update Redirect URI in Spotify Developer Dashboard to match production URL

## Limitations

- **Spotify Premium Required**: Free accounts cannot use Web Playback SDK
- **Browser Compatibility**: Requires modern browser with Web Playback SDK support
- **Episode Availability**: Some episodes may not be available in your region
- **Rate Limiting**: Spotify API has rate limits (usually 429 status code)

## License

MIT License - see [LICENSE](LICENSE) file for details

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- Fuzzy matching by [fuse.js](https://fusejs.io/)

---

**Note**: This application is for educational purposes. Make sure to comply with Spotify's Developer Terms of Service when using this application.
