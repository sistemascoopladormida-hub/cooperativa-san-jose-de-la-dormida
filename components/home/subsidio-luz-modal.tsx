"use client"

import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"

type SubsidioLuzModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function SubsidioLuzModal({
  open,
  onOpenChange,
}: SubsidioLuzModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(440px,94vw)] gap-0 overflow-visible border-0 bg-transparent p-0 shadow-none sm:max-w-[440px] [&>button]:-right-2 [&>button]:-top-2 [&>button]:z-20 [&>button]:rounded-full [&>button]:border [&>button]:border-white/20 [&>button]:bg-white [&>button]:p-2.5 [&>button]:text-slate-900 [&>button]:opacity-100 [&>button]:shadow-xl [&>button]:hover:bg-slate-100 [&>button]:hover:opacity-100">
        <DialogTitle className="sr-only">
          No pierdas tu subsidio de luz
        </DialogTitle>
        <DialogDescription className="sr-only">
          Ingresá a argentina.gob.ar/subsidios para inscribirte o consultar tu
          solicitud, o acercate a los boxes de atención de la cooperativa.
        </DialogDescription>

        <div className="overflow-hidden rounded-2xl shadow-2xl shadow-black/50 ring-1 ring-white/15">
          <Image
            src="/nopierdaselsubsidiodeluz.jpeg"
            alt="¡Ojo! No pierdas tu subsidio de luz. Ingresá a argentina.gob.ar/subsidios o acercate a nuestros boxes de atención."
            width={880}
            height={1320}
            priority
            className="h-auto w-full"
            sizes="(max-width: 440px) 94vw, 440px"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
