'use client'

import { useEffect, useRef, useState } from 'react'
import { useWindowStore } from '@/store/windowStore'
import MacWindow from '@/macos/window/MacWindow'
import FinderApp from '@/macos/apps/FinderApp'
import SkillsApp from '@/macos/apps/SkillsApp'
import ResumeApp from '@/macos/apps/ResumeApp'
import ContactApp from '@/macos/apps/ContactApp'
import AboutMacApp from '@/macos/apps/AboutMacApp'
import SwitchOSApp from '@/macos/apps/SwitchOSApp'
import AssistantApp from '@/macos/apps/AssistantApp'
import ProjectDetailApp from '@/macos/apps/ProjectDetailApp'
import { APP_REGISTRY, centerForApp, findApp } from '@/macos/appRegistry'
import { play, sounds, resumeAmbientIfEnabled } from '@/lib/sounds'
import type { AppId } from '@/store/windowStore'

const APP_COMPONENTS: Record<string, React.ComponentType<{ windowId: string; meta?: Record<string, unknown> }>> = {
  finder: FinderApp,
  projects: FinderApp,
  skills: SkillsApp,
  resume: ResumeApp,
  contact: ContactApp,
  'about-mac': AboutMacApp,
  'switch-os': SwitchOSApp,
  assistant: AssistantApp,
  'project-detail': ProjectDetailApp,
}

const DESKTOP_ICONS: { id: string; label: string; icon: string; appId: AppId }[] = [
  { id: 'resume-file', label: 'Resume.pdf', icon: '📄', appId: 'resume' },
  { id: 'projects-folder', label: 'Projects', icon: '📁', appId: 'projects' },
  { id: 'skills-app', label: 'Skills', icon: '🛠', appId: 'skills' },
  { id: 'contact-app', label: 'Contact', icon: '✉️', appId: 'contact' },
  { id: 'switch-os', label: 'Switch OS', icon: '🔄', appId: 'switch-os' },
]

export default function Desktop() {
  const { windows, openWindow } = useWindowStore()
  const [selected, setSelected] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [wallpaper, setWallpaper] = useState<'sequoia' | 'sonoma' | 'midnight' | 'aurora'>('sequoia')
  const containerRef = useRef<HTMLDivElement>(null)

  // Mouse parallax for wallpaper
  const [parallax, setParallax] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 12
      const y = (e.clientY / window.innerHeight - 0.5) * 12
      setParallax({ x, y })
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  useEffect(() => {
    // Resume ambient sound on first user gesture
    const onceClick = () => { resumeAmbientIfEnabled() }
    window.addEventListener('click', onceClick, { once: true })
    return () => window.removeEventListener('click', onceClick)
  }, [])

  const openApp = (appId: AppId, label: string) => {
    const def = findApp(appId)
    const size = def?.defaultSize ?? { width: 600, height: 460 }
    const pos = def ? centerForApp(def) : { x: 120, y: 80 }
    openWindow({
      id: `${appId}-${Date.now()}`,
      appId,
      title: label,
      x: pos.x + Math.round(Math.random() * 60 - 30),
      y: pos.y + Math.round(Math.random() * 30 - 15),
      ...size,
      isMinimized: false,
    })
  }

  const handleDoubleClick = (icon: (typeof DESKTOP_ICONS)[0]) => {
    play(sounds.click)
    openApp(icon.appId, icon.label)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-window]')) return
    e.preventDefault()
    setSelected(null)
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  // Click outside closes context menu
  useEffect(() => {
    if (!contextMenu) return
    const close = () => setContextMenu(null)
    window.addEventListener('click', close)
    window.addEventListener('contextmenu', close)
    return () => {
      window.removeEventListener('click', close)
      window.removeEventListener('contextmenu', close)
    }
  }, [contextMenu])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      onClick={() => setSelected(null)}
      onContextMenu={handleContextMenu}
    >
      {/* Wallpaper background — multi-layer with subtle parallax */}
      <Wallpaper variant={wallpaper} parallax={parallax} />

      {/* Desktop icons — right column */}
      <div className="absolute top-6 right-4 flex flex-col gap-2 z-10">
        {DESKTOP_ICONS.map((icon) => (
          <DesktopIcon
            key={icon.id}
            icon={icon}
            selected={selected === icon.id}
            onSelect={(e) => { e.stopPropagation(); setSelected(icon.id) }}
            onOpen={() => handleDoubleClick(icon)}
          />
        ))}
      </div>

      {/* Windows */}
      {windows.map((win) => {
        const AppComponent = APP_COMPONENTS[win.appId]
        if (!AppComponent) return null
        return (
          <div data-window key={win.id}>
            <MacWindow window={win}>
              <AppComponent windowId={win.id} meta={win.meta} />
            </MacWindow>
          </div>
        )
      })}

      {/* Right-click context menu */}
      {contextMenu && (
        <DesktopContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onWallpaper={(w) => {
            setWallpaper(w)
            setContextMenu(null)
          }}
          currentWallpaper={wallpaper}
        />
      )}
    </div>
  )
}

