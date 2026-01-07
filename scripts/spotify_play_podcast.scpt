(*
	Spotify Podcast Episode Player with Timestamp Seeking

	This AppleScript controls the Spotify desktop application on macOS to:
	1. Launch Spotify (or attach if already running)
	2. Play a specific podcast episode using its Spotify URI
	3. Seek to a precise timestamp within the episode
	4. Verify playback is successful

	HARDCODED VALUES:
	- Episode URI: spotify:episode:7makk4oTQel546B0PZlDM5
	- Target Timestamp: 1935 seconds (32 minutes 15 seconds)

	REQUIREMENTS:
	- macOS with Spotify desktop app installed
	- User logged into Spotify
	- Spotify Premium account (required for playback control)
	- Episode available in user's region

	USAGE:
	Run from Terminal: osascript scripts/spotify_play_podcast.scpt
*)

-- ============================================
-- CONFIGURATION
-- ============================================

-- Hardcoded podcast episode URI (replace with your desired episode)
property episodeURI : "spotify:episode:7makk4oTQel546B0PZlDM5"

-- Hardcoded timestamp in seconds (1935 = 32 minutes 15 seconds)
property targetTimestamp : 1935

-- Retry configuration
property maxRetries : 10
property retryDelay : 1


-- ============================================
-- MAIN EXECUTION
-- ============================================

log "Starting Spotify podcast playback automation..."
log "Episode URI: " & episodeURI
log "Target timestamp: " & targetTimestamp & " seconds"

try
	-- Phase 1: Launch/Activate Spotify
	log ""
	log "=== Phase 1: Launching Spotify ==="
	my launchSpotify()

	-- Phase 2: Start Playback
	log ""
	log "=== Phase 2: Starting Playback ==="
	my playEpisode()

	-- Phase 3: Seek to Timestamp
	log ""
	log "=== Phase 3: Seeking to Timestamp ==="
	my seekToTimestamp()

	-- Phase 4: Verify Success
	log ""
	log "=== Phase 4: Verifying Playback ==="
	my verifyPlayback()

	log ""
	log "✓ Automation completed successfully!"
	return "SUCCESS: Episode playing at " & targetTimestamp & " seconds"

on error errMsg number errNum
	log ""
	log "✗ ERROR: " & errMsg & " (Error " & errNum & ")"
	return "FAILED: " & errMsg
end try


-- ============================================
-- HANDLER: Launch or Activate Spotify
-- ============================================

on launchSpotify()
	log "Checking if Spotify is running..."

	tell application "System Events"
		set spotifyRunning to (name of processes) contains "Spotify"
	end tell

	if spotifyRunning then
		log "Spotify is already running. Activating..."
		tell application "Spotify" to activate
		delay 1
	else
		log "Launching Spotify..."
		tell application "Spotify"
			activate
		end tell

		-- Wait for Spotify to fully initialize
		log "Waiting for Spotify to initialize (5 seconds)..."
		delay 5
	end if

	log "✓ Spotify is ready"
end launchSpotify


-- ============================================
-- HANDLER: Play Episode
-- ============================================

on playEpisode()
	log "Starting playback of episode: " & episodeURI

	tell application "Spotify"
		try
			-- Play the specified episode using its URI
			play track episodeURI
		on error errMsg
			error "Failed to play episode: " & errMsg
		end try
	end tell

	-- Wait for playback to begin
	log "Waiting for playback to start..."
	delay 2

	-- Verify playback has started
	set playbackStarted to false
	repeat 10 times
		tell application "Spotify"
			if player state is playing then
				set playbackStarted to true
				exit repeat
			end if
		end tell
		delay 1
	end repeat

	if playbackStarted then
		log "✓ Playback started successfully"
	else
		error "Playback did not start within expected timeframe"
	end if
end playEpisode


-- ============================================
-- HANDLER: Seek to Timestamp with Retry
-- ============================================

on seekToTimestamp()
	log "Seeking to timestamp: " & targetTimestamp & " seconds (" & my formatTime(targetTimestamp) & ")"

	set seekSuccessful to false
	set attemptCount to 0

	repeat while attemptCount < maxRetries and seekSuccessful is false
		set attemptCount to attemptCount + 1
		log "Seek attempt " & attemptCount & " of " & maxRetries & "..."

		try
			tell application "Spotify"
				-- Attempt to set the player position
				set player position to targetTimestamp

				-- Small delay to allow position to update
				delay 0.5

				-- Verify the position was set correctly (within ±5 seconds tolerance)
				set currentPos to player position
				set positionDiff to my absValue(currentPos - targetTimestamp)

				if positionDiff < 5 then
					set seekSuccessful to true
					log "✓ Successfully seeked to " & currentPos & " seconds"
				else
					log "Position mismatch: current=" & currentPos & ", target=" & targetTimestamp & ", diff=" & positionDiff
				end if
			end tell

		on error errMsg
			log "Seek attempt failed: " & errMsg
		end try

		-- If not successful, wait before retrying
		if not seekSuccessful and attemptCount < maxRetries then
			log "Retrying in " & retryDelay & " second(s)..."
			delay retryDelay
		end if
	end repeat

	if not seekSuccessful then
		error "Failed to seek to timestamp after " & maxRetries & " attempts"
	end if
end seekToTimestamp


-- ============================================
-- HANDLER: Verify Playback
-- ============================================

on verifyPlayback()
	log "Verifying playback state..."

	tell application "Spotify"
		set currentState to player state
		set currentPos to player position
		set currentTrack to name of current track

		log "Player State: " & currentState
		log "Current Track: " & currentTrack
		log "Current Position: " & currentPos & " seconds (" & my formatTime(currentPos) & ")"
		log "Expected Position: " & targetTimestamp & " seconds (" & my formatTime(targetTimestamp) & ")"

		if currentState is playing then
			log "✓ Playback confirmed - episode is playing"
		else
			log "⚠ Warning: Player state is '" & currentState & "' (expected 'playing')"
		end if

		set positionDiff to my absValue(currentPos - targetTimestamp)
		if positionDiff < 5 then
			log "✓ Position verified (within tolerance)"
		else
			log "⚠ Warning: Position drift detected (" & positionDiff & " seconds)"
		end if
	end tell
end verifyPlayback


-- ============================================
-- HELPER: Format Time (seconds to MM:SS)
-- ============================================

on formatTime(totalSeconds)
	set mins to totalSeconds div 60
	set secs to totalSeconds mod 60

	-- Pad seconds with leading zero if needed
	if secs < 10 then
		set secsStr to "0" & secs
	else
		set secsStr to secs as string
	end if

	return (mins as string) & ":" & secsStr
end formatTime


-- ============================================
-- HELPER: Absolute Value
-- ============================================

on absValue(n)
	if n < 0 then
		return -n
	else
		return n
	end if
end absValue
