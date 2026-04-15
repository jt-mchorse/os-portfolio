'use client'

import '@xterm/xterm/css/xterm.css'
import { useEffect, useRef, useCallback } from 'react'
import { useOSStore } from '@/store/osStore'
import { dispatch, type TermLine } from '@/arch/commands'
import { cwdToString } from '@/arch/fs/filesystem'
import { about } from '@/content/about'
import { play, sounds } from '@/lib/sounds'

const MOTD = `
\x1b[38;2;23;195;178m    _             _       _     _
   /_\\ _ _ __ ___| |_    | |   (_)_ _ _  ___ __
  / _ \\ '_/ _/ _ \\  _|   | |__ | | ' \\ || \\ \\ /
 /_/ \\_\\_| \\__\\___/\\__|   |____|_|_||_\\_,_/_\\_\\ \x1b[0m
\x1b[38;2;96;165;250m OS Portfolio v1.0.0\x1b[0m

\x1b[38;2;156;163;175mWelcome, \x1b[38;2;23;195;178m${about.name}\x1b[38;2;156;163;175m.\x1b[0m
\x1b[38;2;156;163;175mRun \x1b[38;2;234;179;8mos --help\x1b[38;2;156;163;175m to see available commands.\x1b[0m
`.trim()

const PROMPT_USER = '\x1b[38;2;23;195;178mjmchorse\x1b[0m'
const PROMPT_HOST = '\x1b[38;2;96;165;250march\x1b[0m'
const PROMPT_TILDE = '\x1b[38;2;234;179;8m'
const PROMPT_DOLLAR = '\x1b[38;2;156;163;175m$\x1b[0m'

function buildPrompt(cwd: string): string {
  return `[${PROMPT_USER}@${PROMPT_HOST} ${PROMPT_TILDE}${cwd}\x1b[0m] ${PROMPT_DOLLAR} `
}

function colorLine(line: TermLine): string {
  if (!line.color) return line.text
  const rgb = hexToRgb(line.color)
  if (!rgb) return line.text
  const boldCode = line.bold ? '\x1b[1m' : ''
  const dimCode = line.dim ? '\x1b[2m' : ''
  return `${boldCode}${dimCode}\x1b[38;2;${rgb.r};${rgb.g};${rgb.b}m${line.text}\x1b[0m`
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.replace('#', '').match(/.{2}/g)
  if (!m || m.length < 3) return null
  return { r: parseInt(m[0], 16), g: parseInt(m[1], 16), b: parseInt(m[2], 16) }
}

interface ArchTerminalProps {
  onOpenPDF?: () => void
}