function Wallpaper({
  variant,
  parallax,
}: {
  variant: 'sequoia' | 'sonoma' | 'midnight' | 'aurora'
  parallax: { x: number; y: number }
}) {
  const presets = {
    sequoia: {
      gradient:
        'radial-gradient(ellipse at 25% 30%, #6e3a8e 0%, transparent 55%), radial-gradient(ellipse at 75% 70%, #2563eb 0%, transparent 55%), linear-gradient(180deg, #1a1240 0%, #0f0c29 100%)',
      blob1: 'rgba(168, 85, 247, 0.45)',
      blob2: 'rgba(59, 130, 246, 0.42)',
      blob3: 'rgba(236, 72, 153, 0.28)',
    },
    sonoma: {
      gradient:
        'radial-gradient(ellipse at 30% 35%, #ec4899 0%, transparent 55%), radial-gradient(ellipse at 80% 70%, #3b82f6 0%, transparent 60%), linear-gradient(180deg, #581c87 0%, #1e3a8a 100%)',
      blob1: 'rgba(236, 72, 153, 0.5)',
      blob2: 'rgba(99, 102, 241, 0.45)',
      blob3: 'rgba(251, 146, 60, 0.25)',
    },
    midnight: {
      gradient:
        'radial-gradient(ellipse at 20% 20%, #0f3460 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, #1e1b4b 0%, transparent 60%), linear-gradient(180deg, #020617 0%, #0a0e27 100%)',
      blob1: 'rgba(30, 64, 175, 0.4)',
      blob2: 'rgba(15, 23, 42, 0.7)',
      blob3: 'rgba(67, 56, 202, 0.3)',
    },
    aurora: {
      gradient:
        'radial-gradient(ellipse at 30% 40%, #10b981 0%, transparent 55%), radial-gradient(ellipse at 70% 70%, #06b6d4 0%, transparent 60%), linear-gradient(180deg, #042f2e 0%, #0c4a6e 100%)',
      blob1: 'rgba(16, 185, 129, 0.45)',
      blob2: 'rgba(6, 182, 212, 0.42)',
      blob3: 'rgba(132, 204, 22, 0.22)',
    },
  }
  const p = presets[variant]
  return (
    <>
      <div className="absolute inset-0" style={{ background: p.gradient, transition: 'background 600ms ease' }} />
      {/* Floating soft blobs for depth */}
      <div
        className="absolute rounded-full"
        style={{
          width: 720,
          height: 720,
          left: '5%',
          top: '5%',
          background: p.blob1,
          filter: 'blur(120px)',
          transform: `translate(${parallax.x * 0.6}px, ${parallax.y * 0.6}px)`,
          transition: 'transform 600ms ease-out, background 600ms ease',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 580,
          height: 580,
          right: '5%',
          bottom: '8%',
          background: p.blob2,
          filter: 'blur(110px)',
          transform: `translate(${parallax.x * -0.5}px, ${parallax.y * -0.5}px)`,
          transition: 'transform 600ms ease-out, background 600ms ease',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 420,
          height: 420,
          left: '50%',
          top: '60%',
          background: p.blob3,
          filter: 'blur(90px)',
          transform: `translate(${parallax.x * 0.3}px, ${parallax.y * 0.3}px)`,
          transition: 'transform 600ms ease-out, background 600ms ease',
        }}
      />
      {/* Subtle vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.45) 100%)' }}
      />
    </>
  )
}

function DesktopContextMenu({
  x,
  y,
  onWallpaper,
  currentWallpaper,
}: {
  x: number
  y: number
  onWallpaper: (w: 'sequoia' | 'sonoma' | 'midnight' | 'aurora') => void
  currentWallpaper: string
}) {
  const wallpapers: { id: 'sequoia' | 'sonoma' | 'midnight' | 'aurora'; label: string }[] = [
    { id: 'sequoia', label: 'Sequoia' },
    { id: 'sonoma', label: 'Sonoma' },
    { id: 'midnight', label: 'Midnight' },
    { id: 'aurora', label: 'Aurora' },
  ]
  const [showWallpaperSub, setShowWallpaperSub] = useState(false)
  // Clamp menu to viewport
  const menuW = 220
  const menuH = 200
  const px = Math.min(x, window.innerWidth - menuW - 8)
  const py = Math.min(y, window.innerHeight - menuH - 8)
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute py-1 rounded-lg overflow-visible z-[1200]"
      style={{
        left: px,
        top: py,
        width: menuW,
        background: 'rgba(40,40,44,0.92)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 12px 48px rgba(0,0,0,0.55)',
      }}
    >
      <CtxItem label="New Folder" disabled />
      <CtxSeparator />
      <div
        className="relative"
        onMouseEnter={() => setShowWallpaperSub(true)}
        onMouseLeave={() => setShowWallpaperSub(false)}
      >
        <CtxItem label="Change Wallpaper" submenu />
        {showWallpaperSub && (
          <div
            className="absolute left-full top-0 ml-1 py-1 rounded-lg"
            style={{
              width: 160,
              background: 'rgba(40,40,44,0.92)',
              backdropFilter: 'blur(40px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {wallpapers.map((w) => (
              <button
                key={w.id}
                onClick={() => onWallpaper(w.id)}
                className="w-full text-left px-3 py-1.5 text-sm text-white/90 hover:bg-blue-500/85 transition-colors flex items-center justify-between"
              >
                {w.label}
                {currentWallpaper === w.id && <span className="text-xs">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
      <CtxSeparator />
      <CtxItem label="Use Stacks" disabled />
      <CtxItem label="Sort By" disabled />
      <CtxSeparator />
      <CtxItem label="Show View Options" disabled />
    </div>
  )
}

function CtxItem({
  label,
  disabled,
  submenu,
  onClick,
}: {
  label: string
  disabled?: boolean
  submenu?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full text-left px-3 py-1.5 text-sm text-white/90 hover:bg-blue-500/85 transition-colors disabled:text-white/30 disabled:hover:bg-transparent flex items-center justify-between"
    >
      {label}
      {submenu && <span className="text-white/50 text-xs">›</span>}
    </button>
  )
}

function CtxSeparator() {
  return <div className="my-1 mx-3 border-t border-white/10" />
}

function DesktopIcon({
  icon,
  selected,
  onSelect,
  onOpen,
}: {
  icon: { id: string; label: string; icon: string; appId: string }
  selected: boolean
  onSelect: (e: React.MouseEvent) => void
  onOpen: () => void
}) {
  return (
    <div
      className="flex flex-col items-center gap-1 cursor-default w-20 rounded-lg p-1.5 transition-all"
      style={{
        background: selected ? 'rgba(100,140,255,0.35)' : 'transparent',
        userSelect: 'none',
      }}
      onClick={onSelect}
      onDoubleClick={onOpen}
    >
      <div className="text-4xl">{icon.icon}</div>
      <span
        className="text-xs text-center leading-tight break-words w-full text-white font-medium"
        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.85)' }}
      >
        {icon.label}
      </span>
    </div>
  )
}
