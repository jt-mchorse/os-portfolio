'use client'

import { create } from 'zustand'

export type AppId =
  | 'finder'
  | 'projects'
  | 'skills'
  | 'resume'
  | 'contact'
  | 'about-mac'
  | 'switch-os'
  | 'assistant'
  | 'project-detail'

export interface WindowState {
  id: string
  appId: AppId
  title: string
  x: number
  y: number
  width: number
  height: number
  isMinimized: boolean
  isFocused: boolean
  zIndex: number
  meta?: Record<string, unknown>
}

interface WindowStore {
  windows: WindowState[]
  maxZ: number
  openWindow: (config: Omit<WindowState, 'zIndex' | 'isFocused'>) => void
  closeWindow: (id: string) => void
  focusWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  restoreWindow: (id: string) => void
  updateWindow: (id: string, updates: Partial<WindowState>) => void
  closeAllWindows: () => void
  isWindowOpen: (appId: AppId) => boolean
  getWindowByApp: (appId: AppId) => WindowState | undefined
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  maxZ: 100,

  openWindow: (config) => {
    const { windows, maxZ } = get()
    const existing = windows.find((w) => w.appId === config.appId && config.appId !== 'project-detail')
    if (existing) {
      // Bring to front and restore if minimized
      set({
        windows: windows.map((w) =>
          w.id === existing.id
            ? { ...w, isMinimized: false, isFocused: true, zIndex: maxZ + 1 }
            : { ...w, isFocused: false }
        ),
        maxZ: maxZ + 1,
      })
      return
    }
    const newWindow: WindowState = {
      ...config,
      isFocused: true,
      zIndex: maxZ + 1,
    }
    set({
      windows: [...windows.map((w) => ({ ...w, isFocused: false })), newWindow],
      maxZ: maxZ + 1,
    })
  },

  closeWindow: (id) => {
    set((state) => ({ windows: state.windows.filter((w) => w.id !== id) }))
  },

  focusWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id
          ? { ...w, isFocused: true, zIndex: state.maxZ + 1 }
          : { ...w, isFocused: false }
      ),
      maxZ: state.maxZ + 1,
    }))
  },

  minimizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, isMinimized: true, isFocused: false } : w)),
    }))
  },

  restoreWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id
          ? { ...w, isMinimized: false, isFocused: true, zIndex: state.maxZ + 1 }
          : { ...w, isFocused: false }
      ),
      maxZ: state.maxZ + 1,
    }))
  },

  updateWindow: (id, updates) => {
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    }))
  },

  closeAllWindows: () => set({ windows: [] }),

  isWindowOpen: (appId) => get().windows.some((w) => w.appId === appId && !w.isMinimized),

  getWindowByApp: (appId) => get().windows.find((w) => w.appId === appId),
}))
