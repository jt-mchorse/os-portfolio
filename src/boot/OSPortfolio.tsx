'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useOSStore } from '@/store/osStore'
import OSSelector from './OSSelector'
import RestartTransition from '@/shared/RestartTransition'
import MobileScreen from '@/shared/MobileScreen'
import dynamic from 'next/dynamic'

const MacOSDesktop = dynamic(() => import('@/macos'), { ssr: false })
const ArchDesktop = dynamic(() => import('@/arch'), { ssr: false })
const MacBoot = dynamic(() => import('@/macos/chrome/MacBoot'), { ssr: false })
const ArchBoot = dynamic(() => import('@/arch/terminal/ArchBoot'), { ssr: false })

export default function OSPortfolio() {
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { currentOS, bootState, setBootState } = useOSStore()

  useEffect(() => {
    setMounted(true)
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (!mounted) return null
  if (isMobile) return <MobileScreen />

  return (
    <div className="h-screen w-screen overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        {/* Restart / shutdown overlay */}
        {bootState === 'restarting' && (
          <motion.div key="restart" className="absolute inset-0 z-[9999]">
            <RestartTransition />
          </motion.div>
        )}

        {/* OS Selector */}
        {bootState === 'selector' && (
          <motion.div
            key="selector"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <OSSelector />
          </motion.div>
        )}

        {/* macOS boot animation */}
        {bootState === 'booting' && currentOS === 'macos' && (
          <motion.div key="mac-boot" className="absolute inset-0">
            <MacBoot
              onComplete={() => setBootState('desktop')}
            />
          </motion.div>
        )}

        {/* Arch boot animation */}
        {bootState === 'booting' && currentOS === 'arch' && (
          <motion.div key="arch-boot" className="absolute inset-0">
            <ArchBoot
              onComplete={() => setBootState('desktop')}
            />
          </motion.div>
        )}

        {/* macOS Desktop */}
        {bootState === 'desktop' && currentOS === 'macos' && (
          <motion.div
            key="macos-desktop"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <MacOSDesktop />
          </motion.div>
        )}

        {/* Arch Desktop */}
        {bootState === 'desktop' && currentOS === 'arch' && (
          <motion.div
            key="arch-desktop"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <ArchDesktop />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
