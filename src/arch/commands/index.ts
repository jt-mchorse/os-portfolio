import { about } from '@/content/about'
import { projects } from '@/content/projects'
import { skillGroups } from '@/content/skills'
import { experience } from '@/content/experience'
import {
  resolvePath,
  cwdToString,
  cwdToAbsolute,
  pathToParts,
  listChildren,
  HOME,
  type FSNode,
} from '@/arch/fs/filesystem'
import { isSoundEnabled, setSoundEnabled, play, sounds } from '@/lib/sounds'

export interface CommandContext {
  args: string[]
  cwd: string[]
  setCwd: (cwd: string[]) => void
  openPDF: () => void
  triggerSwitch: () => void
  history: string[]
  /** Optional piped stdin from a previous command */
  stdin?: string
  /** For interactive commands like vim/nano */
  openEditor?: (file: string, content: string) => void
  /** For long-running animation commands (matrix) */
  startAnimation?: (name: 'matrix' | 'sl') => void
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
  orange: '#fb923c',
}

function line(text: string, color?: string, bold?: boolean, dim?: boolean): TermLine {
  return { text, color, bold, dim }
}
function blank(): TermLine {
  return { text: '' }
}
function lines(text: string, color?: string): TermLine[] {
  return text.split('\n').map((l) => line(l, color))
}

// ─── Aliases ────────────────────────────────────────────────────────────────

const ALIASES: Record<string, string> = {
  ll: 'ls -la',
  la: 'ls -A',
  l: 'ls -CF',
  '..': 'cd ..',
  '...': 'cd ../..',
  cls: 'clear',
  gs: 'git status',
  gp: 'git pull',
}

// ─── Command list (for help & tab completion) ───────────────────────────────

const COMMAND_LIST = [
  'os', 'help', 'projects', 'skills', 'resume', 'contact', 'links', 'chat',
  'whoami', 'neofetch', 'date', 'uptime', 'echo', 'clear', 'history',
  'pwd', 'ls', 'cd', 'cat', 'head', 'tail', 'wc', 'tree', 'find', 'grep',
  'which', 'env', 'export', 'alias', 'unalias',
  'ps', 'top', 'htop', 'free', 'df', 'du', 'uname', 'hostname',
  'sudo', 'su', 'pacman', 'yay',
  'man', 'apropos',
  'vim', 'vi', 'nano', 'emacs',
  'cowsay', 'fortune', 'figlet', 'sl', 'matrix', 'lolcat',
  'sound', 'reboot', 'poweroff', 'shutdown', 'logout', 'exit',
  'curl', 'wget', 'ping', 'ssh', 'git', 'docker', 'npm', 'node', 'python',
]

// ─── HELP ────────────────────────────────────────────────────────────────────

function cmdHelp(): CommandResult {
  return {
    output: [
      line('Available commands:', c.teal, true),
      blank(),
      line('  PORTFOLIO', c.gray, false, true),
      line(`  ${'os --about'.padEnd(28)} About James McHorse`),
      line(`  ${'projects'.padEnd(28)} List all projects`),
      line(`  ${'projects --open <id>'.padEnd(28)} Open a project`),
      line(`  ${'skills'.padEnd(28)} View skills by category`),
      line(`  ${'resume'.padEnd(28)} Resume as text`),
      line(`  ${'resume --pdf'.padEnd(28)} Open PDF viewer`),
      line(`  ${'contact'.padEnd(28)} Contact info`),
      line(`  ${'links'.padEnd(28)} GitHub, LinkedIn & more`),
      blank(),
      line('  FILESYSTEM', c.gray, false, true),
      line(`  ${'ls [-la] [path]'.padEnd(28)} List directory`),
      line(`  ${'cd <dir>'.padEnd(28)} Change directory`),
      line(`  ${'pwd'.padEnd(28)} Print working directory`),
      line(`  ${'cat <file>'.padEnd(28)} Print file contents`),
      line(`  ${'head/tail [-n N] <file>'.padEnd(28)} First/last N lines`),
      line(`  ${'wc <file>'.padEnd(28)} Line/word/char count`),
      line(`  ${'tree [path]'.padEnd(28)} Directory tree`),
      line(`  ${'find <pattern>'.padEnd(28)} Find files`),
      line(`  ${'grep <pat> [file]'.padEnd(28)} Search text`),
      blank(),
      line('  SYSTEM', c.gray, false, true),
      line(`  ${'whoami'.padEnd(28)} Who am I`),
      line(`  ${'neofetch'.padEnd(28)} System info + ASCII art`),
      line(`  ${'uname [-a]'.padEnd(28)} Kernel info`),
      line(`  ${'ps / top / htop'.padEnd(28)} Process list`),
      line(`  ${'free / df / du'.padEnd(28)} Memory & disk`),
      line(`  ${'env / export / alias'.padEnd(28)} Environment`),
      line(`  ${'history'.padEnd(28)} Command history`),
      line(`  ${'which <cmd>'.padEnd(28)} Locate command`),
      line(`  ${'date / uptime'.padEnd(28)} Time & uptime`),
      line(`  ${'sound [on|off]'.padEnd(28)} Sound effects`),
      line(`  ${'os --switch / reboot'.padEnd(28)} Return to OS selector`),
      blank(),
      line('  FUN', c.gray, false, true),
      line(`  ${'cowsay <text>'.padEnd(28)} Cow says...`),
      line(`  ${'fortune'.padEnd(28)} Random quote`),
      line(`  ${'figlet <text>'.padEnd(28)} ASCII art text`),
      line(`  ${'matrix'.padEnd(28)} Enter the matrix (Ctrl+C to exit)`),
      line(`  ${'sl'.padEnd(28)} Steam locomotive`),
      blank(),
      line('  PIPES & FEATURES', c.gray, false, true),
      line(`  ${'cmd1 | cmd2'.padEnd(28)} Pipe output`),
      line(`  ${'Tab'.padEnd(28)} Auto-complete commands & files`),
      line(`  ${'↑ ↓'.padEnd(28)} Command history`),
      line(`  ${'Ctrl+L / clear'.padEnd(28)} Clear screen`),
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
        ...lines(about.summary),
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
        line(`Run 'projects --open <id>' for details. e.g. projects --open ams-platform`, c.dim),
      ],
    }
  }

  if (flag === '--open') {
    const id = args[1]
    if (!id) return { output: [line('projects --open requires a project id.', c.red)] }
    const p = projects.find((pr) => pr.id === id || pr.id.startsWith(id))
    if (!p) return { output: [line(`projects: no project matching '${id}'.`, c.red)] }

    return {
      output: [
        line(`╔══ ${p.title} ══`, c.teal, true),
        line(`║ ${p.company} · ${p.period}`, c.blue),
        line('║', c.dim),
        line(`║ ${p.tagline}`, c.white),
        line('║', c.dim),
        line('║ PROBLEM', c.yellow),
        ...wrap(p.problem, 72).map((l) => line(`║   ${l}`, c.gray)),
        line('║', c.dim),
        line('║ CONTRIBUTION', c.yellow),
        ...wrap(p.contribution, 72).map((l) => line(`║   ${l}`, c.gray)),
        line('║', c.dim),
        line('║ OUTCOME', c.green),
        ...wrap(p.outcome, 72).map((l) => line(`║   ${l}`, c.green)),
        line('║', c.dim),
        line(`║ STACK: ${p.techStack.join(' · ')}`, c.cyan),
        ...(p.liveUrl ? [line(`║ URL:   ${p.liveUrl}`, c.blue)] : []),
        line('╚══', c.teal),
      ],
    }
  }

  return { output: [line(`projects: unknown flag '${flag}'.`, c.red)] }
}

