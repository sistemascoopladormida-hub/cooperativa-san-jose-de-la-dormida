"use client"

import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"

type TorneoClausuraModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function TorneoClausuraModal({
  open,
  onOpenChange,
}: TorneoClausuraModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={[
          "w-[min(440px,calc(100vw-2rem))]",
          "max-h-[min(92dvh,960px)]",
          "gap-0 overflow-visible border-0 bg-transparent p-0 shadow-none",
          "[&>button]:right-1 [&>button]:top-1 sm:[&>button]:-right-2 sm:[&>button]:-top-2",
          "[&>button]:z-20 [&>button]:rounded-full [&>button]:border [&>button]:border-white/25",
          "[&>button]:bg-white [&>button]:p-2.5 [&>button]:text-slate-900",
          "[&>button]:opacity-100 [&>button]:shadow-xl",
          "[&>button]:hover:bg-slate-100 [&>button]:hover:opacity-100",
        ].join(" ")}
      >
        <DialogTitle className="sr-only">Torneo Clausura</DialogTitle>
        <DialogDescription className="sr-only">
          Información del Torneo Clausura de la Cooperativa La Dormida.
        </DialogDescription>

        <div className="mx-auto w-fit max-w-full overflow-hidden rounded-2xl bg-slate-950/20 shadow-2xl shadow-black/40 ring-1 ring-white/20 backdrop-blur-[2px]">
          <Image
            src="/torneoclausura.webp"
            alt="Torneo Clausura - Cooperativa La Dormida"
            width={800}
            height={1000}
            priority
            className="block h-auto max-h-[min(72dvh,820px)] w-auto max-w-[min(360px,82vw)] object-contain sm:max-w-[min(400px,88vw)]"
            sizes="(max-width: 640px) 82vw, 400px"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
