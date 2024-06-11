'use client'
import React, { useRef, useEffect, useState } from 'react'
import { Map } from './_components/map'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Minus, Plus } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export default function Home() {
  return (
    <main className="min-h-screen border">
      <div className="border w-full flex flex-row relative bg-muted h-screen">
        <div className="relative w-full h-full border-2 ">
          <Map />
        </div>
      </div>
    </main>
  )
}
