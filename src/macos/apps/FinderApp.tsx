'use client'

import { useState } from 'react'
import { projects, type Project } from '@/content/projects'
import { experience } from '@/content/experience'
import { useWindowStore } from '@/store/windowStore'

type SidebarSection = 'projects' | 'experience' | 'recent'

export default function FinderApp({ windowId }: { windowId: string; meta?: Record<string, unknown> }) {
  const [section, setSection] = useState<SidebarSection>('projects')
  const [selected, setSelected] = useState<string | null>(null)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const { openWindow } = useWindowStore()

  const openProject = (project: Project) => {
    openWindow({
      id: `project-detail-${project.id}-${Date.now()}`,
      appId: 'project-detail',
      title: project.title,
      x: Math.round(Math.random() * 160 + 120),
      y: Math.round(Math.random() * 80 + 60),
      width: 780,
      height: 600,
      isMinimized: false,
      meta: { projectId: project.id },
    })
  }

  const sidebarItems: { id: SidebarSection; icon: string; label: string }[] = [
    { id: 'recent', icon: '🕒', label: 'Recents' },
    { id: 'projects', icon: '📁', label: 'Projects' },
    { id: 'experience', icon: '💼', label: 'Experience' },
  ]

  return (
    <div className="flex h-full text-white" style={{ background: '#1e1e1e', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* Sidebar */}
      <div className="w-44 flex-shrink-0 border-r border-white/10 py-3 overflow-y-auto" style={{ background: '#252525' }}>
        <div className="px-3 mb-1">
          <p className="text-[10px] font-semibold uppercase text-white/30 tracking-widest mb-1">Favorites</p>
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors"
              style={{
                background: section === item.id ? 'rgba(99,130,255,0.25)' : 'transparent',
                color: section === item.id ? '#fff' : 'rgba(255,255,255,0.65)',
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 flex-shrink-0" style={{ background: '#272727' }}>
          <span className="text-sm font-medium text-white/80">
            {section === 'projects' ? 'Projects' : section === 'experience' ? 'Work Experience' : 'Recents'}
          </span>
          <div className="flex gap-1">
            {(['grid', 'list'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-2 py-1 rounded text-xs transition-colors"
                style={{
                  background: view === v ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: view === v ? '#fff' : 'rgba(255,255,255,0.45)',
                }}
              >
                {v === 'grid' ? '⊞' : '☰'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 macos-scrollbar">
          {(section === 'projects' || section === 'recent') && (
            view === 'grid' ? (
              <div className="grid grid-cols-3 gap-3">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelected(p.id)}
                    onDoubleClick={() => openProject(p)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all text-left"
                    style={{
                      background: selected === p.id ? 'rgba(99,130,255,0.25)' : 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center text-2xl">
                      📦
                    </div>
                    <span className="text-xs text-center text-white/80 leading-tight">{p.title}</span>
                    <span className="text-[10px] text-white/35">{p.company}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelected(p.id)}
                    onDoubleClick={() => openProject(p)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all"
                    style={{
                      background: selected === p.id ? 'rgba(99,130,255,0.25)' : 'transparent',
                    }}
                  >
                    <span className="text-xl">📦</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/90 truncate">{p.title}</p>
                      <p className="text-xs text-white/40 truncate">{p.company} · {p.period}</p>
                    </div>
                  </button>
                ))}
              </div>
            )
          )}

          {section === 'experience' && (
            <div className="space-y-2">
              {experience.map((exp) => (
                <button
                  key={exp.id}
                  onClick={() => setSelected(exp.id)}
                  className="w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all"
                  style={{
                    background: selected === exp.id ? 'rgba(99,130,255,0.22)' : 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-lg flex-shrink-0 mt-0.5">
                    💼
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/90">{exp.title}</p>
                    <p className="text-xs text-blue-400">{exp.company}</p>
                    <p className="text-xs text-white/40 mt-0.5">{exp.period}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="px-4 py-1.5 border-t border-white/10 flex-shrink-0" style={{ background: '#222' }}>
          <span className="text-[11px] text-white/35">
            {section === 'projects' ? `${projects.length} items` : `${experience.length} positions`}
            {selected ? ' · 1 selected' : ''}
          </span>
        </div>
      </div>
    </div>
  )
}
