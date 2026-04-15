'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOSStore, type OSType } from '@/store/osStore'
import { play, sounds, isSoundEnabled, setSoundEnabled } from '@/lib/sounds'

function AppleLogo({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 814 1000" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.8-155.5-127.7C46.7 790.7 0 663 0 541.8c0-207.5 135.4-317.2 268.5-317.2 70.1 0 128.4 46.4 172.5 46.4 42.8 0 110.1-49 192.6-49 30.9 0 131.3 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
    </svg>
  )
}

function ArchLogo({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 500 500" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M250 30 L470 450 L330 450 L250 260 L170 450 L30 450 Z" />
      <path d="M190 340 L310 340 L270 440 L230 440 Z" fill="rgba(0,0,0,0.35)" />
    </svg>
  )
}

export default function OSSelector() {
  const [focused, setFocused] = useState<OSType>('macos')
  const [hoveredOS, setHoveredOS] = useState<OSType | null>(null)
  const [soundOn, setSoundOn] = useState(false)
  const { setOS, setBootState } = useOSStore()

  // Read initial sound state after mount (localStorage only available client-side)
  useEffect(() => {
    setSoundOn(isSoundEnabled())
  }, [])

  const selectOS = useCallback(
    (os: OSType) => {
      play(sounds.select)
      setOS(os)
      setBootState('booting')
    },
    [setOS, setBootState]
  )

  const handleToggleSound = () => {
    setSoundEnabled(!soundOn)
    setSoundOn(!soundOn)
    if (!soundOn) play(sounds.archBeep) // audible confirmation when turning ON
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setFocused('macos')
      if (e.key === 'ArrowRight') setFocused('arch')
      if (e.key === 'Enter') selectOS(focused)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [focused, selectOS])

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center bg-black overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)',
            width: '60vw',
            height: '60vw',
            top: '-20vw',
            left: '-10vw',
            animation: 'float1 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full opacity-15 blur-3xl"
          style={{
            background: 'radial-gradient(circle, #1de9b6 0%, transparent 70%)',
            width: '50vw',
            height: '50vw',
            bottom: '-15vw',
            right: '-10vw',
            animation: 'float2 10s ease-in-out infinite',
          }}
        />
      </div>

      <style jsx>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(3vw, 2vw) scale(1.05); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-2vw, -3vw) scale(1.08); }
        }
      `}</style>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mb-16 text-center"
      >
        <h1 className="text-white text-2xl font-light tracking-[0.2em] uppercase opacity-80">
          James Travis McHorse
        </h1>
        <p className="text-gray-500 text-sm tracking-[0.15em] uppercase mt-2">Select your environment</p>
      </motion.div>

      {/* OS tiles */}
      <div className="flex gap-8 items-stretch">
        {(['macos', 'arch'] as OSType[]).map((os, i) => {
          const isMac = os === 'macos'
          const isFocused = focused === os
          const isHovered = hoveredOS === os

          return (
            <motion.button
              key={os}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 + i * 0.15 }}
              onClick={() => selectOS(os)}
              onMouseEnter={() => { setHoveredOS(os); setFocused(os) }}
              onMouseLeave={() => setHoveredOS(null)}
              className="relative flex flex-col items-center justify-center rounded-2xl border transition-all duration-300 outline-none cursor-pointer"
              style={{
                width: '220px',
                height: '280px',
                borderColor: isFocused ? (isMac ? 'rgba(255,255,255,0.5)' : 'rgba(23,195,178,0.6)') : 'rgba(255,255,255,0.1)',
                background: isFocused
                  ? isMac
                    ? 'rgba(255,255,255,0.07)'
                    : 'rgba(23,195,178,0.07)'
                  : 'rgba(255,255,255,0.03)',
                boxShadow: isFocused
                  ? isMac
                    ? '0 0 40px rgba(255,255,255,0.08), inset 0 0 40px rgba(255,255,255,0.03)'
                    : '0 0 40px rgba(23,195,178,0.12), inset 0 0 40px rgba(23,195,178,0.03)'
                  : 'none',
                transform: isHovered ? 'scale(1.03)' : 'scale(1)',
              }}
            >
              <div
                className="mb-5 transition-all duration-300"
                style={{
                  color: isMac ? (isFocused ? '#fff' : 'rgba(255,255,255,0.5)') : isFocused ? '#17c3b2' : 'rgba(23,195,178,0.4)',
                  filter: isFocused ? 'drop-shadow(0 0 12px currentColor)' : 'none',
                }}
              >
                {isMac ? <AppleLogo size={64} /> : <ArchLogo size={64} />}
              </div>

              <span
                className="text-lg font-semibold tracking-wide transition-all duration-300"
                style={{ color: isFocused ? '#fff' : 'rgba(255,255,255,0.5)' }}
              >
                {isMac ? 'macOS' : 'Arch Linux'}
              </span>
              <span
                className="mt-1 text-xs tracking-widest uppercase transition-all duration-300"
                style={{
                  color: isMac
                    ? isFocused ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)'
                    : isFocused ? 'rgba(23,195,178,0.7)' : 'rgba(23,195,178,0.3)',
                }}
              >
                {isMac ? 'Desktop' : 'Terminal'}
              </span>

              <AnimatePresence>
                {isFocused && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-5 text-xs"
                    style={{ color: isMac ? 'rgba(255,255,255,0.4)' : 'rgba(23,195,178,0.5)' }}
                  >
                    Click or press Enter
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>

      {/* Keyboard hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="mt-10 text-xs tracking-widest text-gray-700 uppercase"
      >
        ← → to navigate · Enter to boot
      </motion.p>

      {/* Sound toggle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        onClick={handleToggleSound}
        className="absolute bottom-5 right-6 text-xs flex items-center gap-1.5 transition-colors"
        style={{ color: soundOn ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)' }}
        title={soundOn ? 'Sound on — click to mute' : 'Sound off — click to enable'}
      >
        {soundOn ? '🔊' : '🔇'} Sound {soundOn ? 'On' : 'Off'}
      </motion.button>
    </div>
  )
}
