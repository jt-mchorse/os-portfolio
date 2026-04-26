'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWindowStore } from '@/store/windowStore'
import { findApp } from '@/macos/appRegistry'
import { play, sounds } from '@/lib/sounds'

interface AppSwitcherProps {
  open: boolean
  onClose: () => void
}

export default function AppSwitcher({ open, onClose }: AppSwitcherProps) {
  const { windows, focusWindow, restoreWindow } = useWindowStore()
  const [selectedIdx, setSelectedIdx] = useState(0)

  // Build list of running apps (one entry per app, most recently used first)
  const items = windows
    .slice()
    .sort((a, b) => b.zIndex - a.zIndex)
    .map((w) => ({
      window: w,
      app: findApp(w.appId),
    }))
    .filter((it) => it.app)

  useEffect(() => {
    if (open) setSelectedIdx(items.length > 1 ? 1 : 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault()
        setSelectedIdx((i) => {
          const next = e.shiftKey ? i - 1 : i + 1
          if (items.length === 0) return 0
          return ((next % items.length) + items.length) % items.length
        })
      }
      if (e.key === 'Escape') onClose()
      if (e.key === 'Enter') {
        e.preventDefault()
        confirm()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, items.length, selectedIdx])

  const confirm = () => {
    const it = items[selectedIdx]
    if (it) {
      play(sounds.click)
      if (it.window.isMinimized) restoreWindow(it.window.id)
      else focusWindow(it.window.id)
    }
    onClose()
  }

  if (items.length === 0) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="absolute inset-0 z-[1600] flex items-center justify-center pointer-events-auto"
          style={{ background: 'rgba(0,0,0,0.32)' }}
        >
          <motion.div
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.97, opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl"
            style={{
              background: 'rgba(40,40,44,0.78)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
            }}
          >
            {items.map((it, i) => (
              <div
                key={it.window.id}
                className="relative flex flex-col items-center justify-center rounded-xl px-3 py-3"
                style={{
                  background:
                    selectedIdx === i ? 'rgba(255,255,255,0.18)' : 'transparent',
                  outline:
                    selectedIdx === i
                      ? '2px solid rgba(255,255,255,0.4)'
                      : 'none',
                  outlineOffset: 2,
                }}
              >
                <div className="text-4xl">{it.app!.emoji || '🍎'}</div>
                {selectedIdx === i && (
                  <div className="absolute -bottom-7 text-xs text-white/90 whitespace-nowrap font-medium">
                    {it.app!.label}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
