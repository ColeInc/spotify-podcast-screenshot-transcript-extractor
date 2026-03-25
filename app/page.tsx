'use client'

import { useCallback, useEffect, useState } from 'react'
import { UploadZone } from './components/upload-zone'
import { ScreenshotCard, type Screenshot } from './components/screenshot-card'
import { Button } from '@/components/ui/button'
import { Loader2, RefreshCw, Sparkles } from 'lucide-react'

export default function Home() {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzingAll, setIsAnalyzingAll] = useState(false)

  const fetchScreenshots = useCallback(async () => {
    try {
      const response = await fetch('/api/upload')
      if (response.ok) {
        const data = await response.json()
        setScreenshots(data.screenshots)
      }
    } catch (error) {
      console.error('Failed to fetch screenshots:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchScreenshots()
  }, [fetchScreenshots])

  const handleUploadComplete = useCallback(() => {
    fetchScreenshots()
  }, [fetchScreenshots])

  const handleAnalyze = useCallback(
    async (id: string) => {
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ screenshotId: id }),
        })

        if (response.ok) {
          await fetchScreenshots()
        }
      } catch (error) {
        console.error('Analysis failed:', error)
      }
    },
    [fetchScreenshots]
  )

  const handleAnalyzeAll = useCallback(async () => {
    const pendingIds = screenshots
      .filter((s) => s.status === 'pending')
      .map((s) => s.id)

    if (pendingIds.length === 0) return

    setIsAnalyzingAll(true)
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screenshotIds: pendingIds }),
      })

      if (response.ok) {
        await fetchScreenshots()
      }
    } catch (error) {
      console.error('Batch analysis failed:', error)
    } finally {
      setIsAnalyzingAll(false)
    }
  }, [screenshots, fetchScreenshots])

  const pendingCount = screenshots.filter((s) => s.status === 'pending').length
  const completedCount = screenshots.filter((s) => s.status === 'completed').length

  return (
    <main className="min-h-screen p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Screenshot Transcript Extractor
          </h1>
          <p className="text-lg text-muted-foreground">
            Upload screenshots from Spotify or YouTube to extract video metadata
            and timestamps using AI.
          </p>
        </div>

        {/* Upload Zone */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Upload Screenshots</h2>
          <UploadZone onUploadComplete={handleUploadComplete} />
        </section>

        {/* Screenshots Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold">Screenshots</h2>
              <p className="text-sm text-muted-foreground">
                {completedCount} analyzed, {pendingCount} pending
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchScreenshots}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {pendingCount > 0 && (
                <Button
                  size="sm"
                  onClick={handleAnalyzeAll}
                  disabled={isAnalyzingAll}
                >
                  {isAnalyzingAll ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analyze All ({pendingCount})
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : screenshots.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No screenshots uploaded yet.</p>
              <p className="text-sm">
                Drop some screenshots above to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {screenshots.map((screenshot) => (
                <ScreenshotCard
                  key={screenshot.id}
                  screenshot={screenshot}
                  onAnalyze={handleAnalyze}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
