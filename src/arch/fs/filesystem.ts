import { about } from '@/content/about'
import { projects } from '@/content/projects'
import { experience } from '@/content/experience'
import { skillGroups } from '@/content/skills'

export interface FSNode {
  type: 'file' | 'dir'
  name: string
  content?: string
  children?: Record<string, FSNode>
  /** Optional permission string for `ls -la` */
  perms?: string
}

// ─── Content builders ───────────────────────────────────────────────────────

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

// ─── Home directory ─────────────────────────────────────────────────────────

const homeChildren: Record<string, FSNode> = {
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
  'resume.txt': { type: 'file', name: 'resume.txt', content: buildResumeText() },
  'contact.txt': {
    type: 'file',
    name: 'contact.txt',
    content: `Email:    ${about.email}
Phone:    ${about.phone}
GitHub:   ${about.github}
LinkedIn: ${about.linkedin}
Web:      https://leftcoaststack.com`,
  },
  '.bashrc': {
    type: 'file',
    name: '.bashrc',
    content: `# ~/.bashrc

# If not running interactively, don't do anything
[[ $- != *i* ]] && return

alias ls='ls --color=auto'
alias ll='ls -la'
alias la='ls -A'
alias l='ls -CF'
alias grep='grep --color=auto'
alias ..='cd ..'
alias gs='git status'

PS1='[\\u@\\h \\W]\\$ '

# Welcome message
echo "Welcome back, ${about.name.split(' ')[0]}."
`,
  },
  '.zshrc': {
    type: 'file',
    name: '.zshrc',
    content: `# ~/.zshrc — Oh My Zsh
export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="agnoster"
plugins=(git docker kubectl npm)
source $ZSH/oh-my-zsh.sh
`,
  },
  projects: { type: 'dir', name: 'projects', children: buildProjectsDir() },
  Documents: { type: 'dir', name: 'Documents', children: {} },
  Downloads: { type: 'dir', name: 'Downloads', children: {} },
  '.config': { type: 'dir', name: '.config', children: {} },
}

// ─── System directories (/etc, /proc, /var, /usr) ───────────────────────────

const etcDir: FSNode = {
  type: 'dir',
  name: 'etc',
  children: {
    'os-release': {
      type: 'file',
      name: 'os-release',
      content: `NAME="Arch Linux"
PRETTY_NAME="Arch Linux"
ID=arch
BUILD_ID=rolling
ANSI_COLOR="38;2;23;147;209"
HOME_URL="https://archlinux.org/"
DOCUMENTATION_URL="https://wiki.archlinux.org/"
SUPPORT_URL="https://bbs.archlinux.org/"
BUG_REPORT_URL="https://bugs.archlinux.org/"
LOGO=archlinux-logo`,
    },
    hostname: { type: 'file', name: 'hostname', content: `arch` },
    hosts: {
      type: 'file',
      name: 'hosts',
      content: `127.0.0.1   localhost
::1         localhost
127.0.1.1   arch.leftcoaststack.com  arch`,
    },
    passwd: {
      type: 'file',
      name: 'passwd',
      content: `root:x:0:0:root:/root:/bin/bash
jmchorse:x:1000:1000:James McHorse:/home/jmchorse:/bin/zsh
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin`,
    },
    'pacman.conf': {
      type: 'file',
      name: 'pacman.conf',
      content: `[options]
RootDir = /
DBPath = /var/lib/pacman/
LogFile = /var/log/pacman.log
HoldPkg = pacman glibc
Architecture = auto

Color
ParallelDownloads = 5

[core]
Include = /etc/pacman.d/mirrorlist

[extra]
Include = /etc/pacman.d/mirrorlist`,
    },
  },
}

const procDir: FSNode = {
  type: 'dir',
  name: 'proc',
  children: {
    cpuinfo: {
      type: 'file',
      name: 'cpuinfo',
      content: `processor  : 0
vendor_id  : GenuineIntel
cpu family : 6
model      : 158
model name : Intel(R) Core(TM) i9-9900K CPU @ 3.60GHz
stepping   : 13
microcode  : 0xf4
cpu MHz    : 3600.000
cache size : 16384 KB
physical id: 0
siblings   : 16
core id    : 0
cpu cores  : 8
flags      : fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov`,
    },
    meminfo: {
      type: 'file',
      name: 'meminfo',
      content: `MemTotal:       16384000 kB
MemFree:        9842048 kB
MemAvailable:  12420160 kB
Buffers:         184320 kB
Cached:         3870720 kB
SwapTotal:       8192000 kB
SwapFree:        8192000 kB
Active:         4096000 kB
Inactive:       1843200 kB`,
    },
    uptime: {
      type: 'file',
      name: 'uptime',
      content: `94608000.42 86400000.18`,
    },
    version: {
      type: 'file',
      name: 'version',
      content: `Linux version 6.7.4-arch1-1 (linux@archlinux) (gcc (GCC) 13.2.1 20230801, GNU ld (GNU Binutils) 2.42) #1 SMP PREEMPT_DYNAMIC Mon, 05 Feb 2024 22:07:49 +0000`,
    },
    loadavg: {
      type: 'file',
      name: 'loadavg',
      content: `0.42 0.38 0.31 1/487 12345`,
    },
  },
}

