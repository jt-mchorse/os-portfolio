'use client'

import { about } from '@/content/about'

export default function AboutMacApp({ windowId }: { windowId: string; meta?: Record<string, unknown> }) {
  return (
    <div className="flex flex-col h-full text-white" style={{ background: '#1e1e1e' }}>
      {/* Top identity section */}
      <div
        className="flex items-center gap-6 px-8 py-6 border-b border-white/10"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}
      >
        {/* Avatar placeholder */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.12)' }}
        >
          👨‍💻
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">{about.name}</h2>
          <p className="text-sm text-blue-400 mt-0.5">{about.title}</p>
          <p className="text-xs text-white/40 mt-1">{about.location}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-px p-0.5 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
        {[
          { label: 'Years of Experience', value: '12+' },
          { label: 'Production Apps', value: '15+' },
          { label: 'Developers Mentored', value: '20+' },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col items-center py-4" style={{ background: '#1e1e1e' }}>
            <span className="text-2xl font-bold text-white">{stat.value}</span>
            <span className="text-[10px] text-white/35 mt-1 text-center px-2">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="px-8 py-5 flex-1 overflow-y-auto macos-scrollbar">
        <p className="text-sm text-white/65 leading-relaxed">{about.summary}</p>

        <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30 mt-5 mb-3">Key Achievements</h3>
        <ul className="space-y-2">
          {about.keyAchievements.map((a, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-white/65">
              <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-8 py-3 border-t border-white/10 flex-shrink-0"
        style={{ background: '#1a1a1a' }}
      >
        <span className="text-xs text-white/25">leftcoaststack.com</span>
        <a
          href={`mailto:${about.email}`}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          {about.email}
        </a>
      </div>
    </div>
  )
}