function wrap(text: string, width: number): string[] {
  const words = text.split(/\s+/)
  const out: string[] = []
  let cur = ''
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > width) {
      if (cur) out.push(cur.trim())
      cur = w
    } else {
      cur += ' ' + w
    }
  }
  if (cur.trim()) out.push(cur.trim())
  return out
}

// ─── SKILLS ──────────────────────────────────────────────────────────────────

function cmdSkills(args: string[]): CommandResult {
  const catArg = args[0]
  const groups = catArg
    ? skillGroups.filter((g) => g.category.toLowerCase().includes(catArg.toLowerCase()))
    : skillGroups
  if (groups.length === 0) return { output: [line(`skills: no category matching '${catArg}'`, c.red)] }

  const out: TermLine[] = [line('Skills:', c.teal, true), blank()]
  groups.forEach((g) => {
    out.push(line(`  ${g.icon} ${g.category}`, c.yellow, true))
    g.skills.forEach((s) => {
      const col = s.level === 'expert' ? c.green : s.level === 'strong' ? c.yellow : c.blue
      out.push(line(`     ${s.name.padEnd(36)} [${s.level}]`, col))
    })
    out.push(blank())
  })
  if (!catArg) out.push(line(`Filter by category: skills <keyword>  e.g. 'skills ai'`, c.dim))
  return { output: out }
}

// ─── RESUME ──────────────────────────────────────────────────────────────────

function cmdResume(args: string[], ctx: CommandContext): CommandResult {
  if (args[0] === '--pdf') {
    ctx.openPDF()
    return { output: [line('Opening PDF viewer...', c.green)] }
  }
  const node = resolvePath('~/resume.txt', ctx.cwd)
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

// ─── CONTACT / LINKS ─────────────────────────────────────────────────────────

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
    ],
  }
}

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

function cmdWhoami(): CommandResult {
  return { output: [line('jmchorse', c.teal)] }
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
  const now = new Date().toLocaleTimeString('en-US', { hour12: false })
  return {
    output: [
      line(
        ` ${now}  up 12 years,  load average: 0.42, 0.38, 0.31`,
        c.white
      ),
    ],
  }
}

function cmdHostname(): CommandResult {
  return { output: [line('arch', c.white)] }
}

function cmdUname(args: string[]): CommandResult {
  if (args.includes('-a')) {
    return {
      output: [
        line(
          `Linux arch 6.7.4-arch1-1 #1 SMP PREEMPT_DYNAMIC Mon, 05 Feb 2024 22:07:49 +0000 x86_64 GNU/Linux`,
          c.white
        ),
      ],
    }
  }
  return { output: [line('Linux', c.white)] }
}

// ─── ECHO / CLEAR / HISTORY ──────────────────────────────────────────────────

function cmdEcho(args: string[]): CommandResult {
  // Expand simple env vars
  const envMap: Record<string, string> = {
    HOME: '/home/jmchorse',
    USER: 'jmchorse',
    SHELL: '/bin/zsh',
    PATH: '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
    PWD: '/home/jmchorse',
    HOSTNAME: 'arch',
    LANG: 'en_US.UTF-8',
  }
  const txt = args.join(' ').replace(/\$([A-Z_]+)/g, (_, n) => envMap[n] ?? '')
  return { output: [line(txt)] }
}

function cmdClear(): CommandResult {
  return { output: [], clearScreen: true }
}

function cmdHistory(ctx: CommandContext): CommandResult {
  const out: TermLine[] = ctx.history.map((h, i) =>
    line(`  ${String(i + 1).padStart(4, ' ')}  ${h}`, c.white)
  )
  return { output: out.length ? out : [line('(no history)', c.dim)] }
}

// ─── ENV / EXPORT / ALIAS ────────────────────────────────────────────────────

const ENV_VARS: Record<string, string> = {
  HOME: '/home/jmchorse',
  USER: 'jmchorse',
  LOGNAME: 'jmchorse',
  SHELL: '/bin/zsh',
  PATH: '/usr/local/sbin:/usr/local/bin:/usr/bin:/bin',
  PWD: '/home/jmchorse',
  TERM: 'xterm-256color',
  HOSTNAME: 'arch',
  LANG: 'en_US.UTF-8',
  EDITOR: 'vim',
  XDG_CONFIG_HOME: '/home/jmchorse/.config',
}

function cmdEnv(): CommandResult {
  return {
    output: Object.entries(ENV_VARS).map(([k, v]) =>
      line(`${k}=${v}`, c.white)
    ),
  }
}

function cmdExport(args: string[]): CommandResult {
  if (args.length === 0) return cmdEnv()
  return { output: [line(`(export not persisted in this session)`, c.dim)] }
}

function cmdAlias(args: string[]): CommandResult {
  if (args.length === 0) {
    return {
      output: Object.entries(ALIASES).map(([k, v]) =>
        line(`alias ${k}='${v}'`, c.white)
      ),
    }
  }
  return { output: [line(`(alias modifications not persisted)`, c.dim)] }
}

function cmdUnalias(): CommandResult {
  return { output: [line(`(unalias not persisted)`, c.dim)] }
}

// ─── PS / TOP / HTOP / FREE / DF / DU ────────────────────────────────────────

