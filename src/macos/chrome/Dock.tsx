'use client'

import { useState, useRef } from 'react'
import { useWindowStore, type AppId } from '@/store/windowStore'
import { motion } from 'framer-motion'
import { play, sounds } from '@/lib/sounds'

interface DockItem {
  id: AppId
  label: string
  emoji: string
  defaultSize: { width: number; height: number }
}

const DOCK_ITEMS: DockItem[] = [
  { id: 'finder', label: 'Finder', emoji: '🗂', defaultSize: { width: 760, height: 520 } },
  { id: 'projects', label: 'Projects', emoji: '📁', defaultSize: { width: 760, height: 520 } },
  { id: 'skills', label: 'Skills', emoji: '🛠', defaultSize: { width: 680, height: 560 } },
  { id: 'resume', label: 'Resume', emoji: '📄', defaultSize: { width: 720, height: 900 } },
  { id: 'contact', label: 'Contact', emoji: '✉️', defaultSize: { width: 540, height: 480 } },
  { id: 'assistant', label: 'Assistant', emoji: '🤖', defaultSize: { width: 560, height: 500 } },
  { id: 'switch-os', label: 'Switch OS', emoji: '🔄', defaultSize: { width: 400, height: 280 } },
]

export default function Dock() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const { openWindow, windows, restoreWindow, getWindowByApp } = useWindowStore()
  const dockRef = useRef<HTMLDivElement>(null)

  const handleClick = (item: DockItem) => {
    play(sounds.click)
    const existing = getWindowByApp(item.id)
    if (existing?.isMinimized) {
      restoreWindow(existing.id)
      return
    }
    if (existing) return // already open and focused

    openWindow({
      id: `${item.id}-${Date.now()}`,
      appId: item.id,
      title: item.label,
      x: Math.round(globalThis.window?.innerWidth / 2 - item.defaultSize.width / 2) || 100,
      y: Math.round(globalThis.window?.innerHeight / 2 - item.defaultSize.height / 2) || 60,
      ...item.defaultSize,
      isMinimized: false,
    })
  }

  const getScale = (idx: number): number => {
    if (hoveredIdx === null) return 1
    const dist = Math.abs(idx - hoveredIdx)
    if (dist === 0) return 1.55
    if (dist === 1) return 1.28
    if (dist === 2) return 1.1
    return 1
  }

  return (
    <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none z-[700]">
      <div
        ref={dockRef}
        className="flex items-end gap-1.5 px-3 py-2 rounded-2xl pointer-events-auto"
        style={{
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.28)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
        }}
      >
        {DOCK_ITEMS.map((item, idx) => {
          const isRunning = windows.some((w) => w.appId === item.id)
          const scale = getScale(idx)

          return (
            <div
              key={item.id}
              className="relative flex flex-col items-center"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip */}
              {hoveredIdx === idx && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.12 }}
                  className="absolute -top-8 whitespace-nowrap text-xs text-white/90 px-2 py-0.5 rounded-md pointer-events-none"
                  style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
                >
                  {item.label}
                </motion.div>
              )}

              {/* Icon */}
              <motion.button
                animate={{ scale }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={() => handleClick(item)}
                className="w-12 h-12 rounded-xl flex items-center justify-center text-3xl transition-all origin-bottom"
                style={{
                  background: isRunning ? 'rgba(255,255,255,0.18)' : 'transparent',
                }}
              >
                {item.emoji}
              </motion.button>

              {/* Running dot */}
              {isRunning && (
                <div className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-white/70" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
