Implementation Plan: Screenshot Transcript Extractor
Overview
Build a Next.js application that extracts video/podcast transcripts from screenshots using AI, then automates playback and recording to capture the actual transcript text.

Key Features:

Upload screenshots → Extract title/timestamp via Claude Vision API
Aggregate screenshots by video/podcast title
Automate playback in Spotify/YouTube using Puppeteer
Record screen at each timestamp (±1 minute)
Extract audio and transcribe using OpenAI Whisper
Generate markdown transcript files per video
Technology Stack
Frontend
Next.js 15 with App Router
React 19 with Server Components
shadcn/ui components (button, card, toast, progress, table, dialog, badge)
Tailwind CSS for styling
TypeScript for type safety
Backend
Next.js API Routes (server-side processing)
PostgreSQL with Prisma ORM (metadata storage)
Filesystem storage (screenshots, recordings, transcripts)
External Services
Claude Vision API (Anthropic) - screenshot analysis
OpenAI Whisper API - audio transcription
Spotify Web Player - via Puppeteer automation
YouTube - via Puppeteer automation
Automation & Processing
Puppeteer - browser automation for Spotify/YouTube
puppeteer-screen-recorder - screen recording via Chrome DevTools Protocol
ffmpeg - audio extraction from video recordings
Zod - runtime validation
Architecture

┌─────────────────────────────────────────────────────────────┐
│                  NEXT.JS APPLICATION                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Frontend (React Components)                                │
│  ┌────────────────────────────────────────────────────┐   │
│  │  • upload-zone.tsx (drag-drop screenshots)         │   │
│  │  • screenshot-card.tsx (display with metadata)     │   │
│  │  • timestamp-table.tsx (aggregated results)        │   │
│  │  • automation-panel.tsx (trigger recording flow)   │   │
│  │  • transcript-viewer.tsx (view markdown outputs)   │   │
│  └────────────────────────────────────────────────────┘   │
│                           │                                  │
│                           ▼                                  │
│  Backend (API Routes)                                       │
│  ┌────────────────────────────────────────────────────┐   │
│  │  POST /api/upload - Save screenshots to disk       │   │
│  │  POST /api/analyze - Send to Claude Vision API     │   │
│  │  GET /api/timestamps - Aggregated data by video    │   │
│  │  POST /api/automation/run - Trigger Puppeteer      │   │
│  │  GET /api/automation/status - Job progress         │   │
│  │  POST /api/transcribe - Send audio to Whisper      │   │
│  │  GET /api/transcripts - List all markdown files    │   │
│  └────────────────────────────────────────────────────┘   │
│                                                              │
└───────────────────────────┬──────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
  ┌──────────┐      ┌──────────────┐    ┌──────────────┐
  │ Claude   │      │  Puppeteer   │    │   OpenAI     │
  │  Vision  │      │  + Screen    │    │   Whisper    │
  │   API    │      │  Recorder    │    │     API      │
  └──────────┘      └──────────────┘    └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
  ┌──────────────────────────────────────────────────┐
  │         PostgreSQL Database (Prisma)             │
  │  • screenshots (metadata, extracted data)        │
  │  • videos (title, platform, timestamps)          │
  │  • recordings (file paths, status)               │
  │  • transcripts (content, markdown paths)         │
  │  • automation_jobs (progress tracking)           │
  └──────────────────────────────────────────────────┘
                            │
                            ▼
  ┌──────────────────────────────────────────────────┐
  │            Filesystem Storage                     │
  │  /uploads/screenshots/ - Original images         │
  │  /uploads/recordings/ - Video recordings (.webm) │
  │  /uploads/audio/ - Extracted audio files (.mp3)  │
  │  /outputs/transcripts/ - Final markdown files    │
  └──────────────────────────────────────────────────┘
File Structure

