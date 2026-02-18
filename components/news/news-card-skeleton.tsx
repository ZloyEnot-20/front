'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function NewsCardSkeleton({ featured = false }: { featured?: boolean }) {
  if (featured) {
    return (
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="w-full h-80 rounded-none" />
          <div className="flex flex-col justify-center p-6 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-24 mt-4" />
            <Skeleton className="h-10 w-40 mt-4" />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <Skeleton className="w-full h-40 rounded-none" />
      <CardHeader className="flex-1 space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}