const FAKE_PROCESSES = [
  { pid: 1, user: 'root', cpu: 0.1, mem: 0.2, cmd: '/sbin/init' },
  { pid: 142, user: 'root', cpu: 0.0, mem: 0.1, cmd: 'systemd-journald' },
  { pid: 218, user: 'root', cpu: 0.0, mem: 0.3, cmd: 'systemd-udevd' },
  { pid: 401, user: 'root', cpu: 0.2, mem: 0.4, cmd: 'NetworkManager' },
  { pid: 532, user: 'jmchorse', cpu: 1.2, mem: 0.8, cmd: 'i3 --shmlog-size 0' },
  { pid: 612, user: 'jmchorse', cpu: 8.4, mem: 4.1, cmd: 'firefox' },
  { pid: 711, user: 'jmchorse', cpu: 4.2, mem: 3.5, cmd: 'code' },
  { pid: 802, user: 'jmchorse', cpu: 0.6, mem: 1.2, cmd: 'kitty' },
  { pid: 921, user: 'jmchorse', cpu: 0.3, mem: 0.7, cmd: 'zsh' },
  { pid: 1023, user: 'jmchorse', cpu: 12.3, mem: 6.8, cmd: 'node /usr/bin/portfolio' },
  { pid: 1101, user: 'jmchorse', cpu: 0.0, mem: 0.2, cmd: 'ps aux' },
]

function cmdPs(args: string[]): CommandResult {
  const wide = args.includes('aux') || args.includes('-aux') || args.includes('-ef')
  if (wide) {
    return {
      output: [
        line('USER       PID %CPU %MEM    VSZ   RSS  TTY  STAT START   TIME COMMAND', c.dim),
        ...FAKE_PROCESSES.map((p) =>
          line(
            `${p.user.padEnd(10)} ${String(p.pid).padStart(4)} ${p.cpu.toFixed(1).padStart(4)} ${p.mem.toFixed(1).padStart(4)}  18234 ${String(Math.round(p.mem * 8000)).padStart(5)}  ?    Ss   08:14   0:${(p.cpu * 4).toFixed(2)} ${p.cmd}`,
            p.user === 'root' ? c.gray : c.white
          )
        ),
      ],
    }
  }
  return {
    output: [
      line('  PID TTY          TIME CMD', c.dim),
      line('  921 pts/0    00:00:00 zsh', c.white),
      line(' 1101 pts/0    00:00:00 ps', c.white),
    ],
  }
}

function cmdTop(): CommandResult {
  const now = new Date().toLocaleTimeString()
  return {
    output: [
      line(`top - ${now} up 12 years,  1 user,  load average: 0.42, 0.38, 0.31`, c.teal),
      line(`Tasks: ${FAKE_PROCESSES.length + 200} total,   2 running, ${FAKE_PROCESSES.length + 198} sleeping`, c.white),
      line(`%Cpu(s):  4.2 us,  1.1 sy,  0.0 ni, 94.3 id,  0.4 wa,  0.0 hi,  0.0 si,  0.0 st`, c.white),
      line(`MiB Mem :  16384.0 total,   9612.5 free,   4250.4 used,   2521.1 buff/cache`, c.white),
      line(`MiB Swap:   8192.0 total,   8192.0 free,      0.0 used.  11823.4 avail Mem`, c.white),
      blank(),
      line('  PID USER       PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND', c.dim),
      ...FAKE_PROCESSES.sort((a, b) => b.cpu - a.cpu).map((p) =>
        line(
          ` ${String(p.pid).padStart(4)} ${p.user.padEnd(10)} 20   0  ${String(Math.round(p.mem * 12000)).padStart(7)}  ${String(Math.round(p.mem * 8000)).padStart(5)}   2048 S  ${p.cpu.toFixed(1).padStart(4)}  ${p.mem.toFixed(1).padStart(4)}   0:${(p.cpu * 4).toFixed(2)} ${p.cmd}`,
          p.cpu > 5 ? c.green : c.white
        )
      ),
      blank(),
      line('(snapshot — top is non-interactive in this terminal)', c.dim),
    ],
  }
}

function cmdFree(args: string[]): CommandResult {
  const human = args.includes('-h')
  const total = human ? '16Gi' : '16384000'
  const used = human ? '4.0Gi' : '4250400'
  const free = human ? '9.4Gi' : '9612500'
  const buff = human ? '2.5Gi' : '2521100'
  const avail = human ? '11Gi' : '11823400'
  return {
    output: [
      line(`               total        used        free      shared  buff/cache   available`, c.dim),
      line(`Mem:        ${total.padStart(10)}  ${used.padStart(10)}  ${free.padStart(10)}        128  ${buff.padStart(10)}  ${avail.padStart(10)}`, c.white),
      line(`Swap:       ${(human ? '8.0Gi' : '8192000').padStart(10)}           0  ${(human ? '8.0Gi' : '8192000').padStart(10)}`, c.white),
    ],
  }
}

function cmdDf(args: string[]): CommandResult {
  const human = args.includes('-h')
  return {
    output: [
      line('Filesystem     Size  Used Avail Use% Mounted on', c.dim),
      line(`/dev/nvme0n1p2 ${human ? '512G' : '536870912'}  ${human ? '124G' : '129922560'}  ${human ? '388G' : '406948352'}  24% /`, c.white),
      line(`tmpfs          ${human ? '8.0G' : '8388608'}     0  ${human ? '8.0G' : '8388608'}   0% /tmp`, c.white),
      line(`/dev/nvme0n1p1 ${human ? '512M' : '524288'}  ${human ? '142M' : '145408'}  ${human ? '370M' : '378880'}  28% /boot`, c.white),
    ],
  }
}

function cmdDu(args: string[], ctx: CommandContext): CommandResult {
  const target = args.filter((a) => !a.startsWith('-'))[0] ?? '.'
  const node = resolvePath(target, ctx.cwd)
  if (!node) return { output: [line(`du: cannot access '${target}': No such file or directory`, c.red)] }
  if (node.type === 'file') return { output: [line(`${(node.content?.length ?? 0)}\t${target}`, c.white)] }
  // total = sum of file sizes
  let total = 0
  const out: TermLine[] = []
  function walk(n: FSNode, path: string) {
    let dirSize = 0
    for (const [name, child] of Object.entries(n.children ?? {})) {
      const p = `${path}/${name}`
      if (child.type === 'file') {
        const s = child.content?.length ?? 0
        dirSize += s
        out.push(line(`${s}\t${p}`, c.white))
      } else {
        walk(child, p)
      }
    }
    out.push(line(`${dirSize}\t${path}`, c.cyan))
    total += dirSize
  }
  walk(node, target)
  return { output: out }
}

// ─── WHICH ───────────────────────────────────────────────────────────────────

function cmdWhich(args: string[]): CommandResult {
  const cmd = args[0]
  if (!cmd) return { output: [line('which: missing command name', c.red)] }
  if (COMMAND_LIST.includes(cmd)) {
    return { output: [line(`/usr/bin/${cmd}`, c.white)] }
  }
  if (ALIASES[cmd]) {
    return { output: [line(`${cmd}: aliased to ${ALIASES[cmd]}`, c.yellow)] }
  }
  return { output: [line(`${cmd} not found`, c.red)] }
}

