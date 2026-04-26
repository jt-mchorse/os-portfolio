'use client'

import { useState } from 'react'
import type { Project } from '@/content/projects'
import { projectScreenshotUrl } from '@/content/projects'

interface ProjectScreenshotProps {
  project: Project
  className?: string
}

/**
 * Static screenshot of the project's live website.
 * Falls back to the brand gradient + company name if the image is missing.
 */
export default function ProjectScreenshot({ project, className }: ProjectScreenshotProps) {
  const [errored, setErrored] = useState(false)
  const src = projectScreenshotUrl(project)

  return (
    <div
      className={`relative overflow-hidden ${className ?? ''}`}
      style={{
        background: `linear-gradient(135deg, ${project.brand.from} 0%, ${project.brand.to} 100%)`,
      }}
    >
      {errored && (
        <div className="absolute inset-0 flex items-center justify-center text-white text-center px-6">
          <div>
            <div className="text-3xl font-bold mb-1 opacity-95">{project.company}</div>
            <div className="text-sm opacity-70">{project.tagline}</div>
          </div>
        </div>
      )}
      <img
        src={src}
        alt={`${project.title} live screenshot`}
        loading="lazy"
        onError={() => setErrored(true)}
        style={{
          display: errored ? 'none' : 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'top center',
        }}
      />
    </div>
  )
}
