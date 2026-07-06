"use client"

import { useState } from "react"
import WorldCupChannelsModal from "@/components/home/world-cup-channels-modal"

export default function WorldCupWelcome() {
  const [isOpen, setIsOpen] = useState(true)

  return <WorldCupChannelsModal open={isOpen} onOpenChange={setIsOpen} />
}
