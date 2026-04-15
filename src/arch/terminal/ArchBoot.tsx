'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { play, sounds } from '@/lib/sounds'

interface ArchBootProps {
  onComplete: () => void
}

const BOOT_LINES = [
  { text: 'Loading initial ramdisk ...', type: 'info', delay: 0 },
  { text: '[    0.000000] Linux version 6.8.1-arch1-1 (gcc version 13.2.1)', type: 'kernel', delay: 120 },
  { text: '[    0.000000] BIOS-provided physical RAM map:', type: 'kernel', delay: 80 },
  { text: '[  OK  ] Started Journal Service.', type: 'ok', delay: 200 },
  { text: '[  OK  ] Started udev Kernel Device Manager.', type: 'ok', delay: 180 },
  { text: '[  OK  ] Reached target Local File Systems (Pre).', type: 'ok', delay: 160 },
  { text: '[  OK  ] Mounted /boot/efi.', type: 'ok', delay: 140 },
  { text: '[  OK  ] Started Load Kernel Modules.', type: 'ok', delay: 150 },
  { text: '[  OK  ] Reached target Local File Systems.', type: 'ok', delay: 130 },
  { text: '[  OK  ] Reached target Network.', type: 'ok', delay: 200 },
  { text: '[  OK  ] Started Network Name Resolution.', type: 'ok', delay: 120 },
  { text: '[  OK  ] Reached target Host and Network Name Lookups.', type: 'ok', delay: 100 },
  { text: '[  OK  ] Started D-Bus System Message Bus.', type: 'ok', delay: 180 },
  { text: '[  OK  ] Reached target Basic System.', type: 'ok', delay: 160 },
  { text: '[  OK  ] Reached target Network is Online.', type: 'ok', delay: 200 },
  { text: '[  OK  ] Started Arch Linux Portfolio v1.0.', type: 'ok', delay: 220 },
  { text: '', type: 'blank', delay: 300 },
  { text: 'Arch Linux 6.8.1-arch1-1 (tty1)', type: 'info', delay: 100 },
  { text: '', type: 'blank', delay: 100 },
  { text: 'arch login: jmchorse (automatic login)', type: 'info', delay: 200 },
  { text: '', type: 'blank', delay: 400 },
]

export default function ArchBoot({ onComplete }: ArchBootProps) {
  const [visibleLines, setVisibleLines] = useState<number>(0)

  useEffect(() => {
    // POST beep at the very start of boot
    const beepTimer = setTimeout(() => play(sounds.archBoot), 80)
    let idx = 0
    let cumulativeDelay = 0

    const timers: ReturnType<typeof setTimeout>[] = [beepTimer]

    BOOT_LINES.forEach((line) => {
      cumulativeDelay += line.delay
      const t = setTimeout(() => {
        setVisibleLines(idx + 1)
        idx++
      }, cumulativeDelay)
      timers.push(t)
    })

    const doneTimer = setTimeout(() => {
      onComplete()
    }, cumulativeDelay + 600)
    timers.push(doneTimer)

    return () => timers.forEach(clearTimeout)
  }, [onComplete])

  return (
    <div className="h-full w-full bg-black overflow-hidden flex flex-col justify-end p-4 pb-6">
      <div className="space-y-0 font-mono text-xs leading-relaxed">
        {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.05 }}
          >
            {line.type === 'ok' ? (
              <span>
                <span className="text-green-400">[  OK  ]</span>
                <span className="text-gray-400"> {line.text.replace('[  OK  ]', '')}</span>
              </span>
            ) : line.type === 'kernel' ? (
              <span className="text-gray-600">{line.text}</span>
            ) : line.text === '' ? (
              <span>&nbsp;</span>
            ) : (
              <span className="text-gray-300">{line.text}</span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
