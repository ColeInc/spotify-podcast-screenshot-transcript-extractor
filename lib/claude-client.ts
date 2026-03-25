import Anthropic from '@anthropic-ai/sdk'
import { readFile } from 'fs/promises'
import path from 'path'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export interface ScreenshotAnalysis {
  platform: 'spotify' | 'youtube' | null
  title: string | null
  timestamp: number | null // in seconds
  confidence: 'high' | 'medium' | 'low'
  rawResponse?: string
}

const ANALYSIS_PROMPT = `Analyze this screenshot of a video or podcast player. Extract the following information:

1. **Platform**: Identify if this is Spotify, YouTube, or another platform
2. **Title**: Extract the full video/podcast/episode title
3. **Timestamp**: Find the current playback position and convert it to total seconds

Return your response as JSON in this exact format:
{
  "platform": "spotify" | "youtube" | null,
  "title": "The full title here" | null,
  "timestamp": 123 | null,
  "confidence": "high" | "medium" | "low"
}

Guidelines:
- For timestamp, convert MM:SS or HH:MM:SS format to total seconds (e.g., "2:30" = 150 seconds)
- Set confidence to "high" if all fields are clearly visible
- Set confidence to "medium" if some fields are partially visible or unclear
- Set confidence to "low" if you had to guess or infer values
- If a field cannot be determined, set it to null

Return ONLY the JSON object, no other text.`

export async function analyzeScreenshot(
  filepath: string
): Promise<ScreenshotAnalysis> {
  const buffer = await readFile(filepath)
  const base64 = buffer.toString('base64')

  const ext = path.extname(filepath).toLowerCase()
  let mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' = 'image/png'
  if (ext === '.jpg' || ext === '.jpeg') {
    mediaType = 'image/jpeg'
  } else if (ext === '.gif') {
    mediaType = 'image/gif'
  } else if (ext === '.webp') {
    mediaType = 'image/webp'
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64,
            },
          },
          {
            type: 'text',
            text: ANALYSIS_PROMPT,
          },
        ],
      },
    ],
  })

  const textContent = response.content.find((c) => c.type === 'text')
  const rawResponse = textContent?.type === 'text' ? textContent.text : ''

  try {
    // Extract JSON from the response (handle potential markdown code blocks)
    let jsonStr = rawResponse.trim()
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7)
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3)
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3)
    }
    jsonStr = jsonStr.trim()

    const parsed = JSON.parse(jsonStr)

    return {
      platform: parsed.platform || null,
      title: parsed.title || null,
      timestamp: typeof parsed.timestamp === 'number' ? parsed.timestamp : null,
      confidence: parsed.confidence || 'low',
      rawResponse,
    }
  } catch {
    return {
      platform: null,
      title: null,
      timestamp: null,
      confidence: 'low',
      rawResponse,
    }
  }
}
