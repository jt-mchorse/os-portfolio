import { about } from '@/content/about'
import { projects } from '@/content/projects'
import { experience } from '@/content/experience'
import { skillGroups } from '@/content/skills'

export interface FSNode {
  type: 'file' | 'dir'
  name: string
  content?: string
  children?: Record<string, FSNode>
}

function buildResumeText(): string {
  return `
${about.name.toUpperCase()}
${about.title}
${about.location} | ${about.email}

${about.summary}

═══════════════════════════════════════
EXPERIENCE
═══════════════════════════════════════

${experience
  .map(
    (e) => `${e.title} | ${e.company}
${e.period}
${e.bullets.map((b) => `  • ${b}`).join('\n')}
  Tech: ${e.technologies.join(', ')}
`
  )
  .join('\n')}

═══════════════════════════════════════
SKILLS
═══════════════════════════════════════

${skillGroups
  .map(
    (g) => `${g.category}:
${g.skills.map((s) => `  • ${s.name} (${s.level})`).join('\n')}`
  )
  .join('\n\n')}

═══════════════════════════════════════
KEY ACHIEVEMENTS
═══════════════════════════════════════

${about.keyAchievements.map((a) => `  ✓ ${a}`).join('\n')}
`.trim()
}

function buildProjectsDir(): Record<string, FSNode> {
  const children: Record<string, FSNode> = {}
  projects.forEach((p) => {
    const slug = p.id.replace(/-/g, '_')
    children[slug] = {
      type: 'file',
      name: slug,
      content: `PROJECT: ${p.title}
COMPANY: ${p.company}
PERIOD:  ${p.period}

TAGLINE
  ${p.tagline}

PROBLEM
  ${p.problem}

CONTRIBUTION
  ${p.contribution}

OUTCOME
  ${p.outcome}

STACK
  ${p.techStack.join(', ')}
${p.liveUrl ? `\nURL\n  ${p.liveUrl}` : ''}`.trim(),
    }
  })
  return children
}

export const filesystem: FSNode = {
  type: 'dir',
  name: '~',
  children: {
    'about.md': {
      type: 'file',
      name: 'about.md',
      content: `# ${about.name}

**${about.title}**
${about.location} | ${about.email}

${about.summary}

## Key Achievements

${about.keyAchievements.map((a) => `- ${a}`).join('\n')}
`,
    },
    'skills.txt': {
      type: 'file',
      name: 'skills.txt',
      content: skillGroups
        .map(
          (g) =>
            `[${g.category}]\n${g.skills.map((s) => `  ${s.name.padEnd(40)} ${s.level}`).join('\n')}`
        )
        .join('\n\n'),
    },
    'resume.pdf': {
      type: 'file',
      name: 'resume.pdf',
      content: '[Binary PDF — use `resume --pdf` to open in viewer or `cat resume.txt` for text]',
    },
    'resume.txt': {
      type: 'file',
      name: 'resume.txt',
      content: buildResumeText(),
    },
    'contact.txt': {
      type: 'file',
      name: 'contact.txt',
      content: `Email:    ${about.email}
Phone:    ${about.phone}
GitHub:   ${about.github}
LinkedIn: ${about.linkedin}
Web:      https://leftcoaststack.com`,
    },
    projects: {
      type: 'dir',
      name: 'projects',
      children: buildProjectsDir(),
    },
  },
}

export function resolvePath(path: string, cwd: string[]): FSNode | null {
  const parts = path.startsWith('~') || path.startsWith('/')
    ? path.replace('~', '').split('/').filter(Boolean)
    : [...cwd, ...path.split('/').filter(Boolean)]

  // Resolve . and ..
  const resolved: string[] = []
  for (const p of parts) {
    if (p === '.') continue
    if (p === '..') { resolved.pop(); continue }
    resolved.push(p)
  }

  let node: FSNode = filesystem
  for (const part of resolved) {
    if (node.type !== 'dir' || !node.children?.[part]) return null
    node = node.children[part]
  }
  return node
}

export function cwdToString(cwd: string[]): string {
  return cwd.length === 0 ? '~' : `~/${cwd.join('/')}`
}
