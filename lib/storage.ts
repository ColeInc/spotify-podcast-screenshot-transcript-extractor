import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'
const OUTPUT_DIR = process.env.OUTPUT_DIR || './outputs'

export const PATHS = {
  screenshots: path.join(UPLOAD_DIR, 'screenshots'),
  recordings: path.join(UPLOAD_DIR, 'recordings'),
  audio: path.join(UPLOAD_DIR, 'audio'),
  transcripts: path.join(OUTPUT_DIR, 'transcripts'),
}

export async function ensureDirectories(): Promise<void> {
  await Promise.all([
    mkdir(PATHS.screenshots, { recursive: true }),
    mkdir(PATHS.recordings, { recursive: true }),
    mkdir(PATHS.audio, { recursive: true }),
    mkdir(PATHS.transcripts, { recursive: true }),
  ])
}

export async function saveScreenshot(
  buffer: Buffer,
  filename: string
): Promise<string> {
  await ensureDirectories()

  const timestamp = Date.now()
  const ext = path.extname(filename)
  const baseName = path.basename(filename, ext)
  const uniqueFilename = `${baseName}-${timestamp}${ext}`
  const filepath = path.join(PATHS.screenshots, uniqueFilename)

  await writeFile(filepath, buffer)

  return filepath
}

export function generateFilename(originalName: string, prefix: string): string {
  const timestamp = Date.now()
  const ext = path.extname(originalName)
  const baseName = path.basename(originalName, ext)
  return `${prefix}-${baseName}-${timestamp}${ext}`
}
