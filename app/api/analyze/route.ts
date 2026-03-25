import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { analyzeScreenshot } from '@/lib/claude-client'
import { z } from 'zod'

const analyzeRequestSchema = z.object({
  screenshotId: z.string().optional(),
  screenshotIds: z.array(z.string()).optional(),
}).refine(
  (data) => data.screenshotId || data.screenshotIds,
  { message: 'Either screenshotId or screenshotIds must be provided' }
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = analyzeRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 }
      )
    }

    // Get screenshot IDs to process
    const ids = parsed.data.screenshotIds || [parsed.data.screenshotId!]

    const results = []

    for (const id of ids) {
      // Get screenshot from database
      const screenshot = await prisma.screenshot.findUnique({
        where: { id },
      })

      if (!screenshot) {
        results.push({
          id,
          error: 'Screenshot not found',
        })
        continue
      }

      // Update status to processing
      await prisma.screenshot.update({
        where: { id },
        data: { status: 'processing' },
      })

      try {
        // Analyze with Claude Vision
        const analysis = await analyzeScreenshot(screenshot.filepath)

        // Find or create Video record if we have a title
        let videoId: string | null = null
        if (analysis.title && analysis.platform) {
          const video = await prisma.video.upsert({
            where: {
              title_platform: {
                title: analysis.title,
                platform: analysis.platform,
              },
            },
            create: {
              title: analysis.title,
              platform: analysis.platform,
            },
            update: {},
          })
          videoId = video.id
        }

        // Update screenshot with extracted data
        const updated = await prisma.screenshot.update({
          where: { id },
          data: {
            status: 'completed',
            platform: analysis.platform,
            videoTitle: analysis.title,
            timestamp: analysis.timestamp,
            confidence: analysis.confidence,
            videoId: videoId,
          },
        })

        results.push({
          id: updated.id,
          platform: updated.platform,
          videoTitle: updated.videoTitle,
          timestamp: updated.timestamp,
          confidence: updated.confidence,
          videoId: updated.videoId,
        })
      } catch (err) {
        // Update status to failed
        await prisma.screenshot.update({
          where: { id },
          data: { status: 'failed' },
        })

        results.push({
          id,
          error: err instanceof Error ? err.message : 'Analysis failed',
        })
      }
    }

    return NextResponse.json({
      message: `Analyzed ${ids.length} screenshot(s)`,
      results,
    })
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze screenshot' },
      { status: 500 }
    )
  }
}
