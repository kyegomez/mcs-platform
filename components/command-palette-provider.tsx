"use client"

import type React from "react"

import { CommandPalette } from "./command-palette"
import { useCommandPalette } from "@/hooks/use-command-palette"

interface CommandPaletteProviderProps {
  children: React.ReactNode
}

export function CommandPaletteProvider({ children }: CommandPaletteProviderProps) {
  const { open, setOpen } = useCommandPalette()

  return (
    <>
      {children}
      <CommandPalette open={open} onOpenChange={setOpen} />
    </>
  )
}
