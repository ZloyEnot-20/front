'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function PublicationCardSkeleton() {
  return (
    <Card>
      <div className="aspect-square bg-muted relative overflow-hidden">
        <Skeleton className="w-full h-full rounded-none" />
      </div>
      <CardContent className="p-2">
        <Skeleton className="h-3 w-full mb-1" />
        <Skeleton className="h-2.5 w-full mb-1" />
        <Skeleton className="h-2.5 w-2/3 mb-2" />
        <div className="space-y-0.5 mb-2">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-2.5 w-12" />
        </div>
        <Skeleton className="h-7 w-full" />
      </CardContent>
    </Card>
  )
}
