# Spotify Podcast AppleScript Automation

This directory contains an AppleScript for automating Spotify podcast playback on macOS with precise timestamp seeking.

## Script: `spotify_play_podcast.scpt`

A standalone AppleScript that controls the Spotify desktop application to play a specific podcast episode at a hardcoded timestamp.

### Features

- ✅ Launches Spotify automatically (or attaches to running instance)
- ✅ Plays a specific podcast episode using Spotify URI
- ✅ Seeks to a precise timestamp with retry logic
- ✅ Verifies playback success with detailed logging
- ✅ Handles timing issues gracefully

### Hardcoded Configuration

The script includes the following hardcoded values (modify at the top of the script):

```applescript
property episodeURI : "spotify:episode:7makk4oTQel546B0PZlDM5"
property targetTimestamp : 1935  -- 32 minutes 15 seconds
```

To use a different episode or timestamp:
1. Open [scripts/spotify_play_podcast.scpt](spotify_play_podcast.scpt)
2. Modify the `episodeURI` and `targetTimestamp` properties
3. Save and run

### Requirements

- **macOS** (tested on macOS 14+)
- **Spotify Desktop App** installed
- **Spotify Premium** account (required for playback control API)
- User must be **logged into Spotify**
- Episode must be **available in user's region**

### Usage

#### Run from Terminal

```bash
osascript scripts/spotify_play_podcast.scpt
```

#### Run from Finder

1. Double-click the `.scpt` file in Finder
2. Script Editor will open and run the script

#### Make Executable (Optional)

```bash
chmod +x scripts/spotify_play_podcast.scpt
./scripts/spotify_play_podcast.scpt
```

### How It Works

The script follows a 4-phase execution flow:

#### Phase 1: Launch Spotify
- Checks if Spotify is already running
- Launches Spotify if needed and waits 5 seconds for initialization
- Activates the app window

#### Phase 2: Start Playback
- Executes `play track <URI>` command
- Waits up to 10 seconds for playback to begin
- Verifies player state is "playing"

#### Phase 3: Seek to Timestamp
- Attempts to set `player position` to target timestamp
- Retries up to 10 times with 1-second delays
- Verifies position changed successfully (±5 second tolerance)
- Handles track loading delays automatically

#### Phase 4: Verify Success
- Confirms player state is "playing"
- Checks final position matches target (within tolerance)
- Logs detailed playback information

### Output Example

```
Starting Spotify podcast playback automation...
Episode URI: spotify:episode:7makk4oTQel546B0PZlDM5
Target timestamp: 1935 seconds

=== Phase 1: Launching Spotify ===
Checking if Spotify is running...
Spotify is already running. Activating...
✓ Spotify is ready

=== Phase 2: Starting Playback ===
Starting playback of episode: spotify:episode:7makk4oTQel546B0PZlDM5
Waiting for playback to start...
✓ Playback started successfully

=== Phase 3: Seeking to Timestamp ===
Seeking to timestamp: 1935 seconds (32:15)
Seek attempt 1 of 10...
✓ Successfully seeked to 1935.0 seconds

=== Phase 4: Verifying Playback ===
Verifying playback state...
Player State: playing
Current Track: My Path to Spotify: Women in Engineering
Current Position: 1935.0 seconds (32:15)
Expected Position: 1935 seconds (32:15)
✓ Playback confirmed - episode is playing
✓ Position verified (within tolerance)

✓ Automation completed successfully!
SUCCESS: Episode playing at 1935 seconds
```

### Finding Spotify Episode URIs

#### Method 1: Spotify Desktop App
1. Right-click on a podcast episode
2. Select "Share" → "Copy Episode Link"
3. Extract the episode ID from the URL: `https://open.spotify.com/episode/7makk4oTQel546B0PZlDM5`
4. Format as URI: `spotify:episode:7makk4oTQel546B0PZlDM5`

#### Method 2: Spotify Web Player
1. Open the episode in Spotify Web Player
2. Copy the URL from your browser
3. Extract the episode ID and format as URI

#### Method 3: Convert URL to URI
```bash
# From: https://open.spotify.com/episode/7makk4oTQel546B0PZlDM5
# To:   spotify:episode:7makk4oTQel546B0PZlDM5
```

### Known Limitations

1. **Timing Sensitivity**
   - Spotify requires 1-3 seconds after launch to accept commands
   - Script includes automatic delays to handle this

2. **Track Loading Delay**
   - Seeking may fail if episode metadata isn't fully loaded
   - Retry logic handles this automatically (up to 10 attempts)

3. **Position Accuracy**
   - Player position may have ±1-2 second tolerance
   - Script accepts ±5 second tolerance for verification

4. **Error Details**
   - AppleScript doesn't expose detailed Spotify error messages
   - Errors are logged but may lack specificity

5. **Premium Required**
   - `play track` and `set player position` require Spotify Premium
   - Free accounts cannot use these AppleScript commands

6. **No Episode Validation**
   - Script doesn't verify episode exists before attempting playback
   - Invalid URIs will fail with generic error message

### Troubleshooting

#### "Playback did not start within expected timeframe"
- **Cause**: Episode not available, network issues, or Spotify not responding
- **Solution**: Check episode availability, internet connection, try manual playback first

#### "Failed to seek to timestamp after 10 attempts"
- **Cause**: Episode too short, Spotify not fully loaded, or playback issues
- **Solution**: Verify timestamp is within episode duration, restart Spotify

#### "Expected end of line, etc. but found identifier"
- **Cause**: AppleScript syntax error (usually from manual edits)
- **Solution**: Verify script syntax with `osacompile -o /tmp/test.scpt spotify_play_podcast.scpt`

#### Spotify launches but nothing plays
- **Cause**: Premium account required
- **Solution**: Upgrade to Spotify Premium or use web-based approach

### Technical Details

#### Spotify AppleScript Dictionary

The script uses these Spotify AppleScript commands:

- `play track <URI>` - Start playback of specific episode
- `set player position to <seconds>` - Seek to timestamp
- `player state` - Get current state (playing/paused/stopped)
- `player position` - Get current playback position in seconds
- `name of current track` - Get currently playing track name

#### Retry Strategy

The seek operation uses exponential retry because:
1. Spotify needs time to load track metadata
2. First seek attempt often fails immediately after `play track`
3. Position updates may lag slightly
4. 10 retries with 1-second delays = max 10 seconds wait time

### Integration with Web App

This AppleScript is independent of the Next.js web application in this repository. The web app uses:
- Spotify Web API (browser-based)
- Spotify Web Playback SDK (browser-based)

This script uses:
- Spotify Desktop App AppleScript API (native macOS)

Both approaches can control Spotify playback, but they use different APIs and cannot directly communicate with each other.

### License

MIT License - Same as parent project

### Changelog

- **2026-01-07**: Initial implementation
  - 4-phase execution flow
  - Retry logic for seeking
  - Comprehensive logging
  - Hardcoded episode and timestamp
