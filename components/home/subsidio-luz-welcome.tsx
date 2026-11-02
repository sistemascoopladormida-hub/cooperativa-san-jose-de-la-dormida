"use client"

import { useEffect, useState } from "react"
import SubsidioLuzModal from "@/components/home/subsidio-luz-modal"

const STORAGE_KEY = "coop-subsidio-luz-modal-dismissed"

export default function SubsidioLuzWelcome() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== "1") {
        setIsOpen(true)
      }
    } catch {
      setIsOpen(true)
    }
  }, [])

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      try {
        localStorage.setItem(STORAGE_KEY, "1")
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <SubsidioLuzModal open={isOpen} onOpenChange={handleOpenChange} />
  )
}
