'use client'

import { useState, useEffect, useRef } from 'react'
import { useOSStore } from '@/store/osStore'
import { useWindowStore } from '@/store/windowStore'
import { about } from '@/content/about'
import { isSoundEnabled, setSoundEnabled, play, sounds } from '@/lib/sounds'

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

  return <span className="text-xs">{time}</span>
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
      danger: false,
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
    <div
      className="absolute top-full left-0 mt-0.5 w-52 rounded-xl overflow-hidden shadow-2xl z-[1000] py-1"
      style={{ background: 'rgba(36,36,36,0.95)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      {items.map((item, i) =>
        item.label === 'separator' ? (
          <div key={i} className="my-1 mx-3 border-t border-white/10" />
        ) : (
          <button
            key={i}
            onClick={item.action}
            className="w-full text-left px-4 py-1.5 text-sm text-white/90 hover:bg-blue-500 transition-colors"
          >
            {item.label}
          </button>
        )
      )}
    </div>
  )
}

export default function MenuBar({ activeApp = 'Finder' }: { activeApp?: string }) {
  const [showAppleMenu, setShowAppleMenu] = useState(false)
  const [showAppMenu, setShowAppMenu] = useState(false)
  const [soundOn, setSoundOn] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setSoundOn(isSoundEnabled()) }, [])

  const handleToggleSound = () => {
    const next = !soundOn
    setSoundEnabled(next)
    setSoundOn(next)
    if (next) play(sounds.click)
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowAppleMenu(false)
        setShowAppMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
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
      {/* Left: Apple + app menus */}
      <div className="flex items-center gap-0.5">
        {/* Apple menu */}
        <div className="relative">
          <button
            onClick={() => { setShowAppleMenu((v) => !v); setShowAppMenu(false) }}
            className="px-3 py-0.5 rounded text-sm font-semibold hover:bg-white/15 transition-colors"
          >

          </button>
          {showAppleMenu && <AppleMenu onClose={() => setShowAppleMenu(false)} />}
        </div>

        {/* Active app name */}
        <button
          onClick={() => { setShowAppMenu((v) => !v); setShowAppleMenu(false) }}
          className="px-3 py-0.5 rounded text-sm font-semibold hover:bg-white/15 transition-colors"
        >
          {activeApp}
        </button>

        {/* Generic app menu items (stub) */}
        {['File', 'Edit', 'View', 'Window', 'Help'].map((m) => (
          <button
            key={m}
            className="px-3 py-0.5 rounded text-sm text-white/80 hover:bg-white/15 transition-colors"
          >
            {m}
          </button>
        ))}
      </div>

      {/* Right: status area */}
      <div className="ml-auto flex items-center gap-3 pr-2">
        {/* Sound toggle */}
        <button
          onClick={handleToggleSound}
          className="text-sm text-white/70 hover:text-white transition-colors"
          title={soundOn ? 'Sound on' : 'Sound off'}
        >
          {soundOn ? '🔊' : '🔇'}
        </button>
        {/* Wifi stub */}
        <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 24 24">
          <path d="M1.5 8.5C4.6 5.4 8.8 3.5 13 3.5s8.4 1.9 11.5 5m-3.5 3.5C18.5 9.5 15.9 8 13 8s-5.5 1.5-7.5 3.5m2.5 2.5C9.3 12.3 11 11.5 13 11.5s3.7.8 5 2M13 17a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
        </svg>
        {/* Battery stub */}
        <div className="flex items-center gap-1 text-white/80">
          <div className="w-7 h-3.5 rounded-sm border border-white/60 relative flex items-center px-0.5">
            <div className="h-2 w-5 rounded-sm bg-green-400" />
          </div>
          <div className="w-0.5 h-2 rounded-sm bg-white/40" />
        </div>
        <Clock />
      </div>
    </div>
  )
}
