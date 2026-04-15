'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { play, sounds } from '@/lib/sounds'

interface MacBootProps {
  onComplete: () => void
}

export default function MacBoot({ onComplete }: MacBootProps) {
  useEffect(() => {
    // Slight delay so the user gesture from OS selection primes the AudioContext
    const chime = setTimeout(() => play(sounds.macBoot), 120)
    const done = setTimeout(onComplete, 3200)
    return () => { clearTimeout(chime); clearTimeout(done) }
  }, [onComplete])

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-black">
      {/* Apple logo fades in */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        className="mb-14"
      >
        <svg width="80" height="80" viewBox="0 0 814 1000" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.8-155.5-127.7C46.7 790.7 0 663 0 541.8c0-207.5 135.4-317.2 268.5-317.2 70.1 0 128.4 46.4 172.5 46.4 42.8 0 110.1-49 192.6-49 30.9 0 131.3 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
        </svg>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="relative w-44 h-1 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.15)' }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-white"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.8, duration: 2.0, ease: 'easeInOut' }}
        />
      </motion.div>
    </div>
  )
}
