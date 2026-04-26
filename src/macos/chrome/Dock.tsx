'use client'

import { useState, useRef } from 'react'
import { useWindowStore, type AppId } from '@/store/windowStore'
import { motion, AnimatePresence } from 'framer-motion'
import { play, sounds } from '@/lib/sounds'
import { APP_REGISTRY, centerForApp, type AppDefinition } from '@/macos/appRegistry'

const DOCK_APP_IDS: AppId[] = ['finder', 'projects', 'skills', 'resume', 'contact', 'assistant']
const DOCK_UTILITY_IDS: AppId[] = ['switch-os']

const DOCK_ITEMS: AppDefinition[] = DOCK_APP_IDS
  .map((id) => APP_REGISTRY.find((a) => a.id === id)!)
  .filter(Boolean)

const DOCK_UTILS: AppDefinition[] = DOCK_UTILITY_IDS
  .map((id) => APP_REGISTRY.find((a) => a.id === id)!)
  .filter(Boolean)

// Per-app icon styling
const ICON_STYLES: Record<AppId, { bg: string; symbol: string; symbolColor?: string }> = {
  finder: { bg: 'linear-gradient(180deg, #4eb6f5 0%, #2c7fc8 100%)', symbol: '☺', symbolColor: '#fff' },
  projects: { bg: 'linear-gradient(180deg, #fbcf65 0%, #e2a13a 100%)', symbol: '📁' },
  skills: { bg: 'linear-gradient(180deg, #6b7280 0%, #374151 100%)', symbol: '🛠' },
  resume: { bg: 'linear-gradient(180deg, #f9fafb 0%, #d1d5db 100%)', symbol: '📄' },
  contact: { bg: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)', symbol: '✉️' },
  assistant: { bg: 'linear-gradient(180deg, #a78bfa 0%, #6d28d9 100%)', symbol: '🤖' },
  'switch-os': { bg: 'linear-gradient(180deg, #f87171 0%, #b91c1c 100%)', symbol: '⏻', symbolColor: '#fff' },
  'about-mac': { bg: 'linear-gradient(180deg, #e5e7eb 0%, #9ca3af 100%)', symbol: '🍎' },
  'project-detail': { bg: 'linear-gradient(180deg, #fbcf65 0%, #e2a13a 100%)', symbol: '📁' },
}

const BASE_SIZE = 48
// Magnification factors by distance from hovered icon
const SCALE_AT_DIST: Record<number, number> = { 0: 1.55, 1: 1.3, 2: 1.12 }

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

  const sizeFor = (idx: number): number => {
    if (hoveredIdx === null) return BASE_SIZE
    const dist = Math.abs(idx - hoveredIdx)
    const scale = SCALE_AT_DIST[dist] ?? 1
    return Math.round(BASE_SIZE * scale)
  }

  return (
    <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none z-[700]">
      <div
        ref={dockRef}
        className="flex items-end gap-2 px-3 py-2 rounded-2xl pointer-events-auto"
        style={{
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.28)',
          boxShadow:
            '0 12px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.4)',
        }}
        onMouseLeave={() => setHoveredIdx(null)}
      >
        {allItems.map((item, idx) => {
          const isRunning = windows.some((w) => w.appId === item.id)
          const size = sizeFor(idx)
          const isBouncing = bouncingId === item.id
          const isHovered = hoveredIdx === idx
          const showDividerBefore = idx === dividerIdx

          return (
            <div key={item.id} className="flex items-end gap-2">
              {showDividerBefore && (
                <div
                  className="self-stretch w-px"
                  style={{ background: 'rgba(255,255,255,0.3)', height: BASE_SIZE - 4 }}
                />
              )}
              <div
                className="relative flex flex-col items-center"
                onMouseEnter={() => setHoveredIdx(idx)}
              >
                {/* Tooltip — high z-index so it sits above other dock icons */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.12 }}
                      className="absolute whitespace-nowrap text-[11px] text-white px-2.5 py-1 rounded-md pointer-events-none font-medium"
                      style={{
                        bottom: size + 12,
                        background: 'rgba(20,20,20,0.95)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        zIndex: 100,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                      }}
                    >
                      {item.label}
                      <div
                        className="absolute left-1/2 -bottom-[4px] -translate-x-1/2 w-2 h-2 rotate-45"
                        style={{
                          background: 'rgba(20,20,20,0.95)',
                          borderRight: '1px solid rgba(255,255,255,0.12)',
                          borderBottom: '1px solid rgba(255,255,255,0.12)',
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Icon — animate width & height so the row reflows */}
                <DockIcon
                  item={item}
                  size={size}
                  bouncing={isBouncing}
                  onClick={() => handleClick(item)}
                />

                {/* Running dot */}
                <div
                  className="absolute w-1 h-1 rounded-full transition-opacity"
                  style={{
                    bottom: -7,
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
  size,
  bouncing,
  onClick,
}: {
  item: AppDefinition
  size: number
  bouncing: boolean
  onClick: () => void
}) {
  const style = ICON_STYLES[item.id] ?? {
    bg: 'linear-gradient(180deg, #cbd5e1 0%, #64748b 100%)',
    symbol: item.emoji || '🍎',
  }
  const useEmoji = !!style.symbol && style.symbol.length > 1
  // Font size scales with icon size
  const fontSize = Math.round(size * 0.5)

  return (
    <motion.button
      animate={
        bouncing
          ? { width: size, height: size, y: [0, -32, 0, -16, 0] }
          : { width: size, height: size, y: 0 }
      }
      transition={
        bouncing
          ? { duration: 0.7, ease: 'easeOut' }
          : { type: 'spring', stiffness: 380, damping: 24, mass: 0.6 }
      }
      onClick={onClick}
      className="relative flex items-center justify-center origin-bottom"
      style={{
        borderRadius: Math.round(size * 0.22),
        background: style.bg,
        boxShadow:
          '0 4px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.18)',
      }}
    >
      <span
        style={{
          fontSize,
          color: style.symbolColor ?? '#222',
          filter: useEmoji ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' : 'none',
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        {style.symbol}
      </span>
      {/* Glossy highlight */}
      <span
        className="absolute inset-x-1 top-1 pointer-events-none"
        style={{
          height: '32%',
          borderRadius: Math.round(size * 0.18),
          background: 'linear-gradient(180deg, rgba(255,255,255,0.28), transparent)',
        }}
      />
    </motion.button>
  )
}
