'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOSStore } from '@/store/osStore'
import { useWindowStore } from '@/store/windowStore'
import { isSoundEnabled, setSoundEnabled, play, sounds, isAmbientPlaying, setAmbientPlaying } from '@/lib/sounds'

function Clock() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      )
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return <span className="text-xs tabular-nums">{time}</span>
}

function AppleMenu({ onClose }: { onClose: () => void }) {
  const { triggerRestart } = useOSStore()
  const { openWindow } = useWindowStore()

  const items = [
    {
      label: 'About This Mac',
      action: () => {
        openWindow({
          id: 'about-mac-1',
          appId: 'about-mac',
          title: 'About This Mac',
          x: Math.round(window.innerWidth / 2 - 270),
          y: Math.round(window.innerHeight / 2 - 180),
          width: 540,
          height: 360,
          isMinimized: false,
        })
        onClose()
      },
    },
    { label: 'separator' },
    { label: 'System Settings…', action: onClose },
    { label: 'separator' },
    {
      label: 'Restart…',
      action: () => {
        onClose()
        setTimeout(() => triggerRestart(), 300)
      },
    },
    {
      label: 'Shut Down…',
      action: () => {
        onClose()
        setTimeout(() => triggerRestart(), 300)
      },
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={{ duration: 0.12 }}
      className="absolute top-full left-0 mt-0.5 w-56 rounded-xl overflow-hidden shadow-2xl z-[1000] py-1"
      style={{
        background: 'rgba(36,36,36,0.92)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {items.map((item, i) =>
        item.label === 'separator' ? (
          <div key={i} className="my-1 mx-3 border-t border-white/10" />
        ) : (
          <button
            key={i}
            onClick={item.action}
            className="w-full text-left px-4 py-1.5 text-sm text-white/90 hover:bg-blue-500/90 transition-colors"
          >
            {item.label}
          </button>
        )
      )}
    </motion.div>
  )
}

function ControlCenter() {
  const [soundOn, setSoundOn] = useState(false)
  const [ambient, setAmbient] = useState(false)
  const [brightness, setBrightness] = useState(80)
  const [volume, setVolume] = useState(70)

  useEffect(() => {
    setSoundOn(isSoundEnabled())
    setAmbient(isAmbientPlaying())
  }, [])

  const handleToggleSound = () => {
    const next = !soundOn
    setSoundEnabled(next)
    setSoundOn(next)
    if (next) play(sounds.click)
  }
  const handleToggleAmbient = () => {
    const next = !ambient
    setAmbientPlaying(next)
    setAmbient(next)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={{ duration: 0.14 }}
      className="absolute right-0 top-full mt-1.5 w-80 rounded-2xl overflow-hidden shadow-2xl z-[1000] p-3"
      style={{
        background: 'rgba(40,40,44,0.78)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={handleToggleSound}
          className="flex items-center gap-2 p-2.5 rounded-xl text-left transition-colors"
          style={{ background: soundOn ? 'rgba(50,150,255,0.85)' : 'rgba(255,255,255,0.08)' }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: soundOn ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.18)' }}
          >
            <span className="text-sm">{soundOn ? '🔊' : '🔇'}</span>
          </div>
          <div>
            <div className="text-xs font-medium text-white">Sound FX</div>
            <div className="text-[10px] text-white/70">{soundOn ? 'On' : 'Off'}</div>
          </div>
        </button>
        <button
          onClick={handleToggleAmbient}
          className="flex items-center gap-2 p-2.5 rounded-xl text-left transition-colors"
          style={{ background: ambient ? 'rgba(50,150,255,0.85)' : 'rgba(255,255,255,0.08)' }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: ambient ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.18)' }}
          >
            <span className="text-sm">🌊</span>
          </div>
          <div>
            <div className="text-xs font-medium text-white">Ambient</div>
            <div className="text-[10px] text-white/70">{ambient ? 'On' : 'Off'}</div>
          </div>
        </button>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5">
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-sm">📶</div>
          <div>
            <div className="text-xs font-medium text-white">Wi-Fi</div>
            <div className="text-[10px] text-white/55">leftcoaststack</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5">
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-sm">🌙</div>
          <div>
            <div className="text-xs font-medium text-white">Focus</div>
            <div className="text-[10px] text-white/55">Off</div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white/5 px-3 py-2.5 mb-2">
        <div className="text-[10px] uppercase tracking-wider text-white/55 mb-1.5">Display</div>
        <div className="flex items-center gap-2">
          <span className="text-base">☀️</span>
          <input
            type="range"
            min={20}
            max={100}
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="flex-1 cc-slider"
          />
        </div>
      </div>
      <div className="rounded-xl bg-white/5 px-3 py-2.5">
        <div className="text-[10px] uppercase tracking-wider text-white/55 mb-1.5">Sound</div>
        <div className="flex items-center gap-2">
          <span className="text-base">🔈</span>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="flex-1 cc-slider"
          />
        </div>
      </div>

      <style jsx>{`
        .cc-slider { appearance: none; height: 6px; background: rgba(255,255,255,0.18); border-radius: 3px; outline: none; }
        .cc-slider::-webkit-slider-thumb { appearance: none; width: 16px; height: 16px; border-radius: 50%; background: white; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
        .cc-slider::-moz-range-thumb { width: 16px; height: 16px; border-radius: 50%; background: white; cursor: pointer; border: none; box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
      `}</style>
    </motion.div>
  )
}

interface MenuBarProps {
  activeApp?: string
  onOpenSpotlight?: () => void
}

export default function MenuBar({ activeApp = 'Finder', onOpenSpotlight }: MenuBarProps) {
  const [showAppleMenu, setShowAppleMenu] = useState(false)
  const [showAppMenu, setShowAppMenu] = useState(false)
  const [showControlCenter, setShowControlCenter] = useState(false)
  const [soundOn, setSoundOn] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSoundOn(isSoundEnabled())
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowAppleMenu(false)
        setShowAppMenu(false)
        setShowControlCenter(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Sync sound state in case Control Center changes it
  useEffect(() => {
    const i = setInterval(() => setSoundOn(isSoundEnabled()), 800)
    return () => clearInterval(i)
  }, [])

  return (
    <div
      ref={menuRef}
      className="absolute top-0 left-0 right-0 h-7 flex items-center px-2 z-[800] select-none text-white/90"
      style={{
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      <div className="flex items-center gap-0.5">
        <div className="relative">
          <button
            onClick={() => { setShowAppleMenu((v) => !v); setShowAppMenu(false); setShowControlCenter(false) }}
            className="px-3 py-0.5 rounded text-base hover:bg-white/15 transition-colors flex items-center"
            aria-label="Apple menu"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
          </button>
          <AnimatePresence>{showAppleMenu && <AppleMenu onClose={() => setShowAppleMenu(false)} />}</AnimatePresence>
        </div>

        <button
          onClick={() => { setShowAppMenu((v) => !v); setShowAppleMenu(false); setShowControlCenter(false) }}
          className="px-3 py-0.5 rounded text-sm font-semibold hover:bg-white/15 transition-colors"
        >
          {activeApp}
        </button>

        {['File', 'Edit', 'View', 'Window', 'Help'].map((m) => (
          <button
            key={m}
            className="px-3 py-0.5 rounded text-sm text-white/80 hover:bg-white/15 transition-colors"
          >
            {m}
          </button>
        ))}
      </div>

      <div className="ml-auto flex items-center gap-1 pr-1">
        <button
          onClick={() => {
            const next = !soundOn
            setSoundEnabled(next)
            setSoundOn(next)
            if (next) play(sounds.click)
          }}
          className="text-sm px-1.5 py-0.5 rounded hover:bg-white/15 transition-colors"
          title={soundOn ? 'Sound on' : 'Sound off'}
        >
          {soundOn ? '🔊' : '🔇'}
        </button>

        <button className="px-1 py-0.5 rounded hover:bg-white/15 transition-colors" aria-label="Wi-Fi">
          <svg className="w-4 h-4 text-white/85" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 18a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm0-4.5c-2.05 0-3.92.78-5.32 2.07a.75.75 0 1 0 1.02 1.1A6.27 6.27 0 0 1 12 15c1.6 0 3.06.6 4.17 1.58a.75.75 0 1 0 1-1.13A7.77 7.77 0 0 0 12 13.5zm0-4.5c-3.31 0-6.32 1.27-8.57 3.34a.75.75 0 1 0 1.02 1.1A11.04 11.04 0 0 1 12 10.5c2.93 0 5.6 1.14 7.55 3.01a.75.75 0 1 0 1.04-1.08A12.54 12.54 0 0 0 12 9zm0-4.5c-4.6 0-8.78 1.78-11.9 4.69a.75.75 0 1 0 1.02 1.1A15.04 15.04 0 0 1 12 6c4.13 0 7.89 1.6 10.7 4.21a.75.75 0 1 0 1.02-1.1A16.54 16.54 0 0 0 12 4.5z"/>
          </svg>
        </button>

        <div className="flex items-center gap-1 px-1.5 text-white/85">
          <span className="text-[10px] tabular-nums">87%</span>
          <div className="w-7 h-3.5 rounded-sm border border-white/60 relative flex items-center px-0.5">
            <div className="h-2 w-[18px] rounded-sm bg-green-400" />
          </div>
          <div className="w-0.5 h-2 rounded-sm bg-white/40" />
        </div>

        <button
          onClick={onOpenSpotlight}
          className="p-1 rounded hover:bg-white/15 transition-colors"
          title="Spotlight Search (⌘ Space)"
        >
          <svg className="w-4 h-4 text-white/85" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
        </button>

        <div className="relative">
          <button
            onClick={() => { setShowControlCenter((v) => !v); setShowAppleMenu(false); setShowAppMenu(false) }}
            className="p-1 rounded hover:bg-white/15 transition-colors"
            title="Control Center"
          >
            <svg className="w-4 h-4 text-white/85" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="2" />
              <rect x="14" y="3" width="7" height="7" rx="2" />
              <rect x="3" y="14" width="7" height="7" rx="2" />
              <rect x="14" y="14" width="7" height="7" rx="2" />
            </svg>
          </button>
          <AnimatePresence>{showControlCenter && <ControlCenter />}</AnimatePresence>
        </div>

        <div className="px-1.5 py-0.5 rounded hover:bg-white/15 transition-colors cursor-default">
          <Clock />
        </div>
      </div>
    </div>
  )
}