const varDir: FSNode = {
  type: 'dir',
  name: 'var',
  children: {
    log: {
      type: 'dir',
      name: 'log',
      children: {
        'pacman.log': {
          type: 'file',
          name: 'pacman.log',
          content: `[2026-04-15T08:14:21-0500] [PACMAN] Running 'pacman -Syu'
[2026-04-15T08:14:23-0500] [ALPM] running 'mirrorlist.hook'...
[2026-04-15T08:14:24-0500] [ALPM] upgraded linux (6.7.3 -> 6.7.4)
[2026-04-15T08:14:25-0500] [ALPM] upgraded firefox (123.0-1 -> 123.0.1-1)
[2026-04-15T08:14:26-0500] [ALPM] upgraded git (2.43.0-1 -> 2.43.2-1)
[2026-04-15T08:14:27-0500] [PACMAN] Transaction completed.`,
        },
      },
    },
  },
}

const usrDir: FSNode = {
  type: 'dir',
  name: 'usr',
  children: {
    bin: { type: 'dir', name: 'bin', children: {} },
    share: { type: 'dir', name: 'share', children: {} },
  },
}

// ─── Root filesystem ────────────────────────────────────────────────────────

export const root: FSNode = {
  type: 'dir',
  name: '/',
  children: {
    etc: etcDir,
    proc: procDir,
    var: varDir,
    usr: usrDir,
    home: {
      type: 'dir',
      name: 'home',
      children: {
        jmchorse: { type: 'dir', name: 'jmchorse', children: homeChildren },
      },
    },
    root: { type: 'dir', name: 'root', children: {} },
    tmp: { type: 'dir', name: 'tmp', children: {} },
    bin: { type: 'dir', name: 'bin', children: {} },
  },
}

/** Default home directory path */
export const HOME = ['home', 'jmchorse']

/**
 * Resolve a path relative to a cwd. Handles ~, ., .., absolute, and relative paths.
 * Returns null if the path doesn't exist.
 */
export function resolvePath(path: string, cwd: string[]): FSNode | null {
  const parts = pathToParts(path, cwd)
  let node: FSNode = root
  for (const part of parts) {
    if (node.type !== 'dir' || !node.children?.[part]) return null
    node = node.children[part]
  }
  return node
}

/**
 * Convert a path string + cwd into an absolute parts array.
 * Always returns an absolute path (no ~, no ., no ..).
 */
export function pathToParts(path: string, cwd: string[]): string[] {
  let parts: string[]
  if (path.startsWith('~')) {
    const rest = path.slice(1).replace(/^\//, '')
    parts = [...HOME, ...rest.split('/').filter(Boolean)]
  } else if (path.startsWith('/')) {
    parts = path.split('/').filter(Boolean)
  } else {
    parts = [...cwd, ...path.split('/').filter(Boolean)]
  }
  const out: string[] = []
  for (const p of parts) {
    if (p === '.' || p === '') continue
    if (p === '..') {
      out.pop()
      continue
    }
    out.push(p)
  }
  return out
}

/**
 * Format a cwd parts array for prompt display.
 * /home/jmchorse → ~
 * /home/jmchorse/projects → ~/projects
 * /etc → /etc
 */
export function cwdToString(cwd: string[]): string {
  if (cwd.length === 0) return '/'
  if (cwd[0] === HOME[0] && cwd[1] === HOME[1]) {
    const rest = cwd.slice(2)
    return rest.length === 0 ? '~' : `~/${rest.join('/')}`
  }
  return `/${cwd.join('/')}`
}

/**
 * Format a cwd as an absolute path string (for `pwd`).
 */
export function cwdToAbsolute(cwd: string[]): string {
  return cwd.length === 0 ? '/' : `/${cwd.join('/')}`
}

/** Get child names of a directory at the given path; empty list if not a dir */
export function listChildren(path: string, cwd: string[]): string[] {
  const node = resolvePath(path, cwd)
  if (!node || node.type !== 'dir') return []
  return Object.keys(node.children ?? {})
}
