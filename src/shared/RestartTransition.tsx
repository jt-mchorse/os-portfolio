'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useOSStore } from '@/store/osStore'
import { useWindowStore } from '@/store/windowStore'
import { play, sounds } from '@/lib/sounds'

export default function RestartTransition() {
  const { currentOS, bootState, setBootState, setOS } = useOSStore()
  const { closeAllWindows } = useWindowStore()
  const isMac = currentOS === 'macos'

  useEffect(() => {
    if (bootState === 'restarting') {
      closeAllWindows()
      play(sounds.shutdown)
      const t = setTimeout(() => {
        setOS(null as never)
        setBootState('selector')
      }, 2400)
      return () => clearTimeout(t)
    }
  }, [bootState, closeAllWindows, setBootState, setOS])

  if (bootState !== 'restarting') return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: isMac ? '#e8e8e8' : '#000' }}
    >
      {isMac ? <MacRestartContent /> : <ArchRestartContent />}
    </motion.div>
  )
}

function MacRestartContent() {
  return (
    <div className="flex flex-col items-center gap-8">
      {/* Apple logo */}
      <svg width="72" height="72" viewBox="0 0 814 1000" fill="#333" xmlns="http://www.w3.org/2000/svg">
        <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.8-155.5-127.7C46.7 790.7 0 663 0 541.8c0-207.5 135.4-317.2 268.5-317.2 70.1 0 128.4 46.4 172.5 46.4 42.8 0 110.1-49 192.6-49 30.9 0 131.3 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
      </svg>
      {/* macOS progress bar */}
      <div className="relative w-48 h-1 rounded-full overflow-hidden bg-gray-300">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gray-500"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 2.0, ease: 'easeInOut' }}
        />
      </div>
    </div>
  )
}

function ArchRestartContent() {
  const lines = [
    '[  OK  ] Stopped Session 1 of User jmchorse.',
    '[  OK  ] Stopped target Default.',
    '[  OK  ] Stopped target Basic System.',
    '[  OK  ] Stopped target Paths.',
    '[  OK  ] Stopped target Slices.',
    '[  OK  ] Stopped target Sockets.',
    '[  OK  ] Stopped D-Bus System Message Bus.',
    '[  OK  ] Stopped target System Initialization.',
    '[  OK  ] Stopped target Local File Systems.',
    '[  OK  ] Reached target Shutdown.',
    'Rebooting...',
  ]

  return (
    <div className="font-mono text-xs text-gray-400 space-y-0.5 px-8 max-w-2xl w-full">
      {lines.map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.16, duration: 0.1 }}
          style={{ color: line.includes('OK') ? '#2ecc71' : '#aaa' }}
        >
          {line}
        </motion.div>
      ))}
    </div>
  )
}
