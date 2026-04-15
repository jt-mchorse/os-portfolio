'use client'

import { useState } from 'react'
import { skillGroups, levelColors, levelLabels, type SkillLevel } from '@/content/skills'

export default function SkillsApp({ windowId }: { windowId: string; meta?: Record<string, unknown> }) {
  const [activeTab, setActiveTab] = useState(0)
  const group = skillGroups[activeTab]

  return (
    <div className="flex flex-col h-full text-white" style={{ background: '#1e1e1e' }}>
      {/* Tab bar */}
      <div
        className="flex overflow-x-auto flex-shrink-0 border-b border-white/10 px-2 pt-2"
        style={{ background: '#252525' }}
      >
        {skillGroups.map((g, i) => (
          <button
            key={g.category}
            onClick={() => setActiveTab(i)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs whitespace-nowrap rounded-t-md transition-all border-b-2 mr-1"
            style={{
              borderBottomColor: activeTab === i ? '#6366f1' : 'transparent',
              color: activeTab === i ? '#fff' : 'rgba(255,255,255,0.45)',
              background: activeTab === i ? 'rgba(99,102,241,0.12)' : 'transparent',
            }}
          >
            <span>{g.icon}</span>
            <span>{g.category}</span>
          </button>
        ))}
      </div>

      {/* Skills list */}
      <div className="flex-1 overflow-y-auto p-5 macos-scrollbar">
        <div className="space-y-3">
          {group.skills.map((skill) => (
            <div key={skill.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-white/85">{skill.name}</span>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    color: levelColors[skill.level],
                    background: `${levelColors[skill.level]}22`,
                    border: `1px solid ${levelColors[skill.level]}44`,
                  }}
                >
                  {levelLabels[skill.level]}
                </span>
              </div>
              <SkillBar level={skill.level} />
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-5 py-3 border-t border-white/10 flex-shrink-0" style={{ background: '#222' }}>
        {(['expert', 'strong', 'proficient'] as SkillLevel[]).map((l) => (
          <div key={l} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: levelColors[l] }} />
            <span className="text-[10px] text-white/40">{levelLabels[l]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SkillBar({ level }: { level: SkillLevel }) {
  const widths: Record<SkillLevel, string> = { expert: '95%', strong: '75%', proficient: '55%' }
  return (
    <div className="h-1.5 rounded-full w-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: widths[level], background: levelColors[level] }}
      />
    </div>
  )
}
