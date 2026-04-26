'use client'

import { useState, useRef } from 'react'
import { useWindowStore, type AppId } from '@/store/windowStore'
import { motion, AnimatePresence } from 'framer-motion'
import { play, sounds } from '@/lib/sounds'
import { APP_REGISTRY, centerForApp, type AppDefinition } from '@/macos/appRegistry'

// Dock shows a curated subset of apps, in order
const DOCK_APP_IDS: AppId[] = [
  'finder',
  'projects',
  'skills',
  'resume',
  'contact',
  'assistant',
  'switch-os',
]

const DOCK_ITEMS: AppDefinition[] = DOCK_APP_IDS
  .map((id) => APP_REGISTRY.find((a) => a.id === id)!)
  .filter(Boolean)

export default function Dock() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const [bouncingId, setBouncingId] = useState<string | null>(null)
  const { openWindow, windows, restoreWindow, getWindowByApp } = useWindowStore()
  const dockRef = useRef<HTMLDivElement>(null)

  const handleClick = (item: AppDefinition) => {
    play(sounds.click)
    const existing = getWindowByApp(item.id)
    if (existing?.isMinimized) {
      restoreWindow(existing.id)
      return
    }
    if (existing) {
      // Focus the existing window via re-open call (focus is handled in store)
      const pos = centerForApp(item)
      openWindow({
        id: existing.id,
        appId: item.id,
        title: item.label,
        x: existing.x,
        y: existing.y,
        width: existing.width,
        height: existing.height,
        isMinimized: false,
      })
      return
    }
    // Bounce + launch
    setBouncingId(item.id)
    setTimeout(() => setBouncingId(null), 700)
    const pos = centerForApp(item)
    openWindow({
      id: `${item.id}-${Date.now()}`,
      appId: item.id,
      title: item.label,
      x: pos.x,
      y: pos.y,
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
          const isBouncing = bouncingId === item.id

          return (
            <div
              key={item.id}
              className="relative flex flex-col items-center"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip */}
              <AnimatePresence>
                {hoveredIdx === idx && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute -top-9 whitespace-nowrap text-[11px] text-white px-2.5 py-1 rounded-md pointer-events-none font-medium"
                    style={{
                      background: 'rgba(20,20,20,0.92)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    {item.label}
                    {/* tail */}
                    <div
                      className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 rotate-45"
                      style={{ background: 'rgba(20,20,20,0.92)' }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Icon */}
              <motion.button
                animate={
                  isBouncing
                    ? { scale, y: [0, -32, 0, -16, 0] }
                    : { scale, y: 0 }
                }
                transition={
                  isBouncing
                    ? { duration: 0.7, ease: 'easeOut' }
                    : { type: 'spring', stiffness: 400, damping: 25 }
                }
                onClick={() => handleClick(item)}
                className="w-12 h-12 rounded-xl flex items-center justify-center text-3xl transition-colors origin-bottom"
                style={{
                  background: isRunning ? 'rgba(255,255,255,0.18)' : 'transparent',
                }}
              >
                {item.emoji || '🍎'}
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
