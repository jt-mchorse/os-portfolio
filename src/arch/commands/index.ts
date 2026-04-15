import { about } from '@/content/about'
import { projects } from '@/content/projects'
import { skillGroups, levelColors } from '@/content/skills'
import { experience } from '@/content/experience'
import { filesystem, resolvePath, cwdToString, type FSNode } from '@/arch/fs/filesystem'
import { isSoundEnabled, setSoundEnabled, play, sounds } from '@/lib/sounds'

export interface CommandContext {
  args: string[]
  cwd: string[]
  setCwd: (cwd: string[]) => void
  openPDF: () => void
  triggerSwitch: () => void
}

export interface CommandResult {
  output: TermLine[]
  clearScreen?: boolean
}

export interface TermLine {
  text: string
  color?: string
  bold?: boolean
  dim?: boolean
}

const c = {
  green: '#22c55e',
  teal: '#17c3b2',
  blue: '#60a5fa',
  yellow: '#eab308',
  red: '#f87171',
  gray: '#9ca3af',
  white: '#f3f4f6',
  dim: '#6b7280',
  cyan: '#22d3ee',
  magenta: '#c084fc',
}

function line(text: string, color?: string, bold?: boolean, dim?: boolean): TermLine {
  return { text, color, bold, dim }
}

function blank(): TermLine {
  return { text: '' }
}

// ─── HELP ────────────────────────────────────────────────────────────────────

function cmdHelp(): CommandResult {
  return {
    output: [
      line('Available commands:', c.teal, true),
      blank(),
      line('  PORTFOLIO', c.gray, false, true),
      line(`  ${'os --about'.padEnd(28)} About James McHorse`),
      line(`  ${'projects'.padEnd(28)} List all projects`),
      line(`  ${'projects --open <id>'.padEnd(28)} Open a specific project`),
      line(`  ${'skills'.padEnd(28)} View skills by category`),
      line(`  ${'resume'.padEnd(28)} Print resume as text`),
      line(`  ${'resume --pdf'.padEnd(28)} Open PDF viewer`),
      line(`  ${'contact'.padEnd(28)} View contact info`),
      line(`  ${'links'.padEnd(28)} GitHub, LinkedIn & more`),
      line(`  ${'chat'.padEnd(28)} AI assistant (coming soon)`),
      blank(),
      line('  FILESYSTEM', c.gray, false, true),
      line(`  ${'ls'.padEnd(28)} List directory contents`),
      line(`  ${'ls -la'.padEnd(28)} List with details`),
      line(`  ${'cd <dir>'.padEnd(28)} Change directory`),
      line(`  ${'cat <file>'.padEnd(28)} Print file contents`),
      line(`  ${'pwd'.padEnd(28)} Print working directory`),
      blank(),
      line('  SYSTEM', c.gray, false, true),
      line(`  ${'whoami'.padEnd(28)} Who am I`),
      line(`  ${'neofetch'.padEnd(28)} System info with ASCII art`),
      line(`  ${'date'.padEnd(28)} Current date/time`),
      line(`  ${'uptime'.padEnd(28)} System uptime`),
      line(`  ${'clear'.padEnd(28)} Clear terminal`),
      line(`  ${'echo <text>'.padEnd(28)} Print text`),
      line(`  ${'os --switch'.padEnd(28)} Switch to macOS`),
      line(`  ${'reboot'.padEnd(28)} Return to OS selector`),
      line(`  ${'sound [on|off]'.padEnd(28)} Toggle sound effects`),
    ],
  }
}

// ─── OS ──────────────────────────────────────────────────────────────────────

function cmdOS(args: string[], ctx: CommandContext): CommandResult {
  const flag = args[0]

  if (!flag || flag === '--help') return cmdHelp()

  if (flag === '--about') {
    return {
      output: [
        line(about.name, c.teal, true),
        line(about.title, c.blue),
        blank(),
        line(about.summary),
        blank(),
        line('Key Achievements:', c.yellow, true),
        ...about.keyAchievements.map((a) => line(`  ✓ ${a}`, c.green)),
        blank(),
        line(`Location: ${about.location}`, c.dim),
        line(`Email:    ${about.email}`, c.dim),
        line(`Web:      leftcoaststack.com`, c.dim),
      ],
    }
  }

  if (flag === '--switch' || flag === '--select-os') {
    ctx.triggerSwitch()
    return { output: [line('Initiating OS switch...', c.yellow)] }
  }

  return { output: [line(`os: unknown flag '${flag}'. Try 'os --help'`, c.red)] }
}