spotify-podcast-screenshot-transcript-extractor/
├── app/
│   ├── page.tsx                          # Main dashboard
│   ├── layout.tsx                        # Root layout
│   ├── globals.css                       # Tailwind imports
│   │
│   ├── api/
│   │   ├── upload/route.ts               # Handle screenshot uploads
│   │   ├── analyze/route.ts              # Claude Vision API integration
│   │   ├── timestamps/route.ts           # Get aggregated results
│   │   ├── automation/
│   │   │   ├── run/route.ts              # Start Puppeteer automation
│   │   │   └── status/[jobId]/route.ts   # Check progress
│   │   ├── transcribe/route.ts           # OpenAI Whisper API
│   │   └── transcripts/
│   │       ├── route.ts                  # List all transcripts
│   │       └── [videoId]/route.ts        # Get specific transcript
│   │
│   └── components/
│       ├── upload-zone.tsx               # Drag-drop upload
│       ├── screenshot-card.tsx           # Screenshot display
│       ├── timestamp-table.tsx           # Results table
│       ├── automation-panel.tsx          # Control automation
│       ├── progress-tracker.tsx          # Job progress
│       └── transcript-viewer.tsx         # Display transcripts
│
├── lib/
│   ├── claude-client.ts                  # Claude Vision API wrapper
│   ├── whisper-client.ts                 # OpenAI Whisper wrapper
│   ├── puppeteer-automation.ts           # Core automation logic
│   ├── screen-recorder.ts                # Recording utilities
│   ├── audio-extractor.ts                # ffmpeg audio extraction
│   ├── storage.ts                        # Filesystem operations
│   ├── db.ts                             # Prisma client instance
│   └── utils.ts                          # Helper functions
│
├── prisma/
│   ├── schema.prisma                     # Database schema
│   └── migrations/                       # Migration history
│
├── types/
│   ├── screenshot.ts                     # Screenshot types
│   ├── automation.ts                     # Automation types
│   └── transcript.ts                     # Transcript types
│
├── uploads/                              # Gitignored storage
│   ├── screenshots/
│   ├── recordings/
│   └── audio/
│
├── outputs/
│   └── transcripts/                      # Generated markdown
│
├── components.json                       # shadcn/ui config
├── tailwind.config.ts                    # Tailwind config
├── tsconfig.json                         # TypeScript config
├── next.config.js                        # Next.js config
├── package.json                          # Dependencies
├── .env.example                          # Environment template
├── PRD.md                                # Product Requirements
├── IMPLEMENTATION.md                     # Technical guide
└── README.md                             # Project docs
Data Models (Prisma Schema)

model Screenshot {
  id            String   @id @default(cuid())
  filename      String
  filepath      String
  uploadedAt    DateTime @default(now())
  status        String   @default("pending") // pending, processing, completed, failed

  // Extracted data from Claude Vision API
  platform      String?  // "spotify" or "youtube"
  videoId       String?
  videoTitle    String?
  timestamp     Int?     // timestamp in seconds
  confidence    String?  // high, medium, low

  video         Video?   @relation(fields: [videoId], references: [id])

  @@index([videoId])
  @@index([status])
}

model Video {
  id            String   @id @default(cuid())
  title         String
  platform      String   // "spotify" or "youtube"
  createdAt     DateTime @default(now())

  screenshots   Screenshot[]
  recordings    Recording[]
  transcript    Transcript?

  @@unique([title, platform])
}

model Recording {
  id            String   @id @default(cuid())
  videoId       String
  timestamp     Int      // target timestamp in seconds
  videoPath     String   // path to .webm recording
  audioPath     String?  // path to extracted .mp3
  duration      Int      @default(120) // 120 seconds (2 minutes)
  status        String   @default("pending") // pending, recording, extracting, completed, failed
  createdAt     DateTime @default(now())

  video         Video    @relation(fields: [videoId], references: [id])

  @@index([videoId])
  @@index([status])
}

model Transcript {
  id            String   @id @default(cuid())
  videoId       String   @unique
  content       String   @db.Text
  markdownPath  String   // path to .md file
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  video         Video    @relation(fields: [videoId], references: [id])
}

model AutomationJob {
  id              String   @id @default(cuid())
  status          String   @default("queued") // queued, running, completed, failed
  totalItems      Int
  completedItems  Int      @default(0)
  currentVideo    String?
  currentTimestamp Int?
  errors          Json?
  startedAt       DateTime?
  completedAt     DateTime?
  createdAt       DateTime @default(now())
}
Implementation Phases
Phase 1: Foundation (Days 1-2)
Objective: Set up project infrastructure

Tasks:

Initialize Next.js 15 with TypeScript
Install dependencies:

npm install @prisma/client puppeteer puppeteer-screen-recorder @anthropic-ai/sdk openai zod
npm install -D prisma @types/node tailwindcss postcss autoprefixer
npx shadcn@latest init
Configure Prisma with PostgreSQL
Create .env with required keys:

DATABASE_URL=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
SPOTIFY_USERNAME=
SPOTIFY_PASSWORD=
Set up file storage directories (/uploads, /outputs)
Create database schema and run migrations
Deliverables:

