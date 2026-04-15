'use client'

import MenuBar from './chrome/MenuBar'
import Desktop from './chrome/Desktop'
import Dock from './chrome/Dock'
import { useWindowStore } from '@/store/windowStore'

export default function MacOSDesktop() {
  const { windows } = useWindowStore()
  const focusedWindow = windows.find((w) => w.isFocused)
  const activeApp = focusedWindow?.title ?? 'Finder'

  return (
    <div className="absolute inset-0 overflow-hidden select-none">
      <MenuBar activeApp={activeApp} />
      {/* Desktop area (below menu bar, above dock) */}
      <div className="absolute inset-0 top-7 bottom-0">
        <Desktop />
      </div>
      <Dock />
    </div>
  )
}
