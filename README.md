# Spotify Podcast Timestamp Player

A collection of tools for playing Spotify podcast episodes at specific timestamps.

## Overview

This project provides two approaches for Spotify podcast playback control:

1. **Web Application** (Next.js) - Browser-based Spotify player with search and fuzzy matching
2. **AppleScript Automation** (macOS) - Native desktop app control for precise timestamp playback

---

## 🌐 Web Application

A Next.js application that allows searching for and playing Spotify podcast episodes starting at specific timestamps.

### Features

- 🔐 Spotify OAuth 2.0 authentication
- 🔍 Podcast show search
- 🎯 Fuzzy episode matching with confidence scoring
- ⏱️ Precise timestamp seeking (HH:MM:SS or MM:SS format)
- 🎵 Spotify Web Playback SDK integration
- ⚡ Built with Next.js 15, React 19, TypeScript, and Tailwind CSS

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **UI**: Tailwind CSS
- **Authentication**: Spotify OAuth 2.0
- **APIs**: Spotify Web API & Web Playback SDK
- **Fuzzy Matching**: fuse.js

### Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

   Add your Spotify API credentials:
   ```env
   SPOTIFY_CLIENT_ID=your_client_id_here
   SPOTIFY_CLIENT_SECRET=your_client_secret_here
   NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/api/auth/callback
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### How It Works

```
User Login → Spotify OAuth
           ↓
Search Show → Spotify Search API
            ↓
Fetch Episodes → Spotify Shows API
               ↓
Fuzzy Match Episode → fuse.js (70%+ confidence)
                    ↓
Initialize Player → Spotify Web Playback SDK
                  ↓
Seek to Timestamp → Playback Control
```

### Project Structure

```
app/
├── api/
│   ├── auth/          # OAuth endpoints
│   ├── search/        # Show search
│   ├── show/          # Episode fetching
│   ├── episodes/      # Fuzzy matching
│   └── playback/      # Player control
├── components/        # React components
├── hooks/            # Custom React hooks
├── lib/              # Utilities & clients
└── types/            # TypeScript definitions
```

### Requirements

- Node.js 18+
- Spotify Premium account
- Spotify Developer App credentials

---

## 🍎 AppleScript Automation (macOS)

A standalone AppleScript for controlling the Spotify desktop application on macOS with precise timestamp seeking.

### Features

- ✅ Launches Spotify automatically (or attaches to running instance)
- ✅ Plays hardcoded podcast episode using Spotify URI
- ✅ Seeks to precise timestamp with retry logic
- ✅ Verifies playback success with detailed logging
- ✅ Handles timing issues gracefully

### Quick Start

**Run the script:**
```bash
osascript scripts/spotify_play_podcast.scpt
```

### Configuration

The script uses hardcoded values that you can customize:

```applescript
property episodeURI : "spotify:episode:7makk4oTQel546B0PZlDM5"
property targetTimestamp : 1935  -- 32 minutes 15 seconds
```

**To customize:**
1. Open [scripts/spotify_play_podcast.scpt](scripts/spotify_play_podcast.scpt)
2. Edit the `episodeURI` and `targetTimestamp` properties
3. Save and run

### Finding Episode URIs

1. Right-click on a podcast episode in Spotify
2. Select "Share" → "Copy Episode Link"
3. Extract episode ID from URL: `https://open.spotify.com/episode/7makk4oTQel546B0PZlDM5`
4. Format as URI: `spotify:episode:7makk4oTQel546B0PZlDM5`

### How It Works

**Phase 1: Launch Spotify**
- Checks if Spotify is running
- Launches if needed, waits for initialization

**Phase 2: Start Playback**
- Executes `play track <URI>` command
- Waits for playback to begin

**Phase 3: Seek to Timestamp**
- Sets `player position` to target
- Retries up to 10 times (handles loading delays)

**Phase 4: Verify Success**
- Confirms playback state
- Verifies position accuracy

### Example Output

```
Starting Spotify podcast playback automation...
Episode URI: spotify:episode:7makk4oTQel546B0PZlDM5
Target timestamp: 1935 seconds

=== Phase 1: Launching Spotify ===
✓ Spotify is ready

=== Phase 2: Starting Playback ===
✓ Playback started successfully

=== Phase 3: Seeking to Timestamp ===
✓ Successfully seeked to 1935.0 seconds

=== Phase 4: Verifying Playback ===
Player State: playing
Current Position: 1935.0 seconds (32:15)
✓ Automation completed successfully!
```

### Requirements

- macOS (tested on macOS 14+)
- Spotify Desktop App installed
- Spotify Premium account
- User logged into Spotify

### Documentation

Full documentation available at [scripts/README.md](scripts/README.md)

---

## Comparison: Web App vs AppleScript

| Feature | Web App | AppleScript |
|---------|---------|-------------|
| **Platform** | Cross-platform (browser) | macOS only |
| **Search** | ✅ Full search & fuzzy matching | ❌ Hardcoded episode |
| **UI** | ✅ Interactive web interface | ❌ Command-line only |
| **Setup** | Complex (OAuth, env vars) | Simple (just run script) |
| **Flexibility** | ✅ User-controlled | ❌ Hardcoded values |
| **Automation** | Limited | ✅ Perfect for scripting |
| **Reliability** | Network-dependent | Native app control |
| **Speed** | Slower (web requests) | ✅ Fast (native API) |

**Use Web App when:**
- You need search functionality
- You want a visual interface
- You're not on macOS
- You want dynamic episode selection

**Use AppleScript when:**
- You need reliable automation
- You're on macOS
- You want fast, scriptable control
- You have hardcoded use cases

---

## Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

### Git Branches

- `master` - Main branch with full application
- `spotify-api-POC` - Feature branch with fuzzy matching improvements

---

## Troubleshooting

### Web App Issues

**"Authentication failed"**
- Verify Spotify credentials in `.env.local`
- Check redirect URI matches Spotify Developer Dashboard
- Ensure Spotify Premium account is used

**"Episode not found"**
- Try adjusting fuzzy match confidence threshold
- Use exact episode name from Spotify
- Check episode availability in your region

### AppleScript Issues

**"Playback did not start"**
- Verify episode URI is valid
- Check Spotify Premium account
- Ensure episode is available in your region

**"Failed to seek to timestamp"**
- Verify timestamp is within episode duration
- Try restarting Spotify
- Reduce target timestamp

Full troubleshooting guide: [scripts/README.md](scripts/README.md)

---

## License

MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## Contributing

This project is maintained by [ColeInc](https://github.com/ColeInc).

### Getting Help

- 📖 Web App Documentation: See this README
- 📖 AppleScript Documentation: [scripts/README.md](scripts/README.md)
- 🐛 Issues: [GitHub Issues](https://github.com/ColeInc/spotify-podcast-screenshot-transcript-extractor/issues)

---

## Changelog

### 2026-01-07
- ✨ Added AppleScript automation for macOS Spotify control
- 📝 Created comprehensive documentation

### 2025-12-27
- 🎉 Initial commit
- ✨ Next.js application with Spotify integration
- 🎯 Fuzzy matching algorithm for episode discovery
- 🔐 OAuth 2.0 authentication flow