// ─── PWD / LS / CD / CAT / HEAD / TAIL / WC / TREE / FIND / GREP ─────────────

function cmdPwd(ctx: CommandContext): CommandResult {
  return { output: [line(cwdToAbsolute(ctx.cwd), c.white)] }
}

function colorForFilename(name: string, isDir: boolean): string {
  if (isDir) return c.blue
  if (name.startsWith('.')) return c.gray
  if (/\.(sh|bash|zsh)$/.test(name)) return c.green
  if (/\.(md|txt)$/.test(name)) return c.white
  if (/\.(json|yaml|yml|toml|conf)$/.test(name)) return c.yellow
  if (/\.(jpg|png|svg|gif|pdf)$/.test(name)) return c.magenta
  if (/\.(ts|tsx|js|jsx|py|rs|go)$/.test(name)) return c.cyan
  return c.white
}

function cmdLs(args: string[], ctx: CommandContext): CommandResult {
  const flags = args.filter((a) => a.startsWith('-')).join('')
  const showAll = flags.includes('a')
  const longForm = flags.includes('l')
  const target = args.find((a) => !a.startsWith('-')) ?? '.'

  const node = resolvePath(target, ctx.cwd)
  if (!node) return { output: [line(`ls: cannot access '${target}': No such file or directory`, c.red)] }
  if (node.type !== 'dir') return { output: [line(node.name, colorForFilename(node.name, false))] }

  let entries = Object.values(node.children ?? {})
  if (!showAll) entries = entries.filter((e) => !e.name.startsWith('.'))
  if (entries.length === 0) return { output: [] }
  entries.sort((a, b) => a.name.localeCompare(b.name))

  if (longForm) {
    const out: TermLine[] = [line(`total ${entries.length * 4}`, c.dim)]
    entries.forEach((e) => {
      const isDir = e.type === 'dir'
      const perms = isDir ? 'drwxr-xr-x' : '-rw-r--r--'
      const size = isDir ? '4096' : String(e.content?.length ?? 0).padStart(5, ' ')
      out.push(
        line(
          `${perms}  1 jmchorse jmchorse  ${size}  Apr 15 08:14  ${e.name}${isDir ? '/' : ''}`,
          colorForFilename(e.name, isDir)
        )
      )
    })
    return { output: out }
  }

  // Multi-column with colors. Group entries into rows of 4 columns.
  const cols = 4
  const colWidth = 22
  const out: TermLine[] = []
  // Build rows where each row mixes colors via concatenated colored runs.
  // Since our line model only supports a single color, render one entry per line in compact mode.
  // To get multi-col coloring, instead emit a single line whose color is the most common type.
  // Simplest: emit each entry on its own line with appropriate color.
  for (let i = 0; i < entries.length; i += cols) {
    const slice = entries.slice(i, i + cols)
    // Mix into one line; choose dominant color (mostly white)
    const text = slice.map((e) => (e.type === 'dir' ? e.name + '/' : e.name).padEnd(colWidth)).join('')
    out.push(line(text, undefined))
  }
  return { output: out }
}

function cmdCd(args: string[], ctx: CommandContext): CommandResult {
  const target = args[0] ?? '~'
  if (target === '-') return { output: [line('cd -: history not implemented', c.dim)] }
  const newParts = pathToParts(target, ctx.cwd)
  const node = resolvePath('/' + newParts.join('/'), [])
  if (!node) return { output: [line(`cd: ${target}: No such file or directory`, c.red)] }
  if (node.type !== 'dir') return { output: [line(`cd: ${target}: Not a directory`, c.red)] }
  ctx.setCwd(newParts)
  return { output: [] }
}

function cmdCat(args: string[], ctx: CommandContext): CommandResult {
  if (ctx.stdin !== undefined && args.length === 0) {
    return { output: ctx.stdin.split('\n').map((l) => line(l)) }
  }
  const out: TermLine[] = []
  for (const path of args) {
    const node = resolvePath(path, ctx.cwd)
    if (!node) {
      out.push(line(`cat: ${path}: No such file or directory`, c.red))
      continue
    }
    if (node.type === 'dir') {
      out.push(line(`cat: ${path}: Is a directory`, c.red))
      continue
    }
    out.push(...node.content!.split('\n').map((l) => line(l)))
  }
  return { output: out }
}

function cmdHead(args: string[], ctx: CommandContext): CommandResult {
  let n = 10
  const files: string[] = []
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-n') {
      n = parseInt(args[++i] || '10') || 10
    } else if (/^-\d+$/.test(args[i])) {
      n = parseInt(args[i].slice(1))
    } else {
      files.push(args[i])
    }
  }
  if (ctx.stdin !== undefined && files.length === 0) {
    return { output: ctx.stdin.split('\n').slice(0, n).map((l) => line(l)) }
  }
  const out: TermLine[] = []
  for (const path of files) {
    const node = resolvePath(path, ctx.cwd)
    if (!node || node.type !== 'file') {
      out.push(line(`head: cannot open '${path}'`, c.red))
      continue
    }
    out.push(...node.content!.split('\n').slice(0, n).map((l) => line(l)))
  }
  return { output: out }
}

function cmdTail(args: string[], ctx: CommandContext): CommandResult {
  let n = 10
  const files: string[] = []
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '-n') n = parseInt(args[++i] || '10') || 10
    else if (/^-\d+$/.test(args[i])) n = parseInt(args[i].slice(1))
    else files.push(args[i])
  }
  if (ctx.stdin !== undefined && files.length === 0) {
    return { output: ctx.stdin.split('\n').slice(-n).map((l) => line(l)) }
  }
  const out: TermLine[] = []
  for (const path of files) {
    const node = resolvePath(path, ctx.cwd)
    if (!node || node.type !== 'file') {
      out.push(line(`tail: cannot open '${path}'`, c.red))
      continue
    }
    out.push(...node.content!.split('\n').slice(-n).map((l) => line(l)))
  }
  return { output: out }
}

function cmdWc(args: string[], ctx: CommandContext): CommandResult {
  const flags = args.filter((a) => a.startsWith('-'))
  const files = args.filter((a) => !a.startsWith('-'))
  const onlyL = flags.includes('-l')
  const onlyW = flags.includes('-w')
  const onlyC = flags.includes('-c')
  const text =
    files.length === 0 && ctx.stdin !== undefined
      ? ctx.stdin
      : files
          .map((p) => {
            const n = resolvePath(p, ctx.cwd)
            return n?.type === 'file' ? n.content! : ''
          })
          .join('\n')
  const lc = text.split('\n').length
  const wc = text.trim() === '' ? 0 : text.trim().split(/\s+/).length
  const cc = text.length
  if (onlyL) return { output: [line(String(lc), c.white)] }
  if (onlyW) return { output: [line(String(wc), c.white)] }
  if (onlyC) return { output: [line(String(cc), c.white)] }
  return { output: [line(`  ${lc}  ${wc}  ${cc}  ${files.join(' ')}`, c.white)] }
}