Working Next.js dev server
Database connected
Environment configured
Phase 2: Screenshot Upload & Analysis (Days 3-4)
Objective: Upload screenshots and extract metadata via Claude

Tasks:

Build upload-zone.tsx component with drag-drop (shadcn/ui)
Implement POST /api/upload route:
Save files to /uploads/screenshots/
Create Screenshot records in database
Create lib/claude-client.ts:
Send screenshot to Claude Vision API
Prompt: "Analyze this screenshot and extract: 1) Platform (spotify/youtube), 2) Video/Podcast title, 3) Current timestamp in seconds. Return JSON: {platform, title, timestamp, confidence}"
Implement POST /api/analyze route:
Read screenshot file
Call Claude API
Parse response and update Screenshot record
Build screenshot-card.tsx to display uploads with extracted data
Implement batch processing with progress indicators
Deliverables:

Screenshot upload working
Claude Vision API extracting title/timestamp
UI showing extracted data
Critical Files:

app/api/upload/route.ts
app/api/analyze/route.ts
lib/claude-client.ts
app/components/upload-zone.tsx
Phase 3: Data Aggregation (Day 5)
Objective: Group screenshots by video and display timestamps

Tasks:

Implement GET /api/timestamps route:
Query database for all screenshots
Group by videoTitle
Return: { "Video Title": [123, 456, 789], ... }
Create Video records when screenshots are analyzed
Build timestamp-table.tsx component:
Display video titles
Show all timestamps per video
Allow editing/deletion
Add manual correction UI for misidentified data
Deliverables:

Aggregated timestamp data structure
UI showing organized results by video
Critical Files:

app/api/timestamps/route.ts
app/components/timestamp-table.tsx
Phase 4: Puppeteer Automation - Spotify (Days 6-8)
Objective: Automate Spotify playback at timestamps

Tasks:

Create lib/puppeteer-automation.ts:
Launch headless browser
Navigate to https://open.spotify.com
Login with credentials from .env:

await page.goto('https://accounts.spotify.com/login');
await page.type('#login-username', process.env.SPOTIFY_USERNAME);
await page.type('#login-password', process.env.SPOTIFY_PASSWORD);
await page.click('#login-button');
Wait for redirect to dashboard
Implement search and playback:
Click search button (use [data-testid="search-button"])
Type podcast title
Click first result
Click play button
Navigate to timestamp using player controls
Implement screen recording:
Create lib/screen-recorder.ts
Use puppeteer-screen-recorder
Start recording 60 seconds before target timestamp
Record for 120 seconds (2 minutes total)
Save to /uploads/recordings/
Build POST /api/automation/run route:
Accept { videos: [{title, timestamps}] }
Create AutomationJob record
Process each video sequentially
Update job progress
Error handling:
Retry failed searches (max 3 attempts)
Handle "not found" scenarios
Log errors to AutomationJob.errors
Deliverables:

Working Spotify automation
Screen recordings saved locally
Progress tracking in database
Critical Files:

lib/puppeteer-automation.ts
lib/screen-recorder.ts
app/api/automation/run/route.ts
Phase 5: Puppeteer Automation - YouTube (Days 9-10)
Objective: Add YouTube support to automation

Tasks:

Extend lib/puppeteer-automation.ts:
Detect platform from Video.platform field
If YouTube:
Navigate to https://www.youtube.com
Search for video title
Click first result
Parse timestamp and navigate using player seek bar:

// Click on video to reveal controls
await page.click('video');
// Use YouTube's URL hash for precise seeking
await page.goto(currentUrl + `&t=${timestamp}s`);
Handle YouTube's cookie consent popup
Test with various YouTube video types (podcasts, interviews, etc.)
Update automation-panel.tsx to show platform-specific status
Deliverables:

YouTube automation working
Both platforms supported in single flow
Critical Files:

lib/puppeteer-automation.ts (updated)
Phase 6: Audio Extraction (Day 11)
Objective: Extract audio from video recordings

Tasks:

Install ffmpeg:

npm install fluent-ffmpeg
npm install -D @types/fluent-ffmpeg
Create lib/audio-extractor.ts:

import ffmpeg from 'fluent-ffmpeg';

async function extractAudio(videoPath: string, outputPath: string) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .output(outputPath)
      .audioCodec('libmp3lame')
      .audioBitrate('128k')
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}
Update Recording workflow:
After recording completes, extract audio
Save to /uploads/audio/
Update Recording.audioPath
Deliverables:

