'use client'

import { useState } from 'react'
import type { Project } from '@/content/projects'
import { projectLogoUrl, projectFaviconUrl } from '@/content/projects'

interface ProjectIconProps {
  project: Project
  size?: number
  rounded?: number
}

/**
 * Renders a project's logo using Clearbit, falling back to Google favicon,
 * then to a gradient tile with the company's first letter.
 */
export default function ProjectIcon({ project, size = 56, rounded = 12 }: ProjectIconProps) {
  const [stage, setStage] = useState<'clearbit' | 'favicon' | 'gradient'>('clearbit')
  const initial = project.company.charAt(0).toUpperCase()

  if (stage === 'gradient') {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: rounded,
          background: `linear-gradient(135deg, ${project.brand.from} 0%, ${project.brand.to} 100%)`,
          boxShadow: '0 4px 14px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
        }}
        className="flex items-center justify-center text-white font-bold flex-shrink-0"
      >
        <span style={{ fontSize: Math.round(size * 0.42) }}>{initial}</span>
      </div>
    )
  }

  const src = stage === 'clearbit' ? projectLogoUrl(project, size * 2) : projectFaviconUrl(project, size * 2)

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: rounded,
        background: `linear-gradient(135deg, ${project.brand.from}22 0%, ${project.brand.to}22 100%)`,
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
      }}
      className="overflow-hidden flex items-center justify-center flex-shrink-0"
    >
      <img
        src={src}
        alt={`${project.company} logo`}
        width={size}
        height={size}
        style={{
          width: '70%',
          height: '70%',
          objectFit: 'contain',
        }}
        onError={() => {
          if (stage === 'clearbit') setStage('favicon')
          else setStage('gradient')
        }}
      />
    </div>
  )
}
