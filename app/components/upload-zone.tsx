'use client'

import { useCallback, useState } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface UploadResult {
  id?: string
  filename: string
  filepath?: string
  status?: string
  error?: string
}

interface UploadZoneProps {
  onUploadComplete?: (results: UploadResult[]) => void
}

export function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    )
    if (files.length > 0) {
      setPendingFiles((prev) => [...prev, ...files])
    }
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []).filter((file) =>
        file.type.startsWith('image/')
      )
      if (files.length > 0) {
        setPendingFiles((prev) => [...prev, ...files])
      }
    },
    []
  )

  const removeFile = useCallback((index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const uploadFiles = useCallback(async () => {
    if (pendingFiles.length === 0) return

    setIsUploading(true)
    setProgress(0)

    const formData = new FormData()
    pendingFiles.forEach((file) => {
      formData.append('files', file)
    })

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setProgress(100)

      // Clear pending files after successful upload
      setPendingFiles([])

      if (onUploadComplete) {
        onUploadComplete(data.results)
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setIsUploading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }, [pendingFiles, onUploadComplete])

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-muted p-4">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Drop screenshots here</p>
            <p className="text-sm text-muted-foreground">
              or click to select files
            </p>
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            id="file-upload"
            onChange={handleFileSelect}
          />
          <label htmlFor="file-upload">
            <Button variant="outline" asChild>
              <span>Select Files</span>
            </Button>
          </label>
        </div>
      </div>

      {/* Pending Files List */}
      {pendingFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">
              {pendingFiles.length} file(s) selected
            </h3>
            <Button
              onClick={uploadFiles}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload All'}
            </Button>
          </div>

          {isUploading && <Progress value={progress} className="w-full" />}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {pendingFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="relative group rounded-lg border bg-muted/50 p-2"
              >
                <div className="aspect-video flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-xs truncate mt-1" title={file.name}>
                  {file.name}
                </p>
                <button
                  className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
