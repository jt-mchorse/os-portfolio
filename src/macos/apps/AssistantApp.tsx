'use client'

export default function AssistantApp({ windowId }: { windowId: string; meta?: Record<string, unknown> }) {
  return (
    <div
      className="flex flex-col items-center justify-center h-full gap-5 text-white px-8"
      style={{ background: '#1a1a2e' }}
    >
      {/* Animated glow orb */}
      <div className="relative">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.6) 0%, rgba(99,102,241,0.1) 70%)',
            boxShadow: '0 0 40px rgba(99,102,241,0.4)',
            animation: 'pulse 2.5s ease-in-out infinite',
          }}
        >
          🤖
        </div>
        <div
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: '#f59e0b', fontSize: '10px' }}
        >
          ✦
        </div>
      </div>

      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">AI Assistant</h3>
        <div
          className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3"
          style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}
        >
          Coming Soon
        </div>
        <p className="text-sm text-white/50 leading-relaxed max-w-xs">
          An LLM-powered assistant that knows my entire career history — ask anything about my projects, skills, or experience.
        </p>
      </div>

      <div
        className="w-full max-w-xs rounded-xl p-4 mt-2"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <p className="text-xs text-white/30 mb-2">Planned features:</p>
        <ul className="space-y-1.5">
          {[
            'Chat with my project history',
            'Ask about tech stack decisions',
            'Request code samples',
            'Get answers about my experience',
          ].map((f) => (
            <li key={f} className="flex items-center gap-2 text-xs text-white/50">
              <span className="text-indigo-400">○</span> {f}
            </li>
          ))}
        </ul>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 40px rgba(99,102,241,0.4); }
          50% { box-shadow: 0 0 60px rgba(99,102,241,0.65); }
        }
      `}</style>
    </div>
  )
}