// ─── PROJECTS ────────────────────────────────────────────────────────────────

function cmdProjects(args: string[]): CommandResult {
  const flag = args[0]

  if (!flag || flag === '--list') {
    return {
      output: [
        line('Projects:', c.teal, true),
        blank(),
        ...projects.map((p, i) =>
          line(`  ${String(i + 1).padStart(2, ' ')}.  ${p.id.padEnd(26)} ${p.company}`, i % 2 === 0 ? c.white : c.gray)
        ),
        blank(),
        line(`Run 'projects --open <id>' to view details. E.g.: projects --open ams-platform`, c.dim),
      ],
    }
  }

  if (flag === '--open') {
    const id = args[1]
    if (!id) return { output: [line('projects --open requires a project id. Run projects --list for ids.', c.red)] }

    const p = projects.find((pr) => pr.id === id || pr.id.startsWith(id))
    if (!p) return { output: [line(`projects: no project matching '${id}'. Run 'projects --list'.`, c.red)] }

    return {
      output: [
        line(`╔══ ${p.title} ══`, c.teal, true),
        line(`║ ${p.company} · ${p.period}`, c.blue),
        line('║', c.dim),
        line(`║ ${p.tagline}`, c.white),
        line('║', c.dim),
        line('║ PROBLEM', c.yellow),
        ...p.problem.match(/.{1,72}/g)!.map((l) => line(`║   ${l}`, c.gray)),
        line('║', c.dim),
        line('║ CONTRIBUTION', c.yellow),
        ...p.contribution.match(/.{1,72}/g)!.map((l) => line(`║   ${l}`, c.gray)),
        line('║', c.dim),
        line('║ OUTCOME', c.green),
        ...p.outcome.match(/.{1,72}/g)!.map((l) => line(`║   ${l}`, c.green)),
        line('║', c.dim),
        line(`║ STACK: ${p.techStack.join(' · ')}`, c.cyan),
        ...(p.liveUrl ? [line(`║ URL:   ${p.liveUrl}`, c.blue)] : []),
        line('╚══', c.teal),
      ],
    }
  }

  return { output: [line(`projects: unknown flag '${flag}'. Try 'projects --list' or 'projects --open <id>'`, c.red)] }
}

// ─── SKILLS ──────────────────────────────────────────────────────────────────

function cmdSkills(args: string[]): CommandResult {
  const catArg = args[0]

  const groups = catArg
    ? skillGroups.filter((g) => g.category.toLowerCase().includes(catArg.toLowerCase()))
    : skillGroups

  if (groups.length === 0) {
    return { output: [line(`skills: no category matching '${catArg}'`, c.red)] }
  }

  const out: TermLine[] = [line('Skills:', c.teal, true), blank()]
  groups.forEach((g) => {
    out.push(line(`  ${g.icon} ${g.category}`, c.yellow, true))
    g.skills.forEach((s) => {
      const col = s.level === 'expert' ? c.green : s.level === 'strong' ? c.yellow : c.blue
      out.push(line(`     ${s.name.padEnd(36)} [${s.level}]`, col))
    })
    out.push(blank())
  })

  if (!catArg) {
    out.push(line(`Filter by category: skills <keyword>  e.g. 'skills ai'`, c.dim))
  }

  return { output: out }
}

// ─── RESUME ──────────────────────────────────────────────────────────────────

function cmdResume(args: string[], ctx: CommandContext): CommandResult {
  if (args[0] === '--pdf') {
    ctx.openPDF()
    return { output: [line('Opening PDF viewer...', c.green)] }
  }

  const node = resolvePath('resume.txt', ctx.cwd)
  if (!node || node.type !== 'file') return { output: [line('resume: file not found', c.red)] }

  return {
    output: node.content!.split('\n').map((l) => {
      if (l.startsWith('═')) return line(l, c.teal)
      if (l.startsWith('#')) return line(l, c.yellow, true)
      if (l.startsWith('  •')) return line(l, c.gray)
      if (l.includes('(expert)')) return line(l, c.green)
      if (l.includes('(strong)')) return line(l, c.yellow)
      return line(l)
    }),
  }
}

