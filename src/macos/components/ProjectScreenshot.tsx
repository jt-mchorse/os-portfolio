'use client'

import { useState } from 'react'
import type { Project } from '@/content/projects'
import { projectScreenshotUrl } from '@/content/projects'

interface ProjectScreenshotProps {
  project: Project
  width?: number
  height?: number
  className?: string
}

/**
 * Live screenshot of the project's website via WordPress mShots.
 * mShots returns a 1×1 placeholder while it renders the page,
 * so we show a branded skeleton until the image dimensions look real.
 */
export default function ProjectScreenshot({ project, width = 1280, height = 800, className }: ProjectScreenshotProps) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)
  const src = projectScreenshotUrl(project, width, height)

  return (
    <div
      className={`relative overflow-hidden ${className ?? ''}`}
      style={{
        background: `linear-gradient(135deg, ${project.brand.from} 0%, ${project.brand.to} 100%)`,
      }}
    >
      {/* Skeleton / brand fallback */}
      {(!loaded || errored) && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-center">
            <div className="text-3xl font-bold mb-1 opacity-90">{project.company}</div>
            <div className="text-sm opacity-60">{errored ? 'Preview unavailable' : 'Loading live preview…'}</div>
          </div>
          {/* shimmer */}
          {!errored && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.6s linear infinite',
              }}
            />
          )}
        </div>
      )}

      <img
        src={src}
        alt={`${project.title} live screenshot`}
        loading="lazy"
        onLoad={(e) => {
          // mShots sometimes returns a 1×1 placeholder while it renders.
          const img = e.currentTarget
          if (img.naturalWidth > 50) setLoaded(true)
          else {
            // Retry once after a short delay
            setTimeout(() => {
              img.src = src + (src.includes('?') ? '&' : '?') + 'r=' + Date.now()
            }, 2500)
          }
        }}
        onError={() => setErrored(true)}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 300ms ease',
        }}
      />

      <style jsx>{`
        @keyframes shimmer {
          from { background-position: -200% 0; }
          to { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}