export default function ArchTerminal({ onOpenPDF }: ArchTerminalProps) {
  const termRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<import('@xterm/xterm').Terminal | null>(null)
  const inputRef = useRef('')
  const historyRef = useRef<string[]>([])
  const historyIdxRef = useRef(-1)
  const cwdRef = useRef<string[]>([])
  const setCwdState = useCallback((newCwd: string[]) => { cwdRef.current = newCwd }, [])
  const { triggerRestart } = useOSStore()

  const updateCwd = useCallback((newCwd: string[]) => {
    setCwdState(newCwd)
  }, [setCwdState])

  const writePrompt = useCallback(() => {
    xtermRef.current?.write('\r\n' + buildPrompt(cwdToString(cwdRef.current)))
  }, [])

  const runCommand = useCallback((input: string) => {
    const term = xtermRef.current
    if (!term) return

    const trimmed = input.trim()
    if (trimmed) {
      historyRef.current.push(trimmed)
      historyIdxRef.current = historyRef.current.length
    }

    term.write('\r\n')

    // Play error sound for unknown commands (detected by red output with 'command not found')
    const isUnknownCmd = trimmed && !['os','projects','skills','resume','contact','links','chat','whoami','neofetch','date','uptime','clear','echo','reboot','help','ls','cd','cat','pwd','sudo','pacman','man','vim','nano','emacs','l','ls-la','sound'].includes(trimmed.split(/\s+/)[0])
    if (isUnknownCmd) play(sounds.archError)

    const result = dispatch(trimmed, {
      args: trimmed.split(/\s+/).slice(1),
      cwd: cwdRef.current,
      setCwd: updateCwd,
      openPDF: () => {
        onOpenPDF?.()
      },
      triggerSwitch: () => {
        setTimeout(() => triggerRestart(), 600)
      },
    })

    if (result.clearScreen) {
      term.clear()
    } else {
      result.output.forEach((line) => {
        term.writeln(colorLine(line))
      })
    }

    writePrompt()
  }, [updateCwd, triggerRestart, writePrompt])

  useEffect(() => {
    if (!termRef.current) return

    let term: import('@xterm/xterm').Terminal
    let fitAddon: import('@xterm/addon-fit').FitAddon

    const init = async () => {
      const { Terminal } = await import('@xterm/xterm')
      const { FitAddon } = await import('@xterm/addon-fit')
      const { WebLinksAddon } = await import('@xterm/addon-web-links')

      term = new Terminal({
        cursorBlink: true,
        cursorStyle: 'block',
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        fontSize: 13,
        lineHeight: 1.4,
        theme: {
          background: '#0d0d0d',
          foreground: '#f3f4f6',
          cursor: '#17c3b2',
          black: '#1e1e1e',
          brightBlack: '#4b5563',
          red: '#f87171',
          brightRed: '#fca5a5',
          green: '#22c55e',
          brightGreen: '#4ade80',
          yellow: '#eab308',
          brightYellow: '#fde047',
          blue: '#60a5fa',
          brightBlue: '#93c5fd',
          magenta: '#c084fc',
          brightMagenta: '#d8b4fe',
          cyan: '#22d3ee',
          brightCyan: '#67e8f9',
          white: '#f3f4f6',
          brightWhite: '#ffffff',
        },
        allowProposedApi: true,
        scrollback: 2000,
        convertEol: true,
      })

      fitAddon = new FitAddon()
      term.loadAddon(fitAddon)
      term.loadAddon(new WebLinksAddon())
      term.open(termRef.current!)
      fitAddon.fit()
      xtermRef.current = term

      // MOTD + initial prompt
      term.writeln(MOTD)
      term.write('\r\n')
      term.write(buildPrompt(cwdToString(cwdRef.current)))

      // Auto-run the help command on first load
      setTimeout(() => {
        runCommand('os --help')
      }, 300)

      // Handle keyboard input
      term.onKey(({ key, domEvent }) => {
        const ev = domEvent
        const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey

        if (ev.key === 'Enter') {
          const cmd = inputRef.current
          inputRef.current = ''
          runCommand(cmd)
          return
        }

        if (ev.key === 'Backspace') {
          if (inputRef.current.length > 0) {
            inputRef.current = inputRef.current.slice(0, -1)
            term.write('\b \b')
          }
          return
        }

        if (ev.key === 'ArrowUp') {
          const history = historyRef.current
          if (historyIdxRef.current > 0) {
            historyIdxRef.current--
            const cmd = history[historyIdxRef.current]
            // Clear current input
            term.write('\b \b'.repeat(inputRef.current.length))
            inputRef.current = cmd
            term.write(cmd)
          }
          return
        }

        if (ev.key === 'ArrowDown') {
          const history = historyRef.current
          if (historyIdxRef.current < history.length - 1) {
            historyIdxRef.current++
            const cmd = history[historyIdxRef.current]
            term.write('\b \b'.repeat(inputRef.current.length))
            inputRef.current = cmd
            term.write(cmd)
          } else {
            historyIdxRef.current = history.length
            term.write('\b \b'.repeat(inputRef.current.length))
            inputRef.current = ''
          }
          return
        }

        if (ev.ctrlKey && ev.key === 'c') {
          term.write('^C')
          inputRef.current = ''
          writePrompt()
          return
        }

        if (ev.ctrlKey && ev.key === 'l') {
          term.clear()
          term.write(buildPrompt(cwdToString(cwdRef.current)))
          return
        }

        if (ev.key === 'Tab') {
          // Simple tab completion for commands
          const partial = inputRef.current
          const cmds = ['os', 'projects', 'skills', 'resume', 'contact', 'links', 'chat', 'whoami', 'neofetch', 'date', 'uptime', 'clear', 'ls', 'cd', 'cat', 'pwd', 'echo', 'reboot', 'help']
          const matches = cmds.filter((c) => c.startsWith(partial))
          if (matches.length === 1) {
            const completion = matches[0].slice(partial.length)
            inputRef.current = matches[0]
            term.write(completion)
          }
          ev.preventDefault()
          return
        }

        if (printable) {
          inputRef.current += key
          term.write(key)
        }
      })

      // Handle resize
      const resizeObserver = new ResizeObserver(() => fitAddon.fit())
      resizeObserver.observe(termRef.current!)

      return () => {
        resizeObserver.disconnect()
        term.dispose()
      }
    }

    const cleanup = init()
    return () => {
      cleanup.then((fn) => fn?.())
    }
  }, [runCommand, writePrompt])

  return (
    <div
      ref={termRef}
      className="h-full w-full xterm-container"
      style={{ background: '#0d0d0d' }}
    />
  )
}
