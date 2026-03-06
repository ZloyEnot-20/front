'use client'

import { Building2, MapPin, ExternalLink } from 'lucide-react'
import { getImageUrl } from '@/lib/api'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import type { ExhibitorInfo } from '@/lib/types'

interface ExhibitorModalProps {
  exhibitor: ExhibitorInfo | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExhibitorModal({ exhibitor, open, onOpenChange }: ExhibitorModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {exhibitor && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                  {exhibitor.avatar ? (
                    <img src={getImageUrl(exhibitor.avatar)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                {exhibitor.name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {exhibitor.exhibitorDescription && (
                <p className="text-sm text-foreground/80 leading-relaxed">{exhibitor.exhibitorDescription}</p>
              )}
              {exhibitor.exhibitorAddress && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">{exhibitor.exhibitorAddress}</p>
                </div>
              )}
              {exhibitor.exhibitorWebsite && (
                <a
                  href={exhibitor.exhibitorWebsite.startsWith('http') ? exhibitor.exhibitorWebsite : `https://${exhibitor.exhibitorWebsite}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  {exhibitor.exhibitorWebsite}
                </a>
              )}
              {exhibitor.exhibitorPhotos && exhibitor.exhibitorPhotos.length > 0 && (
                <div className="relative w-full">
                  <Carousel opts={{ align: 'start', loop: exhibitor.exhibitorPhotos.length > 1, containScroll: 'trimSnaps' }} className="w-full">
                    <CarouselContent className="-ml-2">
                      {exhibitor.exhibitorPhotos.map((url, i) => (
                        <CarouselItem key={i} className="pl-2 basis-1/3">
                          <img
                            src={getImageUrl(url) || url}
                            alt=""
                            className="rounded-lg object-cover aspect-square w-full"
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {exhibitor.exhibitorPhotos.length > 1 && (
                      <>
                        <CarouselPrevious className="left-2 border-0 bg-black/50 text-white hover:bg-black/70 disabled:opacity-30" />
                        <CarouselNext className="right-2 border-0 bg-black/50 text-white hover:bg-black/70 disabled:opacity-30" />
                      </>
                    )}
                  </Carousel>
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
