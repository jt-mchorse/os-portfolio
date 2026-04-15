'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type OSType = 'macos' | 'arch'
export type BootState =
  | 'selector'        // OS selection screen
  | 'booting'         // boot animation running
  | 'desktop'         // fully booted, showing OS
  | 'restarting'      // shutdown animation running
  | 'switching'       // transition to other OS

interface OSStore {
  currentOS: OSType | null
  bootState: BootState
  previousOS: OSType | null
  setOS: (os: OSType) => void
  setBootState: (state: BootState) => void
  triggerRestart: () => void
  triggerSwitch: (targetOS: OSType) => void
}

export const useOSStore = create<OSStore>()(
  persist(
    (set, get) => ({
      currentOS: null,
      bootState: 'selector',
      previousOS: null,

      setOS: (os) => set({ currentOS: os }),

      setBootState: (state) => set({ bootState: state }),

      triggerRestart: () => {
        set({ bootState: 'restarting' })
      },

      triggerSwitch: (targetOS) => {
        set({ bootState: 'switching', previousOS: get().currentOS })
        // After restart animation, switch OS and boot
        setTimeout(() => {
          set({ currentOS: targetOS, bootState: 'booting' })
        }, 2200)
        setTimeout(() => {
          set({ bootState: 'desktop' })
        }, 5500)
      },
    }),
    {
      name: 'os-portfolio-state',
      partialize: (state) => ({ currentOS: state.currentOS }),
    }
  )
)
