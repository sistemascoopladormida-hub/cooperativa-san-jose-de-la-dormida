"use client"

import { useEffect, useState } from "react"
import TorneoClausuraModal from "@/components/home/torneo-clausura-modal"

const STORAGE_KEY = "coop-torneo-clausura-modal-dismissed"

export default function TorneoClausuraWelcome() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) !== "1") {
      setIsOpen(true)
    }
  }, [])

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      sessionStorage.setItem(STORAGE_KEY, "1")
    }
  }

  return <TorneoClausuraModal open={isOpen} onOpenChange={handleOpenChange} />
}
