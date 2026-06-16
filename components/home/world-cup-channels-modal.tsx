"use client"

import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"

type WorldCupChannelsModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function WorldCupChannelsModal({
  open,
  onOpenChange,
}: WorldCupChannelsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(440px,94vw)] gap-0 overflow-visible border-0 bg-transparent p-0 shadow-none sm:max-w-[440px] [&>button]:-right-2 [&>button]:-top-2 [&>button]:z-20 [&>button]:rounded-full [&>button]:border [&>button]:border-white/20 [&>button]:bg-white [&>button]:p-2.5 [&>button]:text-slate-900 [&>button]:opacity-100 [&>button]:shadow-xl [&>button]:hover:bg-slate-100 [&>button]:hover:opacity-100">
        <DialogTitle className="sr-only">
          Canales para ver el Mundial de Fútbol 2026
        </DialogTitle>
        <DialogDescription className="sr-only">
          Grilla de canales: Telefe 6.3, TVP 1.3 y TyC Sports 3.2.
        </DialogDescription>

        <div className="overflow-hidden rounded-2xl shadow-2xl shadow-black/50 ring-1 ring-white/15">
          <Image
            src="/grillamundial.jpeg"
            alt="Disfrutá los partidos del Mundial de Fútbol 2026. Telefe canal 6.3, TVP canal 1.3 y TyC Sports canal 3.2."
            width={880}
            height={1100}
            priority
            className="h-auto w-full"
            sizes="(max-width: 440px) 94vw, 440px"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
