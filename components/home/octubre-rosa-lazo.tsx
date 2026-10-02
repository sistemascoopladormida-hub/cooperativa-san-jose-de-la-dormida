"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type OctubreRosaLazoProps = {
  className?: string
}

/** Lazo de concientización — decorativo, sin texto. */
export default function OctubreRosaLazo({ className }: OctubreRosaLazoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.55, ease: "easeOut", delay: 0.35 }}
      className={cn("pointer-events-none select-none shrink-0", className)}
      aria-hidden
    >
      <svg
        viewBox="0 0 40 56"
        className="h-9 w-7 sm:h-10 sm:w-8 text-[var(--rosa-primary)] drop-shadow-[0_0_12px_var(--rosa-glow)]"
        fill="currentColor"
      >
        <path d="M20 4c-6.5 0-11 5.2-11 11.5 0 3.1 1.2 5.9 3.2 8L4 38l8.5-6.5L20 44l7.5-12.5L36 38l-8.2-14.5c2-2.1 3.2-4.9 3.2-8C31 9.2 26.5 4 20 4zm0 6c3.6 0 6 2.8 6 5.5 0 1.8-.8 3.4-2.1 4.5L20 28.5 16.1 20C14.8 19 14 17.4 14 15.5 14 12.8 16.4 10 20 10z" />
      </svg>
    </motion.div>
  )
}
