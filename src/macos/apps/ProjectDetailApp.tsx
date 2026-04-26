'use client'

import { projects } from '@/content/projects'
import ProjectIcon from '@/macos/components/ProjectIcon'
import ProjectScreenshot from '@/macos/components/ProjectScreenshot'

export default function ProjectDetailApp({ meta }: { windowId: string; meta?: Record<string, unknown> }) {
  const projectId = meta?.projectId as string
  const project = projects.find((p) => p.id === projectId)

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full text-white/40 text-sm">
        Project not found
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto text-white macos-scrollbar" style={{ background: '#1a1a1a' }}>
      {/* Hero — live screenshot + brand overlay */}
      <div className="relative w-full overflow-hidden" style={{ height: 280 }}>
        <ProjectScreenshot project={project} className="absolute inset-0" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 60%, rgba(26,26,26,1) 100%)',
          }}
        />
        <div className="absolute bottom-4 left-6 right-6 flex items-end gap-4">
          <ProjectIcon project={project} size={64} rounded={14} />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-white drop-shadow-md truncate">{project.title}</h2>
            <p className="text-sm text-white/80 mt-0.5 drop-shadow truncate">
              {project.company} · {project.period}
            </p>
          </div>
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all hover:scale-105"
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Visit Site
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-5">
        {/* Tagline */}
        <p
          className="text-base text-white/80 leading-relaxed italic pl-4"
          style={{ borderLeft: `3px solid ${project.brand.from}` }}
        >
          {project.tagline}
        </p>

        <Section title="Problem">
          <p className="text-sm text-white/65 leading-relaxed">{project.problem}</p>
        </Section>

        <Section title="My Contribution">
          <p className="text-sm text-white/65 leading-relaxed">{project.contribution}</p>
        </Section>

        <Section title="Outcome">
          <p className="text-sm text-green-400 leading-relaxed">{project.outcome}</p>
        </Section>

        <Section title="Tech Stack">
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 rounded-full text-xs font-medium"
                style={{
                  background: 'rgba(99,130,255,0.18)',
                  color: '#93c5fd',
                  border: '1px solid rgba(99,130,255,0.3)',
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </Section>

        <div className="pt-1 flex items-center gap-3">
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg text-white transition-transform hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${project.brand.from} 0%, ${project.brand.to} 100%)`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            🔗 Open {new URL(project.liveUrl).hostname.replace(/^www\./, '')}
          </a>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-white/35 mb-2">{title}</h3>
      {children}
    </div>
  )
}
