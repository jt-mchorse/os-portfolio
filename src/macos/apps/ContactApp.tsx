'use client'

import { useState } from 'react'
import { about } from '@/content/about'

export default function ContactApp({ windowId }: { windowId: string; meta?: Record<string, unknown> }) {
  const [to] = useState(about.email)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sent, setSent] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSend = () => {
    window.open(`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  const copyEmail = async () => {
    await navigator.clipboard.writeText(to)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col h-full text-white" style={{ background: '#1e1e1e' }}>
      {/* Header toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b border-white/10 flex-shrink-0"
        style={{ background: '#252525' }}
      >
        <div className="flex gap-2">
          <button
            onClick={handleSend}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{ background: '#3b82f6', color: '#fff' }}
          >
            <span>✈</span> Send
          </button>
          <button
            onClick={() => { setSubject(''); setBody('') }}
            className="px-3 py-1.5 rounded-lg text-xs text-white/60 hover:bg-white/10 transition-colors"
          >
            Clear
          </button>
        </div>
        <button onClick={copyEmail} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
          {copied ? '✓ Copied!' : 'Copy email'}
        </button>
      </div>

      {/* Compose form */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* To field */}
        <div className="flex items-center px-4 py-2 border-b border-white/08">
          <span className="text-xs text-white/35 w-12 flex-shrink-0">To:</span>
          <span className="text-sm text-white/70">{to}</span>
        </div>

        {/* Subject */}
        <div className="flex items-center px-4 py-2 border-b border-white/08">
          <span className="text-xs text-white/35 w-12 flex-shrink-0">Subject:</span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="What's on your mind?"
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
          />
        </div>

        {/* Body */}
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your message…"
          className="flex-1 px-4 py-3 bg-transparent text-sm text-white/85 outline-none resize-none placeholder:text-white/25 macos-scrollbar"
        />
      </div>

      {/* Links footer */}
      <div
        className="flex items-center gap-4 px-4 py-2.5 border-t border-white/10 flex-shrink-0"
        style={{ background: '#222' }}
      >
        <span className="text-xs text-white/30">Also find me on:</span>
        <a href={about.github} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">GitHub</a>
        <a href={about.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">LinkedIn</a>
      </div>

      {sent && (
        <div className="absolute bottom-12 right-4 bg-green-600 text-white text-xs px-4 py-2 rounded-lg shadow-lg">
          Opening Mail app…
        </div>
      )}
    </div>
  )
}
