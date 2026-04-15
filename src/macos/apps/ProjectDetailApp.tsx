'use client'

import { projects } from '@/content/projects'
import Image from 'next/image'

export default function ProjectDetailApp({ meta }: { windowId: string; meta?: Record<string, unknown> }) {
  const projectId = meta?.projectId as string
  const project = projects.find((p) => p.id === projectId)

  if (!project) return (
    <div className="flex items-center justify-center h-full text-white/40 text-sm">Project not found</div>
  )

  return (
    <div className="h-full overflow-y-auto text-white macos-scrollbar" style={{ background: '#1a1a1a' }}>
      {/* Hero screenshot */}
      <div
        className="w-full h-44 flex-shrink-0 relative flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
      >
        <Image
          src={project.screenshot}
          alt={project.title}
          fill
          className="object-cover opacity-40"
          onError={() => {}}
          unoptimized
        />
        <div className="relative z-10 text-center px-6">
          <h2 className="text-xl font-semibold text-white">{project.title}</h2>
          <p className="text-sm text-blue-400 mt-1">{project.company} · {project.period}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-5">
        {/* Tagline */}
        <p className="text-base text-white/70 leading-relaxed italic border-l-2 border-blue-500 pl-4">
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
                style={{ background: 'rgba(99,130,255,0.18)', color: '#93c5fd', border: '1px solid rgba(99,130,255,0.3)' }}
              >
                {tech}
              </span>
            ))}
          </div>
        </Section>

        {project.liveUrl && (
          <div className="pt-1">
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              🔗 View live site
            </a>
          </div>
        )}
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
