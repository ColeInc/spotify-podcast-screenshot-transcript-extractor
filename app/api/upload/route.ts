import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { saveScreenshot } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    const results = []

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        results.push({
          filename: file.name,
          error: 'Invalid file type. Only images are allowed.',
        })
        continue
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        results.push({
          filename: file.name,
          error: 'File too large. Maximum size is 10MB.',
        })
        continue
      }

      try {
        const buffer = Buffer.from(await file.arrayBuffer())
        const filepath = await saveScreenshot(buffer, file.name)

        // Create database record
        const screenshot = await prisma.screenshot.create({
          data: {
            filename: file.name,
            filepath: filepath,
            status: 'pending',
          },
        })

        results.push({
          id: screenshot.id,
          filename: screenshot.filename,
          filepath: screenshot.filepath,
          status: screenshot.status,
        })
      } catch (err) {
        results.push({
          filename: file.name,
          error: err instanceof Error ? err.message : 'Failed to save file',
        })
      }
    }

    return NextResponse.json({
      message: `Processed ${files.length} file(s)`,
      results,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const screenshots = await prisma.screenshot.findMany({
      orderBy: { uploadedAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ screenshots })
  } catch (error) {
    console.error('Fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch screenshots' },
      { status: 500 }
    )
  }
}