function cmdTree(args: string[], ctx: CommandContext): CommandResult {
  const target = args[0] ?? '.'
  const node = resolvePath(target, ctx.cwd)
  if (!node) return { output: [line(`tree: ${target} [error]`, c.red)] }
  if (node.type !== 'dir') return { output: [line(target, c.white)] }
  const out: TermLine[] = [line(target === '.' ? cwdToString(ctx.cwd) : target, c.blue, true)]
  let dirCount = 0
  let fileCount = 0
  function walk(n: FSNode, prefix: string) {
    const children = Object.values(n.children ?? {}).sort((a, b) => a.name.localeCompare(b.name))
    children.forEach((child, i) => {
      const isLast = i === children.length - 1
      const branch = isLast ? '└── ' : '├── '
      const nextPrefix = prefix + (isLast ? '    ' : '│   ')
      if (child.type === 'dir') {
        dirCount++
        out.push(line(`${prefix}${branch}${child.name}`, c.blue))
        walk(child, nextPrefix)
      } else {
        fileCount++
        out.push(line(`${prefix}${branch}${child.name}`, colorForFilename(child.name, false)))
      }
    })
  }
  walk(node, '')
  out.push(blank())
  out.push(line(`${dirCount} directories, ${fileCount} files`, c.dim))
  return { output: out }
}

