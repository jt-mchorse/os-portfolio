'use client'

import type { AppId } from '@/store/windowStore'

export interface AppDefinition {
  id: AppId
  label: string
  emoji: string
  /** Lucide icon name, optional richer icon shown alongside emoji */
  iconHint?: string
  defaultSize: { width: number; height: number }
  /** Searchable keywords for Spotlight */
  keywords: string[]
  /** Short description shown in Spotlight result row */
  subtitle: string
}

export const APP_REGISTRY: AppDefinition[] = [
  {
    id: 'finder',
    label: 'Finder',
    emoji: '🗂',
    defaultSize: { width: 760, height: 520 },
    keywords: ['finder', 'files', 'browse', 'projects', 'work'],
    subtitle: 'Browse projects and experience',
  },
  {
    id: 'projects',
    label: 'Projects',
    emoji: '📁',
    defaultSize: { width: 760, height: 520 },
    keywords: ['projects', 'portfolio', 'work', 'apps'],
    subtitle: '8 case studies',
  },
  {
    id: 'skills',
    label: 'Skills',
    emoji: '🛠',
    defaultSize: { width: 680, height: 560 },
    keywords: ['skills', 'tech', 'stack', 'languages', 'frameworks'],
    subtitle: 'Languages, frameworks, tooling',
  },
  {
    id: 'resume',
    label: 'Resume',
    emoji: '📄',
    defaultSize: { width: 720, height: 900 },
    keywords: ['resume', 'cv', 'pdf', 'experience'],
    subtitle: 'Resume PDF',
  },
  {
    id: 'contact',
    label: 'Contact',
    emoji: '✉️',
    defaultSize: { width: 540, height: 480 },
    keywords: ['contact', 'email', 'mail', 'reach'],
    subtitle: 'Send a message',
  },
  {
    id: 'assistant',
    label: 'Assistant',
    emoji: '🤖',
    defaultSize: { width: 560, height: 500 },
    keywords: ['assistant', 'ai', 'chat', 'bot', 'gpt'],
    subtitle: 'AI assistant — coming soon',
  },
  {
    id: 'about-mac',
    label: 'About This Mac',
    emoji: '',
    defaultSize: { width: 540, height: 360 },
    keywords: ['about', 'system', 'info', 'mac'],
    subtitle: 'About this portfolio',
  },
  {
    id: 'switch-os',
    label: 'Switch OS',
    emoji: '🔄',
    defaultSize: { width: 400, height: 280 },
    keywords: ['switch', 'restart', 'arch', 'os', 'reboot', 'linux'],
    subtitle: 'Restart and choose another OS',
  },
]

export function findApp(id: AppId): AppDefinition | undefined {
  return APP_REGISTRY.find((a) => a.id === id)
}

export function searchApps(query: string): AppDefinition[] {
  const q = query.trim().toLowerCase()
  if (!q) return APP_REGISTRY.slice(0, 6)
  return APP_REGISTRY.filter((a) => {
    if (a.label.toLowerCase().includes(q)) return true
    return a.keywords.some((k) => k.toLowerCase().includes(q))
  })
}

/** Center the window in the desktop area */
export function centerForApp(app: AppDefinition): { x: number; y: number } {
  const winW = globalThis.window?.innerWidth ?? 1280
  const winH = globalThis.window?.innerHeight ?? 800
  return {
    x: Math.max(20, Math.round(winW / 2 - app.defaultSize.width / 2)),
    y: Math.max(40, Math.round(winH / 2 - app.defaultSize.height / 2)),
  }
}