Audio files extracted from recordings
MP3 files ready for transcription
Critical Files:

lib/audio-extractor.ts
Phase 7: OpenAI Whisper Transcription (Days 12-13)
Objective: Convert audio to text using Whisper

Tasks:

Create lib/whisper-client.ts:

import OpenAI from 'openai';
import fs from 'fs';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function transcribeAudio(audioPath: string): Promise<string> {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: "whisper-1",
    response_format: "text",
    language: "en"
  });
  return transcription;
}
Implement POST /api/transcribe route:
Accept Recording ID
Read audio file
Send to Whisper API
Store transcript text in database
Handle large audio files (Whisper has 25MB limit):
If file > 25MB, split into chunks
Transcribe each chunk
Concatenate results
Add retry logic with exponential backoff
Deliverables:

Whisper API integration working
Transcripts stored in database
Critical Files:

lib/whisper-client.ts
app/api/transcribe/route.ts
Phase 8: Markdown Generation (Day 14)
Objective: Generate formatted markdown transcript files

Tasks:

Create markdown formatting utility in lib/utils.ts:

function generateMarkdown(video: Video, recordings: Recording[]) {
  const content = `# ${video.title}

**Platform:** ${video.platform}
**Generated:** ${new Date().toISOString()}

---

${recordings.map(r => `
## Timestamp: ${formatTimestamp(r.timestamp)}

${r.transcript}

---
`).join('\n')}
`;
  return content;
}
Implement POST /api/transcripts/generate route:
Query all recordings for a video
Generate markdown content
Save to /outputs/transcripts/{video-id}.md
Create Transcript record
Build transcript-viewer.tsx:
Display formatted transcript
Download button for markdown file
Copy to clipboard functionality
Deliverables:

Markdown files generated per video
UI to view and download transcripts
Critical Files:

app/api/transcripts/generate/route.ts
app/components/transcript-viewer.tsx
Phase 9: UI Polish & Error Handling (Days 15-16)
Objective: Production-ready user experience

Tasks:

Add loading states:
Upload progress bars
Analysis spinners
Automation progress tracker (shadcn/ui Progress component)
Toast notifications (shadcn/ui Toast):
Success messages
Error alerts
Info notifications
Error handling:
Try-catch blocks in all API routes
User-friendly error messages
Retry mechanisms for API failures
Responsive design:
Mobile-friendly layout
Touch-friendly controls
Dark mode support (shadcn/ui default)
Deliverables:

Polished UI with loading states
Comprehensive error handling
Responsive design
Phase 10: Testing & Documentation (Days 17-18)
Objective: Ensure reliability and maintainability

Tasks:

Test screenshot analysis:
Various Spotify screenshot formats
Various YouTube screenshot formats
Edge cases (cropped, low quality, multiple languages)
Test automation:
Different podcast/video types
Long titles, special characters
Videos not found scenarios
Test transcription:
Different audio qualities
Background noise handling
Multiple speakers
Write PRD.md (see outline below)
Write IMPLEMENTATION.md (see outline below)
Update README.md with usage instructions
Create .env.example with all required variables
Deliverables:

Tested application
Complete documentation (PRD.md, IMPLEMENTATION.md, README.md)
Critical Files to Create/Modify
prisma/schema.prisma - Database schema with Screenshot, Video, Recording, Transcript, AutomationJob models

lib/claude-client.ts - Claude Vision API wrapper for screenshot analysis

lib/whisper-client.ts - OpenAI Whisper API wrapper for transcription

lib/puppeteer-automation.ts - Core automation logic for Spotify and YouTube

lib/screen-recorder.ts - Screen recording using puppeteer-screen-recorder

lib/audio-extractor.ts - Audio extraction using ffmpeg

app/api/upload/route.ts - Screenshot upload endpoint

app/api/analyze/route.ts - Claude Vision API integration endpoint

app/api/automation/run/route.ts - Puppeteer automation trigger

app/api/transcribe/route.ts - Whisper transcription endpoint

PRD.md - Product Requirements Document (see structure below)

IMPLEMENTATION.md - Technical Implementation Guide (see structure below)

Environment Variables (.env)

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/transcript_extractor"

# Claude Vision API (Anthropic)
ANTHROPIC_API_KEY="sk-ant-..."

# OpenAI Whisper API
OPENAI_API_KEY="sk-..."

