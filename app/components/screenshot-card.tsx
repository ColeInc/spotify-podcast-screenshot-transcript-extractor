'use client'

import { useState } from 'react'
import { Loader2, ImageIcon, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export interface Screenshot {
  id: string
  filename: string
  filepath: string
  uploadedAt: string
  status: string
  platform?: string | null
  videoTitle?: string | null
  timestamp?: number | null
  confidence?: string | null
}

interface ScreenshotCardProps {
  screenshot: Screenshot
  onAnalyze?: (id: string) => Promise<void>
}

function formatTimestamp(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4 text-muted-foreground" />
    case 'processing':
      return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return null
  }
}

function ConfidenceBadge({ confidence }: { confidence: string }) {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    high: 'default',
    medium: 'secondary',
    low: 'destructive',
  }

  return (
    <Badge variant={variants[confidence] || 'outline'}>
      {confidence}
    </Badge>
  )
}

export function ScreenshotCard({ screenshot, onAnalyze }: ScreenshotCardProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleAnalyze = async () => {
    if (!onAnalyze) return
    setIsAnalyzing(true)
    try {
      await onAnalyze(screenshot.id)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-muted flex items-center justify-center relative">
        <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
        <div className="absolute top-2 right-2">
          <StatusIcon status={screenshot.status} />
        </div>
      </div>
      <CardContent className="p-4 space-y-3">
        <p className="text-sm font-medium truncate" title={screenshot.filename}>
          {screenshot.filename}
        </p>

        {screenshot.status === 'completed' && (
          <div className="space-y-2">
            {screenshot.platform && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {screenshot.platform}
                </Badge>
                {screenshot.confidence && (
                  <ConfidenceBadge confidence={screenshot.confidence} />
                )}
              </div>
            )}

            {screenshot.videoTitle && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {screenshot.videoTitle}
              </p>
            )}

            {screenshot.timestamp !== null && screenshot.timestamp !== undefined && (
              <p className="text-sm font-mono">
                Timestamp: {formatTimestamp(screenshot.timestamp)}
              </p>
            )}
          </div>
        )}

        {screenshot.status === 'pending' && onAnalyze && (
          <Button
            size="sm"
            className="w-full"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze'
            )}
          </Button>
        )}

        {screenshot.status === 'processing' && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing with Claude...
          </div>
        )}

        {screenshot.status === 'failed' && (
          <div className="flex items-center gap-2">
            <p className="text-sm text-red-500">Analysis failed</p>
            {onAnalyze && (
              <Button size="sm" variant="outline" onClick={handleAnalyze}>
                Retry
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