// ─── CONTACT ─────────────────────────────────────────────────────────────────

function cmdContact(): CommandResult {
  return {
    output: [
      line('Contact James McHorse:', c.teal, true),
      blank(),
      line(`  Email    ${about.email}`, c.blue),
      line(`  Phone    ${about.phone}`, c.white),
      line(`  GitHub   ${about.github}`, c.cyan),
      line(`  LinkedIn ${about.linkedin}`, c.blue),
      line(`  Web      https://leftcoaststack.com`, c.white),
      blank(),
      line("  Run 'echo <email>' and copy, or just click above (links are clickable).", c.dim),
    ],
  }
}

// ─── LINKS ───────────────────────────────────────────────────────────────────

function cmdLinks(): CommandResult {
  return {
    output: [
      line('Links:', c.teal, true),
      blank(),
      line(`  GitHub    ${about.github}`, c.cyan),
      line(`  LinkedIn  ${about.linkedin}`, c.blue),
      line(`  Email     mailto:${about.email}`, c.yellow),
      line(`  Website   https://leftcoaststack.com`, c.white),
    ],
  }
}

// ─── WHOAMI ──────────────────────────────────────────────────────────────────

function cmdWhoami(): CommandResult {
  return {
    output: [line(`${about.name} — ${about.title}`, c.teal)],
  }
}

// ─── NEOFETCH ────────────────────────────────────────────────────────────────

function cmdNeofetch(): CommandResult {
  const stats = about.neofetchStats
  const archAscii = [
    '                   -`                  ',
    "                  .o+`                 ",
    "                 `ooo/                 ",
    "                `+oooo:                ",
    "               `+oooooo:               ",
    "               -+oooooo+:              ",
    "             `/:-:++oooo+:             ",
    "            `/++++/+++++++:            ",
    "           `/++++++++++++++:           ",
    "          `/+++ooooooooooooo/`         ",
    "         ./ooosssso++osssssso+`        ",
    "        .oossssso-````/ossssss+`       ",
    "       -osssssso.      :ssssssso.      ",
    "      :osssssss/        osssso+++.     ",
    "     /ossssssss/        +ssssooo/-     ",
    "   `/ossssso+/:-        -:/+osssso+-   ",
    "  `+sso+:-`                 `.-/+oso:  ",
    " `++:.                           `-/+/ ",
    " .`                                 `/.",
  ]

  const infoLines = [
    `${about.name}`,
    '─'.repeat(about.name.length),
    `OS:         ${stats.os}`,
    `Kernel:     ${stats.kernel}`,
    `Uptime:     ${stats.uptime}`,
    `Packages:   ${stats.packages}`,
    `Shell:      ${stats.shell}`,
    `Resolution: ${stats.resolution}`,
    `DE:         ${stats.de}`,
    `WM:         ${stats.wm}`,
    `Terminal:   ${stats.terminal}`,
    `CPU:        ${stats.cpu}`,
    `GPU:        ${stats.gpu}`,
    `Memory:     ${stats.memory}`,
    '',
    '████ ████ ████ ████ ████ ████ ████ ████',
  ]

  const maxLen = Math.max(archAscii.length, infoLines.length)
  const out: TermLine[] = []

  for (let i = 0; i < maxLen; i++) {
    const left = archAscii[i] ?? ''.padEnd(40)
    const right = infoLines[i] ?? ''
    const isColorRow = right.startsWith('████')
    out.push({
      text: `${left}   ${right}`,
      color: i === 0 ? c.teal : i === 1 ? c.dim : isColorRow ? undefined : c.white,
    })
  }

  return { output: out }
}

// ─── DATE / UPTIME ───────────────────────────────────────────────────────────

function cmdDate(): CommandResult {
  return { output: [line(new Date().toString(), c.white)] }
}