# Spotify Credentials (hardcoded for automation)
SPOTIFY_USERNAME="your-email@example.com"
SPOTIFY_PASSWORD="your-password"

# Optional: YouTube credentials (if needed for age-restricted content)
YOUTUBE_EMAIL=""
YOUTUBE_PASSWORD=""

# Storage paths (optional, defaults shown)
UPLOAD_DIR="./uploads"
OUTPUT_DIR="./outputs"
PRD.md Structure
The Product Requirements Document will include:

1. Executive Summary
Problem: Manual transcript extraction from screenshots is time-consuming
Solution: AI-powered screenshot analysis + automated recording & transcription
Target users: Researchers, content creators, students
Success metrics: 95%+ accuracy, <10 min processing time for 10 videos
2. Goals & Objectives
Primary: Automate transcript extraction from video screenshots
Secondary: Support batch processing, multiple platforms
Non-goals: Real-time processing, mobile app, collaborative features
3. User Stories
As a researcher, I want to upload podcast screenshots and get accurate transcripts
As a student, I want to extract quotes from specific moments in educational videos
As a content creator, I want to compile highlight transcripts from multiple sources
4. Functional Requirements
FR-1 through FR-18 (screenshot upload, analysis, automation, recording, transcription, UI)
5. Non-Functional Requirements
Performance, scalability, reliability, security
6. Technical Constraints
Must use Next.js, Claude Vision, OpenAI Whisper, Puppeteer
Local storage only (no cloud)
7. Data Models
Entity diagrams and relationships
8. Security & Privacy
Credential storage, API key management, file access controls
9. Success Metrics
Analysis accuracy, automation success rate, processing time, user satisfaction
10. Future Enhancements
Additional platforms (Apple Podcasts, SoundCloud)
Real-time monitoring
Cloud storage
Collaborative features
IMPLEMENTATION.md Structure
The Technical Implementation Guide will include:

1. Overview
Architecture summary
Technology stack rationale
Development environment setup
2. Prerequisites
Node.js 18+, PostgreSQL 14+, ffmpeg
API keys: Claude, OpenAI
Credentials: Spotify account
3. Setup Instructions
Clone, install dependencies, configure .env, run migrations
4. Architecture Deep Dive
Frontend architecture (RSC vs Client Components)
Backend architecture (API routes, database patterns)
External integrations (Claude, Whisper, Puppeteer)
5. Database Schema
Detailed model explanations
Relationships and foreign keys
Indexes and optimization
6. API Endpoints
Full documentation for each endpoint
Request/response schemas
Error codes
7. Core Implementation Details
7.1 Claude Vision Integration
Authentication setup
Prompt engineering for accurate extraction
Response parsing and validation
Error handling and retries
7.2 Puppeteer Automation
Browser launch configuration
Spotify Web Player navigation strategy
YouTube navigation strategy
Timestamp seeking algorithms
Error recovery patterns
7.3 Screen Recording
Recording configuration (resolution, codec)
Timing precision (1 min before/after)
File storage and naming conventions
7.4 Audio Extraction
ffmpeg command configuration
Quality settings
Error handling
7.5 OpenAI Whisper Integration
API authentication
File size limits and chunking strategy
Response parsing
Cost optimization
8. File Storage Strategy
Directory structure
Naming conventions
Cleanup policies
Backup recommendations
9. Error Handling
Common error scenarios
Retry logic patterns
User notifications
Logging strategy
10. Testing Strategy
Unit tests for utilities
Integration tests for API routes
E2E tests for automation flow
Manual testing checklist
11. Performance Optimization
Database query optimization
Concurrent processing limits
Memory management
Rate limiting
12. Deployment
Production build instructions
Environment configuration
Hosting recommendations (Vercel, Railway)
Monitoring and logging
13. Troubleshooting
Common issues and solutions
Debug mode instructions
Support resources
14. Code Examples
Complete Puppeteer automation script
Claude API integration example
Markdown generation utility
Verification & Testing
End-to-End Test Scenario
Objective: Verify complete flow from screenshot upload to markdown output

Steps:

Screenshot Upload

Upload 3 screenshots of different timestamps from same Spotify podcast
Upload 2 screenshots from a YouTube video
Verify files saved to /uploads/screenshots/
Verify Screenshot records created in database
Analysis

