'use client'

import { useOSStore } from '@/store/osStore'
import { useWindowStore } from '@/store/windowStore'

export default function SwitchOSApp({ windowId }: { windowId: string; meta?: Record<string, unknown> }) {
  const { triggerRestart } = useOSStore()
  const { closeWindow } = useWindowStore()

  const handleSwitch = () => {
    closeWindow(windowId)
    setTimeout(() => triggerRestart(), 200)
  }

  return (
    <div
      className="flex flex-col items-center justify-center h-full gap-4 text-white px-6"
      style={{ background: '#1e1e1e' }}
    >
      <div className="text-4xl">🔄</div>
      <div className="text-center">
        <h3 className="text-base font-semibold mb-1">Switch Operating System</h3>
        <p className="text-sm text-white/50 max-w-xs leading-relaxed">
          All open windows will be closed. You'll be taken back to the OS selection screen.
        </p>
      </div>
      <div className="flex gap-3 mt-2">
        <button
          onClick={() => closeWindow(windowId)}
          className="px-4 py-2 rounded-lg text-sm text-white/60 border border-white/15 hover:border-white/30 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleSwitch}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
          style={{ background: '#ef4444', color: '#fff' }}
        >
          Restart & Switch
        </button>
      </div>
    </div>
  )
}