function cmdUptime(): CommandResult {
  return {
    output: [
      line(
        `up 12 years, 0 outages, 0 critical bugs unresolved — load average: shipping, mentoring, optimizing`,
        c.white
      ),
    ],
  }
}

// ─── ECHO ────────────────────────────────────────────────────────────────────

function cmdEcho(args: string[]): CommandResult {
  return { output: [line(args.join(' '))] }
}

// ─── CLEAR ───────────────────────────────────────────────────────────────────

function cmdClear(): CommandResult {
  return { output: [], clearScreen: true }
}

// ─── CHAT ────────────────────────────────────────────────────────────────────

function cmdChat(): CommandResult {
  return {
    output: [
      line('AI Assistant — Coming Soon', c.magenta, true),
      blank(),
      line('  An LLM-powered assistant that knows my full career history is in development.', c.gray),
      line('  Check back later, or email me directly:', c.gray),
      line(`  ${about.email}`, c.blue),
    ],
  }
}

// ─── SUDO ────────────────────────────────────────────────────────────────────

function cmdSudo(args: string[]): CommandResult {
  return {
    output: [
      line(`[sudo] password for jmchorse: `, c.white),
      line('Sorry, try again.', c.red),
      line('Sorry, try again.', c.red),
      line('sudo: 3 incorrect password attempts', c.red),
      blank(),
      line("Nice try. 🙂  (I'm the only admin here.)", c.yellow),
    ],
  }
}

// ─── FILESYSTEM COMMANDS ─────────────────────────────────────────────────────

function cmdPwd(ctx: CommandContext): CommandResult {
  return { output: [line(`/${cwdToString(ctx.cwd).replace('~', 'home/jmchorse')}`, c.white)] }
}

function cmdLs(args: string[], ctx: CommandContext): CommandResult {
  const showAll = args.includes('-la') || args.includes('-l') || args.includes('-a')
  const node = resolvePath('.', ctx.cwd)
  if (!node || node.type !== 'dir') return { output: [line('ls: not a directory', c.red)] }

  const entries = Object.values(node.children ?? {})
  if (entries.length === 0) return { output: [line('(empty directory)')] }

  if (showAll) {
    const out: TermLine[] = [line('total ' + entries.length, c.dim)]
    entries.forEach((e) => {
      const isDir = e.type === 'dir'
      out.push(
        line(
          `${isDir ? 'drwxr-xr-x' : '-rw-r--r--'}  jmchorse  jmchorse  ${isDir ? '4096' : String(e.content?.length ?? 0).padStart(5, ' ')}  Apr 15 2026  ${isDir ? e.name + '/' : e.name}`,
          isDir ? c.blue : c.white
        )
      )
    })
    return { output: out }
  }

  const names = entries.map((e) => (e.type === 'dir' ? e.name + '/' : e.name))
  const cols = 4
  const rows: TermLine[] = []
  for (let i = 0; i < names.length; i += cols) {
    rows.push(
      line(
        names.slice(i, i + cols).map((n) => n.padEnd(24)).join(''),
        undefined
      )
    )
  }
  return { output: rows }
}

function cmdCd(args: string[], ctx: CommandContext): CommandResult {
  const target = args[0] ?? '~'
  if (target === '~' || target === '') {
    ctx.setCwd([])
    return { output: [] }
  }

  const newCwdParts = target.startsWith('~')
    ? target.replace('~/', '').split('/').filter(Boolean)
    : target === '..'
    ? ctx.cwd.slice(0, -1)
    : [...ctx.cwd, ...target.split('/').filter(Boolean)]

  const node = resolvePath(newCwdParts.join('/'), [])
  if (!node) return { output: [line(`cd: ${target}: No such file or directory`, c.red)] }
  if (node.type !== 'dir') return { output: [line(`cd: ${target}: Not a directory`, c.red)] }

  ctx.setCwd(newCwdParts)
  return { output: [] }
}

function cmdCat(args: string[], ctx: CommandContext): CommandResult {
  const filePath = args[0]
  if (!filePath) return { output: [line('cat: missing operand', c.red)] }

  const node = resolvePath(filePath, ctx.cwd)
  if (!node) return { output: [line(`cat: ${filePath}: No such file or directory`, c.red)] }
  if (node.type === 'dir') return { output: [line(`cat: ${filePath}: Is a directory`, c.red)] }

  return {
    output: node.content!.split('\n').map((l) => line(l)),
  }
}

