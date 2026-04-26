'use client'

import { useEffect, useState } from 'react'
import MenuBar from './chrome/MenuBar'
import Desktop from './chrome/Desktop'
import Dock from './chrome/Dock'
import Spotlight from './chrome/Spotlight'
import AppSwitcher from './chrome/AppSwitcher'
import { useWindowStore } from '@/store/windowStore'

export default function MacOSDesktop() {
  const { windows } = useWindowStore()
  const focusedWindow = windows.find((w) => w.isFocused)
  const activeApp = focusedWindow?.title ?? 'Finder'

  const [spotlightOpen, setSpotlightOpen] = useState(false)
  const [switcherOpen, setSwitcherOpen] = useState(false)

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Space → Spotlight
      if ((e.metaKey || e.ctrlKey) && e.code === 'Space') {
        e.preventDefault()
        setSpotlightOpen((v) => !v)
        return
      }
      // Cmd/Alt + Tab → App Switcher
      if ((e.metaKey || e.altKey) && e.key === 'Tab') {
        e.preventDefault()
        setSwitcherOpen(true)
        return
      }
      // Esc closes overlays
      if (e.key === 'Escape') {
        setSpotlightOpen(false)
      }
    }
    const upHandler = (e: KeyboardEvent) => {
      // Release modifier closes the switcher
      if (switcherOpen && (e.key === 'Meta' || e.key === 'Alt' || e.key === 'Control')) {
        setSwitcherOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    window.addEventListener('keyup', upHandler)
    return () => {
      window.removeEventListener('keydown', handler)
      window.removeEventListener('keyup', upHandler)
    }
  }, [switcherOpen])

  return (
    <div className="absolute inset-0 overflow-hidden select-none">
      <MenuBar
        activeApp={activeApp}
        onOpenSpotlight={() => setSpotlightOpen(true)}
      />
      {/* Desktop area (below menu bar, above dock) */}
      <div className="absolute inset-0 top-7 bottom-0">
        <Desktop />
      </div>
      <Dock />
      <Spotlight open={spotlightOpen} onClose={() => setSpotlightOpen(false)} />
      <AppSwitcher open={switcherOpen} onClose={() => setSwitcherOpen(false)} />
    </div>
  )
}
