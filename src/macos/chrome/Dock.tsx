'use client'

import { useState, useRef } from 'react'
import { useWindowStore, type AppId } from '@/store/windowStore'
import { motion, AnimatePresence } from 'framer-motion'
import { play, sounds } from '@/lib/sounds'
import { APP_REGISTRY, centerForApp, type AppDefinition } from '@/macos/appRegistry'

// Apps shown in the main dock area
const DOCK_APP_IDS: AppId[] = [
  'finder',
  'projects',
  'skills',
  'resume',
  'contact',
  'assistant',
]

// Apps shown after the divider (system / utility area)
const DOCK_UTILITY_IDS: AppId[] = ['switch-os']

const DOCK_ITEMS: AppDefinition[] = DOCK_APP_IDS
  .map((id) => APP_REGISTRY.find((a) => a.id === id)!)
  .filter(Boolean)

const DOCK_UTILS: AppDefinition[] = DOCK_UTILITY_IDS
  .map((id) => APP_REGISTRY.find((a) => a.id === id)!)
  .filter(Boolean)

// Per-app icon styling — gradient background, rounded square, optional symbol
const ICON_STYLES: Record<AppId, { bg: string; symbol: string; symbolColor?: string }> = {
  finder: {
    bg: 'linear-gradient(180deg, #4eb6f5 0%, #2c7fc8 100%)',
    symbol: '☺',
    symbolColor: '#fff',
  },
  projects: {
    bg: 'linear-gradient(180deg, #fbcf65 0%, #e2a13a 100%)',
    symbol: '📁',
  },
  skills: {
    bg: 'linear-gradient(180deg, #6b7280 0%, #374151 100%)',
    symbol: '🛠',
  },
  resume: {
    bg: 'linear-gradient(180deg, #f9fafb 0%, #d1d5db 100%)',
    symbol: '📄',
  },
  contact: {
    bg: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)',
    symbol: '✉️',
  },
  assistant: {
    bg: 'linear-gradient(180deg, #a78bfa 0%, #6d28d9 100%)',
    symbol: '🤖',
  },
  'switch-os': {
    bg: 'linear-gradient(180deg, #f87171 0%, #b91c1c 100%)',
    symbol: '⏻',
    symbolColor: '#fff',
  },
  'about-mac': {
    bg: 'linear-gradient(180deg, #e5e7eb 0%, #9ca3af 100%)',
    symbol: '🍎',
  },
  'project-detail': {
    bg: 'linear-gradient(180deg, #fbcf65 0%, #e2a13a 100%)',
    symbol: '📁',
  },
}

export default function Dock() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const [bouncingId, setBouncingId] = useState<string | null>(null)
  const { openWindow, windows, restoreWindow, getWindowByApp } = useWindowStore()
  const dockRef = useRef<HTMLDivElement>(null)

  const allItems = [...DOCK_ITEMS, ...DOCK_UTILS]
  const dividerIdx = DOCK_ITEMS.length

  const handleClick = (item: AppDefinition) => {
    play(sounds.click)
    const existing = getWindowByApp(item.id)
    if (existing?.isMinimized) {
      restoreWindow(existing.id)
      return
    }
    if (existing) {
      // Re-focus existing
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
    if (dist === 0) return 1.5
    if (dist === 1) return 1.25
    if (dist === 2) return 1.08
    return 1
  }

  return (
    <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none z-[700]">
      <div
        ref={dockRef}
        className="flex items-end gap-1.5 px-3 py-2 rounded-2xl pointer-events-auto"
        style={{
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.28)',
          boxShadow:
            '0 12px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.4)',
        }}
      >
        {allItems.map((item, idx) => {
          const isRunning = windows.some((w) => w.appId === item.id)
          const scale = getScale(idx)
          const isBouncing = bouncingId === item.id
          const showDividerBefore = idx === dividerIdx

          return (
            <div key={item.id} className="flex items-end gap-1.5">
              {showDividerBefore && (
                <div
                  className="self-stretch w-px mx-1 my-1"
                  style={{ background: 'rgba(255,255,255,0.3)' }}
                />
              )}
              <div
                className="relative flex flex-col items-center"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Tooltip */}
                <AnimatePresence>
                  {hoveredIdx === idx && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.12 }}
                      className="absolute -top-9 whitespace-nowrap text-[11px] text-white px-2.5 py-1 rounded-md pointer-events-none font-medium"
                      style={{
                        background: 'rgba(20,20,20,0.92)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      {item.label}
                      <div
                        className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 rotate-45"
                        style={{
                          background: 'rgba(20,20,20,0.92)',
                          borderRight: '1px solid rgba(255,255,255,0.1)',
                          borderBottom: '1px solid rgba(255,255,255,0.1)',
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Icon */}
                <DockIcon
                  item={item}
                  scale={scale}
                  bouncing={isBouncing}
                  onClick={() => handleClick(item)}
                />

                {/* Running dot */}
                <div
                  className="absolute -bottom-2 w-1 h-1 rounded-full transition-opacity"
                  style={{
                    background: 'rgba(255,255,255,0.85)',
                    opacity: isRunning ? 1 : 0,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DockIcon({
  item,
  scale,
  bouncing,
  onClick,
}: {
  item: AppDefinition
  scale: number
  bouncing: boolean
  onClick: () => void
}) {
  const style = ICON_STYLES[item.id] ?? {
    bg: 'linear-gradient(180deg, #cbd5e1 0%, #64748b 100%)',
    symbol: item.emoji || '🍎',
  }
  const useImage = !!style.symbol && style.symbol.length > 1
  return (
    <motion.button
      animate={
        bouncing
          ? { scale, y: [0, -32, 0, -16, 0] }
          : { scale, y: 0 }
      }
      transition={
        bouncing
          ? { duration: 0.7, ease: 'easeOut' }
          : { type: 'spring', stiffness: 360, damping: 22 }
      }
      onClick={onClick}
      className="relative flex items-center justify-center origin-bottom"
      style={{
        width: 52,
        height: 52,
        borderRadius: 12,
        background: style.bg,
        boxShadow:
          '0 4px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.18)',
      }}
    >
      <span
        style={{
          fontSize: useImage ? 26 : 24,
          color: style.symbolColor ?? '#222',
          filter: useImage ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' : 'none',
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        {style.symbol}
      </span>
      {/* Glossy highlight */}
      <span
        className="absolute inset-x-1 top-1 rounded-t-[10px] pointer-events-none"
        style={{
          height: '32%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.25), transparent)',
        }}
      />
    </motion.button>
  )
}
