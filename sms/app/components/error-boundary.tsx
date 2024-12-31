'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  error: Error
  reset: () => void
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}

