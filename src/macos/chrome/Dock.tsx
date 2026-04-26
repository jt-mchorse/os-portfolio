'use client'

import { useRef, useState, type RefObject } from 'react'
import { useWindowStore, type AppId } from '@/store/windowStore'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  type MotionValue,
} from 'framer-motion'
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

// ── Tuning ─────────────────────────────────────────────────────────────────
// BASE     : the icon's resting size (square)
// MAX      : magnification factor at cursor center
// DISTANCE : magnification radius in pixels
// PAD      : equal padding on every side of the dock pill (resting state)
// GAP      : fixed spacing between icon containers
const BASE = 48
const MAX = 1.85
const DISTANCE = 150
const PAD = 8
const GAP = 8
const SPRING = { mass: 0.1, stiffness: 170, damping: 14 }

export default function Dock() {
  const dockRef = useRef<HTMLDivElement>(null)
  const [bouncingId, setBouncingId] = useState<string | null>(null)
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null)
  const { openWindow, windows, restoreWindow, getWindowByApp } = useWindowStore()

  const mouseX = useMotionValue<number>(Infinity)

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

  return (
    <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none z-[700]">
      {/*
        Dock pill — fixed total height (PAD*2 + BASE), flexible width.
        overflow:visible lets icons grow upward past the pill on hover.
      */}
      <motion.div
        ref={dockRef}
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="flex items-end pointer-events-auto"
        style={{
          height: BASE + PAD * 2,
          padding: PAD,
          gap: GAP,
          borderRadius: 18,
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.28)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.4)',
          overflow: 'visible',
        }}
      >
        {allItems.map((item, idx) => {
          const isRunning = windows.some((w) => w.appId === item.id)
          const isBouncing = bouncingId === item.id
          const showDividerBefore = idx === dividerIdx

          return (
            <div key={item.id} className="flex items-end" style={{ gap: GAP }}>
              {showDividerBefore && (
                <div
                  className="self-center"
                  style={{
                    width: 1,
                    height: BASE - 8,
                    background: 'rgba(255,255,255,0.3)',
                  }}
                />
              )}
              <DockItem
                item={item}
                mouseX={mouseX}
                dockRef={dockRef}
                bouncing={isBouncing}
                isRunning={isRunning}
                isLabelHovered={hoveredLabel === item.id}
                onHoverChange={(hovered) => setHoveredLabel(hovered ? item.id : null)}
                onClick={() => handleClick(item)}
              />
            </div>
          )
        })}
      </motion.div>
    </div>
  )
}

interface DockItemProps {
  item: AppDefinition
  mouseX: MotionValue<number>
  dockRef: RefObject<HTMLDivElement | null>
  bouncing: boolean
  isRunning: boolean
  isLabelHovered: boolean
  onHoverChange: (hovered: boolean) => void
  onClick: () => void
}

function DockItem({
  item,
  mouseX,
  bouncing,
  isRunning,
  isLabelHovered,
  onHoverChange,
  onClick,
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null)

  // Distance between cursor x and this icon's center.
  const distance = useTransform(mouseX, (mx) => {
    if (mx === Infinity || mx === -Infinity) return DISTANCE * 2
    const rect = ref.current?.getBoundingClientRect() ?? { left: 0, width: BASE }
    const center = rect.left + rect.width / 2
    return mx - center
  })

  // Bell-curve: BASE → BASE*MAX → BASE
  const widthRaw = useTransform(distance, [-DISTANCE, 0, DISTANCE], [BASE, BASE * MAX, BASE])
  const width = useSpring(widthRaw, SPRING)

  // The icon button stays square — its size matches the container width but is
  // anchored to the bottom of the (fixed-height) container so growth happens
  // upward, leaving the dock pill's vertical bounds unchanged.
  const fontSize = useTransform(width, (w) => Math.round(w * 0.5))
  const radius = useTransform(width, (w) => Math.round(w * 0.22))
  const highlightHeight = useTransform(width, (w) => `${Math.round(w * 0.32)}px`)
  const highlightRadius = useTransform(width, (w) => Math.round(w * 0.18))

  // Bouncing oscillation
  const bounceY = useMotionValue(0)
  if (bouncing) {
    let elapsed = 0
    const id = setInterval(() => {
      elapsed += 16
      const t = elapsed / 700
      let y = 0
      if (t < 0.4) y = -32 * Math.sin((t / 0.4) * Math.PI)
      else if (t < 1) y = -16 * Math.sin(((t - 0.4) / 0.6) * Math.PI)
      bounceY.set(y)
      if (t >= 1) {
        bounceY.set(0)
        clearInterval(id)
      }
    }, 16)
  }

  const style = ICON_STYLES[item.id] ?? {
    bg: 'linear-gradient(180deg, #cbd5e1 0%, #64748b 100%)',
    symbol: item.emoji || '🍎',
  }

  // Tooltip floats above the maximum possible icon height.
  const TOOLTIP_BOTTOM = BASE * MAX + 12

  return (
    <div
      ref={ref}
      className="relative flex items-end justify-center"
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      style={{
        // Container WIDTH animates so neighbors push apart in flex layout.
        height: BASE,
      }}
    >
      {/* Width-driving spacer so flex sizes the row correctly */}
      <motion.div style={{ width, height: BASE }} className="pointer-events-none" />

      {/* Tooltip */}
      <AnimatePresence>
        {isLabelHovered && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.12 }}
            className="absolute whitespace-nowrap text-[11px] text-white px-2.5 py-1 rounded-md pointer-events-none font-medium left-1/2 -translate-x-1/2"
            style={{
              bottom: TOOLTIP_BOTTOM,
              background: 'rgba(20,20,20,0.95)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.12)',
              zIndex: 100,
              boxShadow: '0 4px 12px rgba(0,0,0,0.45)',
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

      {/* Icon button — absolutely positioned, anchored to the bottom of the
          container, so when its size grows it extends upward without affecting
          the dock pill's height. */}
      <motion.button
        onClick={onClick}
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          x: '-50%',
          width,
          height: width, // keep icon square
          y: bounceY,
          borderRadius: radius,
          background: style.bg,
          boxShadow:
            '0 4px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.18)',
        }}
        className="flex items-center justify-center"
      >
        <motion.span
          style={{
            fontSize,
            color: style.symbolColor ?? '#222',
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {style.symbol}
        </motion.span>
        <motion.span
          className="absolute pointer-events-none"
          style={{
            left: 4,
            right: 4,
            top: 4,
            height: highlightHeight,
            borderRadius: highlightRadius,
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.28), transparent)',
          }}
        />
      </motion.button>

      {/* Running dot */}
      <div
        className="absolute w-1 h-1 rounded-full transition-opacity left-1/2 -translate-x-1/2"
        style={{
          bottom: -7,
          background: 'rgba(255,255,255,0.85)',
          opacity: isRunning ? 1 : 0,
        }}
      />
    </div>
  )
}
