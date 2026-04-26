'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWindowStore } from '@/store/windowStore'
import { APP_REGISTRY, searchApps, centerForApp, type AppDefinition } from '@/macos/appRegistry'
import { play, sounds } from '@/lib/sounds'
import { projects } from '@/content/projects'

interface SpotlightResult {
  type: 'app' | 'project' | 'action'
  id: string
  title: string
  subtitle: string
  emoji: string
  // For apps
  app?: AppDefinition
  // For projects
  projectSlug?: string
  // For actions
  action?: () => void
}

interface SpotlightProps {
  open: boolean
  onClose: () => void
}

export default function Spotlight({ open, onClose }: SpotlightProps) {
  const [query, setQuery] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const { openWindow } = useWindowStore()

  // Build result list from query
  const results: SpotlightResult[] = (() => {
    const out: SpotlightResult[] = []
    const apps = searchApps(query)
    for (const a of apps) {
      out.push({
        type: 'app',
        id: a.id,
        title: a.label,
        subtitle: a.subtitle,
        emoji: a.emoji || '🍎',
        app: a,
      })
    }
    const q = query.trim().toLowerCase()
    if (q.length > 0) {
      for (const p of projects) {
        if (
          p.title.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.company.toLowerCase().includes(q)
        ) {
          out.push({
            type: 'project',
            id: `project-${p.id}`,
            title: p.title,
            subtitle: `${p.company} — ${p.tagline.slice(0, 56)}…`,
            emoji: '📁',
            projectSlug: p.id,
          })
        }
      }
      // Calculator-ish helper
      if (/^[\d+\-*/().\s]+$/.test(q) && /[+\-*/]/.test(q)) {
        try {
          // eslint-disable-next-line no-new-func
          const val = Function(`"use strict"; return (${q})`)()
          if (typeof val === 'number' && Number.isFinite(val)) {
            out.unshift({
              type: 'action',
              id: 'calc',
              title: String(val),
              subtitle: `= ${q}`,
              emoji: '🧮',
            })
          }
        } catch {}
      }
    }
    return out.slice(0, 8)
  })()

  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIdx(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    setSelectedIdx(0)
  }, [query])

  const launchResult = (r: SpotlightResult) => {
    play(sounds.click)
    if (r.type === 'app' && r.app) {
      const pos = centerForApp(r.app)
      openWindow({
        id: `${r.app.id}-${Date.now()}`,
        appId: r.app.id,
        title: r.app.label,
        x: pos.x,
        y: pos.y,
        ...r.app.defaultSize,
        isMinimized: false,
      })
    } else if (r.type === 'project' && r.projectSlug) {
      // open project detail window
      const projectsApp = APP_REGISTRY.find((a) => a.id === 'projects')!
      const pos = centerForApp(projectsApp)
      openWindow({
        id: `project-detail-${r.projectSlug}-${Date.now()}`,
        appId: 'project-detail',
        title: r.title,
        x: pos.x + 40,
        y: pos.y + 40,
        width: 720,
        height: 600,
        isMinimized: false,
        meta: { slug: r.projectSlug },
      })
    } else if (r.type === 'action' && r.action) {
      r.action()
    }
    onClose()
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const r = results[selectedIdx]
      if (r) launchResult(r)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="absolute inset-0 z-[1500] flex items-start justify-center pt-[18vh] pointer-events-auto"
          onClick={onClose}
          style={{ background: 'rgba(0,0,0,0.18)', backdropFilter: 'blur(4px)' }}
        >
          <motion.div
            initial={{ scale: 0.96, y: -8, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: -8, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-[680px] max-w-[92vw] overflow-hidden"
            style={{
              borderRadius: 14,
              background: 'rgba(34,34,38,0.78)',
              backdropFilter: 'blur(40px) saturate(180%)',
              WebkitBackdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
            }}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8">
              <svg className="w-5 h-5 text-white/60 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Spotlight Search"
                className="flex-1 bg-transparent outline-none text-white text-xl placeholder-white/40 font-light"
              />
              {query && (
                <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60 font-sans">esc</kbd>
              )}
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div className="max-h-[400px] overflow-y-auto py-1">
                {results.map((r, i) => (
                  <button
                    key={r.id}
                    onClick={() => launchResult(r)}
                    onMouseEnter={() => setSelectedIdx(i)}
                    className="w-full flex items-center gap-3 px-5 py-2.5 text-left transition-colors"
                    style={{
                      background: selectedIdx === i ? 'rgba(0,122,255,0.85)' : 'transparent',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
                      style={{ background: selectedIdx === i ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)' }}
                    >
                      {r.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate">{r.title}</div>
                      <div className="text-xs text-white/55 truncate">{r.subtitle}</div>
                    </div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wider flex-shrink-0">
                      {r.type === 'app' ? 'Application' : r.type === 'project' ? 'Project' : 'Result'}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {query && results.length === 0 && (
              <div className="px-5 py-6 text-sm text-white/45">No results for "{query}"</div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
