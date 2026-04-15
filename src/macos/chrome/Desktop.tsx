'use client'

import { useState } from 'react'
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

const DESKTOP_ICONS = [
  { id: 'resume-file', label: 'Resume.pdf', icon: '📄', appId: 'resume' as const },
  { id: 'projects-folder', label: 'Projects', icon: '📁', appId: 'projects' as const },
  { id: 'skills-app', label: 'Skills', icon: '🛠', appId: 'skills' as const },
  { id: 'contact-app', label: 'Contact', icon: '✉️', appId: 'contact' as const },
  { id: 'switch-os', label: 'Switch OS', icon: '🔄', appId: 'switch-os' as const },
]

export default function Desktop() {
  const { windows, openWindow } = useWindowStore()
  const [selected, setSelected] = useState<string | null>(null)

  const handleDoubleClick = (icon: (typeof DESKTOP_ICONS)[0]) => {
    const defaults: Record<string, { width: number; height: number }> = {
      finder: { width: 760, height: 520 },
      projects: { width: 760, height: 520 },
      skills: { width: 680, height: 560 },
      resume: { width: 720, height: 900 },
      contact: { width: 540, height: 480 },
      'switch-os': { width: 400, height: 220 },
    }
    const size = defaults[icon.appId] ?? { width: 600, height: 460 }
    openWindow({
      id: `${icon.appId}-${Date.now()}`,
      appId: icon.appId,
      title: icon.label,
      x: Math.round(Math.random() * 200 + 80),
      y: Math.round(Math.random() * 100 + 60),
      ...size,
      isMinimized: false,
    })
  }

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 40%, #24243e 70%, #0f3460 100%)',
      }}
      onClick={() => setSelected(null)}
    >
      {/* Desktop icons — top right column */}
      <div className="absolute top-12 right-4 flex flex-col gap-2">
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
          <MacWindow key={win.id} window={win}>
            <AppComponent windowId={win.id} meta={win.meta} />
          </MacWindow>
        )
      })}
    </div>
  )
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
        className="text-xs text-center leading-tight break-words w-full text-white"
        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
      >
        {icon.label}
      </span>
    </div>
  )
}