// ─── REBOOT ──────────────────────────────────────────────────────────────────

// ─── SOUND ───────────────────────────────────────────────────────────────────

function cmdSound(args: string[]): CommandResult {
  const flag = args[0]
  const isOn = isSoundEnabled()

  if (!flag) {
    return {
      output: [
        line(`Sound is currently ${isOn ? 'ON' : 'OFF'}.`, isOn ? c.green : c.yellow),
        line(`  sound on   — enable sound effects`, c.dim),
        line(`  sound off  — disable sound effects`, c.dim),
      ],
    }
  }
  if (flag === 'on' || flag === 'enable') {
    setSoundEnabled(true)
    setTimeout(() => play(sounds.archBeep), 50)
    return { output: [line('Sound enabled. 🔊', c.green)] }
  }
  if (flag === 'off' || flag === 'disable') {
    setSoundEnabled(false)
    return { output: [line('Sound disabled. 🔇', c.yellow)] }
  }
  return { output: [line(`sound: unknown option '${flag}'. Try 'sound on' or 'sound off'.`, c.red)] }
}

// ─── REBOOT ──────────────────────────────────────────────────────────────────

function cmdReboot(ctx: CommandContext): CommandResult {
  ctx.triggerSwitch()
  return { output: [line('Broadcast message from jmchorse (tty1):', c.yellow), line('The system will reboot now!', c.yellow)] }
}

// ─── DISPATCHER ──────────────────────────────────────────────────────────────

export function dispatch(input: string, ctx: CommandContext): CommandResult {
  const trimmed = input.trim()
  if (!trimmed) return { output: [] }

  const [cmd, ...args] = trimmed.split(/\s+/)

  switch (cmd.toLowerCase()) {
    case 'os': return cmdOS(args, ctx)
    case 'help': return cmdHelp()
    case 'projects': return cmdProjects(args)
    case 'skills': return cmdSkills(args)
    case 'resume': return cmdResume(args, ctx)
    case 'contact': return cmdContact()
    case 'links': return cmdLinks()
    case 'chat': return cmdChat()
    case 'whoami': return cmdWhoami()
    case 'neofetch': return cmdNeofetch()
    case 'date': return cmdDate()
    case 'uptime': return cmdUptime()
    case 'echo': return cmdEcho(args)
    case 'clear': return cmdClear()
    case 'sudo': return cmdSudo(args)
    case 'pwd': return cmdPwd(ctx)
    case 'ls': return cmdLs(args, ctx)
    case 'cd': return cmdCd(args, ctx)
    case 'cat': return cmdCat(args, ctx)
    case 'sound': return cmdSound(args)
    case 'reboot': return cmdReboot(ctx)
    case 'vim':
    case 'nano':
    case 'emacs': return {
      output: [
        line(`${cmd}: interactive editor not supported in this environment.`, c.yellow),
        line('Use `cat <file>` to read file contents instead.', c.dim),
      ],
    }
    case 'pacman': return {
      output: [
        line(':: Synchronizing package databases...', c.yellow),
        ...args.includes('-S') || args.includes('-Sy') || args.includes('-Syu')
          ? [
              line(' core             138.0 KiB  14.2 MiB/s 00:00 [######################] 100%', c.green),
              line(' extra           8.4 MiB  18.6 MiB/s 00:01 [######################] 100%', c.green),
              line('', c.dim),
              line(':: All packages are up to date.', c.green),
              line(`warning: james-portfolio-v1.0 is already the newest version`, c.yellow),
            ]
          : [line('Try: pacman -Syu', c.dim)],
      ],
    }
    case 'man': return {
      output: [
        line(`No manual entry for ${args[0] ?? '???'}`, c.yellow),
        line("Try 'os --help' to see available commands.", c.dim),
      ],
    }
    case 'ls-la':
    case 'l': return cmdLs(['-la'], ctx)

    default: return {
      output: [
        line(`bash: ${cmd}: command not found`, c.red),
      ],
    }
  }
}