function cmdFind(args: string[], ctx: CommandContext): CommandResult {
  const where = args.find((a) => !a.startsWith('-')) ?? '.'
  const nameIdx = args.indexOf('-name')
  const pattern = nameIdx >= 0 ? args[nameIdx + 1]?.replace(/['"]/g, '') : null
  const re = pattern ? new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$') : null
  const start = resolvePath(where, ctx.cwd)
  if (!start) return { output: [line(`find: ${where}: No such file or directory`, c.red)] }

  const out: TermLine[] = []
  function walk(n: FSNode, path: string) {
    const display = path || where
    if (!re || re.test(n.name)) out.push(line(display, n.type === 'dir' ? c.blue : c.white))
    if (n.type === 'dir') {
      for (const [name, child] of Object.entries(n.children ?? {})) {
        walk(child, `${display}/${name}`)
      }
    }
  }
  walk(start, where === '.' ? '.' : where)
  return { output: out }
}

function cmdGrep(args: string[], ctx: CommandContext): CommandResult {
  const flags = args.filter((a) => a.startsWith('-'))
  const rest = args.filter((a) => !a.startsWith('-'))
  const pattern = rest[0]
  if (!pattern) return { output: [line('grep: usage: grep <pattern> [file]', c.red)] }
  const ignoreCase = flags.includes('-i')
  const invert = flags.includes('-v')
  const lineNumber = flags.includes('-n')
  let re: RegExp
  try {
    re = new RegExp(pattern, ignoreCase ? 'i' : '')
  } catch {
    return { output: [line(`grep: invalid pattern '${pattern}'`, c.red)] }
  }

  const files = rest.slice(1)
  const out: TermLine[] = []
  const handle = (text: string, label?: string) => {
    text.split('\n').forEach((l, i) => {
      const match = re.test(l)
      if (match !== invert) {
        const prefix = lineNumber ? `${i + 1}:` : ''
        const fileLabel = label ? `${label}:` : ''
        // highlight in red — single color per line in our model
        out.push(line(`${fileLabel}${prefix}${l}`, c.white))
      }
    })
  }
  if (files.length === 0 && ctx.stdin !== undefined) {
    handle(ctx.stdin)
  } else if (files.length === 0) {
    return { output: [line('grep: nothing to search (provide a file or pipe input)', c.red)] }
  } else {
    for (const f of files) {
      const n = resolvePath(f, ctx.cwd)
      if (!n || n.type !== 'file') {
        out.push(line(`grep: ${f}: No such file or directory`, c.red))
        continue
      }
      handle(n.content!, files.length > 1 ? f : undefined)
    }
  }
  return { output: out }
}

// ─── SUDO / SU ───────────────────────────────────────────────────────────────

function cmdSudo(): CommandResult {
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

function cmdSu(): CommandResult {
  return { output: [line('Password: ', c.white), line('su: Authentication failure', c.red)] }
}

// ─── PACMAN / YAY ────────────────────────────────────────────────────────────

function cmdPacman(args: string[]): CommandResult {
  if (args.includes('-Syu') || args.includes('-Sy')) {
    return {
      output: [
        line(':: Synchronizing package databases...', c.yellow),
        line(' core             138.0 KiB  14.2 MiB/s 00:00 [######################] 100%', c.green),
        line(' extra           8.4 MiB  18.6 MiB/s 00:01 [######################] 100%', c.green),
        line(' multilib       176.4 KiB  12.0 MiB/s 00:00 [######################] 100%', c.green),
        blank(),
        line(':: All packages are up to date.', c.green),
        line(`warning: james-portfolio-v1.0 is already the newest version`, c.yellow),
      ],
    }
  }
  if (args[0] === '-Q') {
    return {
      output: [
        line('linux 6.7.4.arch1-1', c.white),
        line('git 2.43.2-1', c.white),
        line('docker 25.0.3-1', c.white),
        line('node 21.6.2-1', c.white),
        line('firefox 123.0.1-1', c.white),
        line('… 1247 more packages', c.dim),
      ],
    }
  }
  return { output: [line('Try: pacman -Syu, pacman -Q', c.dim)] }
}

function cmdYay(args: string[]): CommandResult {
  return cmdPacman(args)
}

// ─── MAN ─────────────────────────────────────────────────────────────────────

const MAN_PAGES: Record<string, string> = {
  ls: `LS(1)\n\nNAME\n  ls - list directory contents\n\nSYNOPSIS\n  ls [OPTION]... [FILE]...\n\nFLAGS\n  -a   show hidden\n  -l   long listing\n  -la  combination`,
  cd: `CD(1)\n\nNAME\n  cd - change directory\n\nUSE\n  cd ~       go home\n  cd /etc    go to /etc\n  cd ..      one up`,
  grep: `GREP(1)\n\nNAME\n  grep - search text\n\nFLAGS\n  -i   ignore case\n  -v   invert match\n  -n   show line numbers`,
  os: `OS(1)\n\nNAME\n  os - portfolio command center\n\nFLAGS\n  --about    bio + achievements\n  --switch   reboot to OS selector\n  --help     this help`,
}

function cmdMan(args: string[]): CommandResult {
  const cmd = args[0]
  if (!cmd) return { output: [line('What manual page do you want?', c.yellow)] }
  if (MAN_PAGES[cmd]) return { output: lines(MAN_PAGES[cmd], c.white) }
  return {
    output: [
      line(`No manual entry for ${cmd}`, c.yellow),
      line('Try `os --help` for available commands.', c.dim),
    ],
  }
}

// ─── EDITORS (Vim/Nano stub with content peek) ──────────────────────────────

function cmdEditor(name: string, args: string[], ctx: CommandContext): CommandResult {
  const file = args[0]
  if (!file) {
    return {
      output: [
        line(`${name}: started in read-only preview mode (interactive editing not supported here)`, c.yellow),
        line(`Usage: ${name} <file>  — opens the file in a preview pane.`, c.dim),
        line(`Tip: use 'cat <file>' to print contents directly.`, c.dim),
      ],
    }
  }
  const node = resolvePath(file, ctx.cwd)
  if (!node) {
    return {
      output: [
        line(`"${file}" [New File]`, c.yellow),
        line(`(read-only — cannot create files in this session)`, c.dim),
      ],
    }
  }
  if (node.type !== 'file') return { output: [line(`${name}: ${file}: Is a directory`, c.red)] }

  const content = node.content!.split('\n')
  const isVim = name === 'vim' || name === 'vi'
  const top = isVim
    ? [
        line(`"${file}" ${content.length}L, ${node.content!.length}C`, c.dim),
        line('─'.repeat(60), c.dim),
      ]
    : [
        line(`  GNU nano   ${file}`, c.teal),
        line('─'.repeat(60), c.dim),
      ]
  const body = content.slice(0, 30).map((l, i) =>
    isVim
      ? line(`${String(i + 1).padStart(4)}  ${l}`, c.white)
      : line(`${l}`, c.white)
  )
  const footer = isVim
    ? [
        line('─'.repeat(60), c.dim),
        line(`-- READ-ONLY PREVIEW --                          ${content.length},1   All`, c.dim),
        line(`(:q to exit — already exited 🙂)`, c.yellow),
      ]
    : [
        line('─'.repeat(60), c.dim),
        line('^G Help    ^O Write    ^X Exit    ^K Cut     ^W Search', c.cyan),
        line('(read-only preview — already exited 🙂)', c.yellow),
      ]
  return { output: [...top, ...body, ...footer] }
}

// ─── COWSAY / FORTUNE / FIGLET / SL / MATRIX ─────────────────────────────────

const FORTUNES = [
  '"Code is read more often than it is written." — Guido van Rossum',
  '"Premature optimization is the root of all evil." — Donald Knuth',
  '"Talk is cheap. Show me the code." — Linus Torvalds',
  '"The best way to predict the future is to invent it." — Alan Kay',
  '"Simplicity is the ultimate sophistication." — Leonardo da Vinci',
  '"Make it work, make it right, make it fast." — Kent Beck',
  '"There are only two hard things in Computer Science: cache invalidation and naming things." — Phil Karlton',
  '"Programs must be written for people to read." — Hal Abelson',
  '"First, solve the problem. Then, write the code." — John Johnson',
  '"In the beginning, there was UNIX. And it was good."',
]

function cmdFortune(): CommandResult {
  const f = FORTUNES[Math.floor(Math.random() * FORTUNES.length)]
  return { output: [line(f, c.cyan)] }
}

function cmdCowsay(args: string[], ctx: CommandContext): CommandResult {
  const text =
    args.length > 0 ? args.join(' ') : ctx.stdin?.trim() || 'Moo!'
  const w = Math.min(40, Math.max(text.length, 4))
  const wrapped = wrap(text, w)
  const top = ' ' + '_'.repeat(w + 2)
  const bottom = ' ' + '-'.repeat(w + 2)
  const body =
    wrapped.length === 1
      ? [`< ${wrapped[0].padEnd(w)} >`]
      : wrapped.map((l, i) => {
          const left = i === 0 ? '/' : i === wrapped.length - 1 ? '\\' : '|'
          const right = i === 0 ? '\\' : i === wrapped.length - 1 ? '/' : '|'
          return `${left} ${l.padEnd(w)} ${right}`
        })
  const cow = [
    '        \\   ^__^',
    '         \\  (oo)\\_______',
    '            (__)\\       )\\/\\',
    '                ||----w |',
    '                ||     ||',
  ]
  return {
    output: [
      line(top, c.white),
      ...body.map((b) => line(b, c.white)),
      line(bottom, c.white),
      ...cow.map((l) => line(l, c.white)),
    ],
  }
}

const FIGLET_FONT: Record<string, string[]> = {
  // 5-line font for A-Z, 0-9
  // Each char = 5 lines, char width 6.
  // For brevity, use a compact bigfont approach: just uppercase letters and digits.
}

function figletText(text: string): string[] {
  // Simple block font using #
  const FONT: Record<string, string[]> = {
    A: ['  ___ ', ' / _ \\', '/ /_\\ \\', '|  _  |', '|_| |_|'],
    B: [' _____ ', '| ___ \\', '| |_/ /', '| ___ \\', '|_____/'],
    C: [' _____ ', '/  __ \\', '| /  \\/', '| \\__/\\', ' \\____/'],
    D: [' ____  ', '|  _ \\ ', '| | | |', '| |_| |', '|____/ '],
    E: [' _____ ', '|  ___|', '| |__  ', '|  __| ', '|_____|'],
    F: [' _____ ', '|  ___|', '| |_   ', '|  _|  ', '|_|    '],
    G: ['  __ _ ', ' / _` |', '| (_| |', ' \\__, |', ' |___/ '],
    H: [' _   _ ', '| | | |', '| |_| |', '|  _  |', '|_| |_|'],
    I: ['  ___  ', ' |_ _| ', '  | |  ', '  | |  ', ' |___| '],
    J: ['     _ ', '    | |', '    | |', '/\\__/ /', '\\____/ '],
    K: [' _   __', '| | / /', '| |/ / ', '|    \\ ', '|_|\\_\\ '],
    L: [' _     ', '| |    ', '| |    ', '| |___ ', '|_____|'],
    M: [' __  __', '|  \\/  |', '| \\  / |', '| |\\/| |', '|_|  |_|'],
    N: [' _   _ ', '| \\ | |', '|  \\| |', '| |\\  |', '|_| \\_|'],
    O: ['  ___  ', ' / _ \\ ', '| | | |', '| |_| |', ' \\___/ '],
    P: [' ____  ', '|  _ \\ ', '| |_) |', '|  __/ ', '|_|    '],
    Q: ['  ___  ', ' / _ \\ ', '| | | |', '| |_| |', ' \\__\\_\\'],
    R: [' ____  ', '|  _ \\ ', '| |_) |', '|  _ < ', '|_| \\_\\'],
    S: ['  ____ ', ' / ___|', ' \\___ \\', '  ___) |', ' |____/ '],
    T: [' _____ ', '|_   _|', '  | |  ', '  | |  ', '  |_|  '],
    U: [' _   _ ', '| | | |', '| | | |', '| |_| |', ' \\___/ '],
    V: [' _   _ ', '| | | |', '| | | |', '\\ \\_/ /', ' \\___/ '],
    W: [' __        __', ' \\ \\      / /', '  \\ \\ /\\ / / ', '   \\ V  V /  ', '    \\_/\\_/   '],
    X: [' __  __', ' \\ \\/ /', '  \\  / ', '  /  \\ ', ' /_/\\_\\'],
    Y: [' __   __', ' \\ \\ / /', '  \\ V / ', '   | |  ', '   |_|  '],
    Z: [' _____ ', '|__  /', '  / / ', ' / /_ ', '/____|'],
    ' ': ['   ', '   ', '   ', '   ', '   '],
  }
  const chars = text.toUpperCase().split('')
  const rows = ['', '', '', '', '']
  for (const ch of chars) {
    const glyph = FONT[ch] ?? FONT[' ']
    for (let i = 0; i < 5; i++) rows[i] += glyph[i] + ' '
  }
  return rows
}

function cmdFiglet(args: string[]): CommandResult {
  const text = args.join(' ') || 'ARCH'
  return { output: figletText(text).map((l) => line(l, c.cyan)) }
}

function cmdSl(): CommandResult {
  return {
    output: [
      line('      ====        ________                ___________ ', c.yellow),
      line('  _D _|  |_______/        \\__I_I_____===__|_________| ', c.yellow),
      line('   |(_)---  |   H\\________/ |   |        =|___ ___|   ', c.yellow),
      line('   /     |  |   H  |  |     |   |         ||_| |_||   ', c.yellow),
      line('  |      |  |   H  |__--------------------| [___] |   ', c.yellow),
      line('  | ________|___H__/__|_____/[][]~\\_______|       |   ', c.yellow),
      line('  |/ |   |-----------I_____I [][] []  D   |=======|__ ', c.yellow),
      line(`__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__ `, c.red),
      line(' |/-=|___|=    ||    ||    ||    |_____/~\\___/        ', c.red),
      line('  \\_/      \\O=====O=====O=====O_/      \\_/            ', c.red),
      blank(),
      line('  Choo choo! 🚂  (Did you mean "ls"?)', c.dim),
    ],
  }
}

function cmdMatrix(): CommandResult {
  const chars = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズヅブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン'
  const rows: TermLine[] = []
  for (let i = 0; i < 18; i++) {
    let row = ''
    for (let j = 0; j < 80; j++) {
      row += Math.random() > 0.7 ? chars[Math.floor(Math.random() * chars.length)] : ' '
    }
    rows.push(line(row, i < 3 ? c.white : c.green))
  }
  rows.push(blank())
  rows.push(line("Wake up, jmchorse... (matrix is cosmetic — try `clear` to wake up.)", c.dim))
  return { output: rows }
}

// ─── NETWORK / DEV TOOLING (jokes) ──────────────────────────────────────────

function cmdCurl(args: string[]): CommandResult {
  const url = args.find((a) => a.startsWith('http'))
  if (!url) return { output: [line('curl: try a URL, e.g., curl https://leftcoaststack.com', c.dim)] }
  return {
    output: [
      line(`% Total    % Received % Xferd  Average Speed   Time    Time     Time  Current`, c.dim),
      line(`100  4218  100  4218    0     0  18.4k      0 --:--:-- --:--:-- --:--:--  18k`, c.white),
      blank(),
      line(`<!DOCTYPE html><html><head><title>James McHorse</title></head>...`, c.gray),
      line(`(network access not available — this is a static demo)`, c.dim),
    ],
  }
}

function cmdGit(args: string[]): CommandResult {
  if (args[0] === 'status') {
    return {
      output: [
        line('On branch main', c.white),
        line("Your branch is up to date with 'origin/main'.", c.white),
        blank(),
        line('nothing to commit, working tree clean', c.green),
      ],
    }
  }
  if (args[0] === 'log') {
    return {
      output: [
        line('commit fd57c6c (HEAD -> main, origin/main)', c.yellow),
        line('Author: jmchorse <jmchorse.tech@gmail.com>', c.white),
        line('Date:   Wed Apr 15 10:42:18 2026 -0500', c.white),
        blank(),
        line('    add Spotlight, Control Center, edge snapping, and ambient sound to macOS', c.white),
      ],
    }
  }
  return { output: [line(`git: try 'git status' or 'git log'`, c.dim)] }
}

function cmdDocker(): CommandResult {
  return {
    output: [
      line('CONTAINER ID   IMAGE              COMMAND   STATUS                PORTS                    NAMES', c.dim),
      line('a4d9c2f1b3e8   portfolio:latest   nginx     Up 12 years (healthy) 0.0.0.0:443->443/tcp     james-portfolio', c.white),
    ],
  }
}

function cmdNpm(args: string[]): CommandResult {
  if (args[0] === 'install') {
    return {
      output: [
        line('added 1247 packages, and audited 1248 packages in 4s', c.green),
        line('found 0 vulnerabilities', c.green),
      ],
    }
  }
  return { output: [line(`npm: try 'npm install'`, c.dim)] }
}

function cmdPing(args: string[]): CommandResult {
  const target = args[0] ?? 'leftcoaststack.com'
  return {
    output: [
      line(`PING ${target} (104.21.42.18) 56(84) bytes of data.`, c.white),
      line(`64 bytes from ${target}: icmp_seq=1 ttl=58 time=12.4 ms`, c.white),
      line(`64 bytes from ${target}: icmp_seq=2 ttl=58 time=11.8 ms`, c.white),
      line(`64 bytes from ${target}: icmp_seq=3 ttl=58 time=12.1 ms`, c.white),
      line(`^C`, c.dim),
    ],
  }
}

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
  return { output: [line(`sound: unknown option '${flag}'.`, c.red)] }
}

// ─── REBOOT / SHUTDOWN / EXIT ────────────────────────────────────────────────

function cmdReboot(ctx: CommandContext): CommandResult {
  ctx.triggerSwitch()
  return {
    output: [
      line('Broadcast message from jmchorse (tty1):', c.yellow),
      line('The system will reboot now!', c.yellow),
    ],
  }
}

function cmdLogout(): CommandResult {
  return { output: [line('logout', c.dim), line('(use `reboot` to actually exit)', c.dim)] }
}

// ─── DISPATCHER + PIPES ──────────────────────────────────────────────────────

function dispatchOne(input: string, ctx: CommandContext, stdin?: string): CommandResult {
  const trimmed = input.trim()
  if (!trimmed) return { output: [] }

  // Apply alias to first word
  const firstSpace = trimmed.indexOf(' ')
  const cmdWord = firstSpace === -1 ? trimmed : trimmed.slice(0, firstSpace)
  const restStr = firstSpace === -1 ? '' : trimmed.slice(firstSpace)
  const aliased = ALIASES[cmdWord] ? `${ALIASES[cmdWord]}${restStr}` : trimmed
  const [cmd, ...args] = aliased.split(/\s+/)
  const next: CommandContext = { ...ctx, args, stdin }

  switch (cmd.toLowerCase()) {
    case 'os': return cmdOS(args, next)
    case 'help': return cmdHelp()
    case 'projects': return cmdProjects(args)
    case 'skills': return cmdSkills(args)
    case 'resume': return cmdResume(args, next)
    case 'contact': return cmdContact()
    case 'links': return cmdLinks()
    case 'chat': return {
      output: [
        line('AI Assistant — Coming Soon', c.magenta, true),
        blank(),
        line('  An LLM-powered assistant that knows my full career history is in development.', c.gray),
        line('  Email me directly:', c.gray),
        line(`  ${about.email}`, c.blue),
      ],
    }
    case 'whoami': return cmdWhoami()
    case 'neofetch': return cmdNeofetch()
    case 'date': return cmdDate()
    case 'uptime': return cmdUptime()
    case 'hostname': return cmdHostname()
    case 'uname': return cmdUname(args)
    case 'echo': return cmdEcho(args)
    case 'clear': return cmdClear()
    case 'history': return cmdHistory(next)
    case 'env': return cmdEnv()
    case 'export': return cmdExport(args)
    case 'alias': return cmdAlias(args)
    case 'unalias': return cmdUnalias()
    case 'ps': return cmdPs(args)
    case 'top': return cmdTop()
    case 'htop': return cmdTop()
    case 'free': return cmdFree(args)
    case 'df': return cmdDf(args)
    case 'du': return cmdDu(args, next)
    case 'which': return cmdWhich(args)
    case 'pwd': return cmdPwd(next)
    case 'ls': return cmdLs(args, next)
    case 'cd': return cmdCd(args, next)
    case 'cat': return cmdCat(args, next)
    case 'head': return cmdHead(args, next)
    case 'tail': return cmdTail(args, next)
    case 'wc': return cmdWc(args, next)
    case 'tree': return cmdTree(args, next)
    case 'find': return cmdFind(args, next)
    case 'grep': return cmdGrep(args, next)
    case 'sudo': return cmdSudo()
    case 'su': return cmdSu()
    case 'pacman': return cmdPacman(args)
    case 'yay': return cmdYay(args)
    case 'man': return cmdMan(args)
    case 'apropos': return cmdMan(args)
    case 'sound': return cmdSound(args)
    case 'reboot':
    case 'poweroff':
    case 'shutdown':
      return cmdReboot(next)
    case 'logout':
    case 'exit': return cmdLogout()
    case 'vim':
    case 'vi':
    case 'nano':
    case 'emacs': return cmdEditor(cmd, args, next)
    case 'cowsay': return cmdCowsay(args, next)
    case 'fortune': return cmdFortune()
    case 'figlet': return cmdFiglet(args)
    case 'sl': return cmdSl()
    case 'matrix': return cmdMatrix()
    case 'lolcat': return { output: stdin ? stdin.split('\n').map((l, i) => line(l, [c.red, c.orange, c.yellow, c.green, c.cyan, c.blue, c.magenta][i % 7])) : [line('Usage: <cmd> | lolcat', c.dim)] }
    case 'curl': return cmdCurl(args)
    case 'wget': return cmdCurl(args)
    case 'ping': return cmdPing(args)
    case 'git': return cmdGit(args)
    case 'docker': return cmdDocker()
    case 'kubectl': return { output: [line('No resources found in default namespace.', c.dim)] }
    case 'npm': return cmdNpm(args)
    case 'node': return { output: [line('Welcome to Node.js v21.6.2.', c.green), line('Type ".help" for more information.', c.dim), line('> (REPL not interactive in this session)', c.yellow)] }
    case 'python':
    case 'python3': return { output: [line('Python 3.12.2 (main, Feb  6 2024)', c.green), line('Type "help" for help.', c.dim), line('>>> (REPL not interactive in this session)', c.yellow)] }
    case 'ssh': return { output: [line(`ssh: connect to host: Operation not permitted in this sandbox`, c.red)] }
    default: return { output: [line(`bash: ${cmd}: command not found`, c.red)] }
  }
}

/**
 * Top-level dispatch that handles pipes (cmd1 | cmd2 | cmd3).
 * Each stage's output is converted to text and fed as stdin to the next.
 */
export function dispatch(input: string, ctx: CommandContext): CommandResult {
  const stages = input.split('|').map((s) => s.trim()).filter(Boolean)
  if (stages.length === 0) return { output: [] }
  if (stages.length === 1) return dispatchOne(stages[0], ctx)
  let stdin: string | undefined = undefined
  let last: CommandResult = { output: [] }
  for (const stage of stages) {
    const r = dispatchOne(stage, ctx, stdin)
    if (r.clearScreen) return r
    stdin = r.output.map((l) => l.text).join('\n')
    last = r
  }
  return last
}

// ─── Tab completion ─────────────────────────────────────────────────────────

export function tabComplete(partial: string, cwd: string[]): string[] {
  const trimmed = partial.replace(/^\s+/, '')
  if (!trimmed) return []
  const parts = trimmed.split(/\s+/)

  // Completing the command name itself
  if (parts.length === 1) {
    const all = [...COMMAND_LIST, ...Object.keys(ALIASES)]
    return all.filter((c) => c.startsWith(parts[0])).sort()
  }

  // Completing a path argument
  const lastArg = parts[parts.length - 1]
  const slashIdx = lastArg.lastIndexOf('/')
  const dir = slashIdx >= 0 ? lastArg.slice(0, slashIdx + 1) : ''
  const stem = slashIdx >= 0 ? lastArg.slice(slashIdx + 1) : lastArg
  const dirPath = dir || '.'
  const candidates = listChildren(dirPath, cwd)
  return candidates
    .filter((n) => n.startsWith(stem))
    .map((n) => dir + n)
    .sort()
}