Trigger analysis for all 5 screenshots
Verify Claude Vision API extracts correct:
Platform (spotify/youtube)
Titles (should group by video)
Timestamps (in seconds)
Verify Video records created (2 total)
Verify aggregated data shows: { "Podcast Title": [120, 350, 890], "YouTube Title": [45, 67] }
Automation

Trigger automation for both videos
Verify Puppeteer:
Opens browser
Logs into Spotify
Searches for podcast
Plays and navigates to first timestamp (120s)
Records for 2 minutes
Repeats for timestamps 350s and 890s
Verify YouTube automation works similarly
Verify Recording records created (5 total)
Verify video files exist in /uploads/recordings/
Audio Extraction

Verify ffmpeg extracts audio from all recordings
Verify MP3 files in /uploads/audio/
Verify Recording.audioPath updated
Transcription

Trigger transcription for all recordings
Verify OpenAI Whisper processes audio files
Verify transcript text stored in database
Verify accuracy of transcription
Markdown Generation

Generate markdown for both videos
Verify files created in /outputs/transcripts/
Verify format:

# Podcast Title

**Platform:** spotify
**Generated:** 2026-02-05T...

---

## Timestamp: 00:02:00

[Transcribed text from 1 min before to 1 min after 2:00 mark]

---

## Timestamp: 00:05:50

[Transcribed text from 4:50 to 6:50]

---
Verify download functionality works
Test Data Needed
5-10 test screenshots (mix of Spotify and YouTube)
Expected extraction results for validation
Sample video titles that exist on both platforms
Success Criteria
✅ 100% of screenshots uploaded successfully
✅ 95%+ accuracy on title/timestamp extraction
✅ 90%+ success rate on automation (accounting for network issues)
✅ All recordings captured correctly (2 min duration)
✅ Audio extraction works for all recordings
✅ Whisper transcription completes without errors
✅ Markdown files generated with proper formatting
✅ Total processing time <15 minutes for 5 videos
Dependencies (package.json)

{
  "name": "spotify-podcast-screenshot-transcript-extractor",
  "version": "1.0.0",
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@prisma/client": "^6.0.0",
    "puppeteer": "^23.0.0",
    "puppeteer-screen-recorder": "^3.0.6",
    "@anthropic-ai/sdk": "^0.30.0",
    "openai": "^4.67.0",
    "fluent-ffmpeg": "^2.1.3",
    "zod": "^3.23.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/fluent-ffmpeg": "^2.1.27",
    "typescript": "^5.6.0",
    "prisma": "^6.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
Key Design Decisions
1. Why Backend API Routes for Automation?
Puppeteer requires Node.js (cannot run in browser)
Credentials must stay server-side for security
Better resource management and cleanup
Avoids CORS issues
2. Why PostgreSQL + Filesystem?
Database: Fast queries, relationships, state management
Filesystem: Efficient storage for large binary files (videos, audio)
Prisma ORM: Type-safe database access with TypeScript
3. Why OpenAI Whisper over other services?
High accuracy (state-of-the-art transcription)
Simple API (no complex setup)
Supports multiple languages
Cost-effective for moderate usage
4. Why Extract Audio First?
Smaller file sizes (faster uploads to Whisper)
Whisper only needs audio, not video
Reduces API costs
Faster processing
5. Why Sequential Processing?
Prevents browser resource exhaustion
Easier error handling and debugging
Clear progress tracking
Respects platform rate limits
Risk Mitigation
Risk 1: Spotify/YouTube UI Changes
Mitigation:

Use stable selectors (data-testid, aria-label)
Implement robust retry logic
Allow manual fallback for failed searches
Version-pin Puppeteer and update carefully
Risk 2: Claude Vision API Accuracy
Mitigation:

Provide clear, detailed prompts
Request confidence scores
Allow manual correction in UI
Show original screenshot alongside extracted data
Risk 3: OpenAI Whisper API Limits
Mitigation:

Implement exponential backoff retry logic
Handle 25MB file size limit with chunking
Monitor API usage and costs
Consider local Whisper installation for high volume
Risk 4: Recording Timing Precision
Mitigation:

Add buffer time before starting recording
Verify player position before recording starts
Use Chrome DevTools Protocol for precise timing
Test with various video types
Risk 5: Storage Disk Space
Mitigation:

Implement automatic cleanup of old files
Compress recordings where possible
Monitor disk usage in UI
Provide manual delete functionality
This plan provides a comprehensive roadmap from greenfield setup to production-ready application, with clear phases, deliverables, and verification steps.