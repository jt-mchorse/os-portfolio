'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Rnd } from 'react-rnd'
import { useWindowStore, type WindowState } from '@/store/windowStore'
import { play, sounds } from '@/lib/sounds'

interface MacWindowProps {
  window: WindowState
  children: React.ReactNode
}

export default function MacWindow({ window: win, children }: MacWindowProps) {
  const { closeWindow, focusWindow, minimizeWindow, updateWindow } = useWindowStore()
  const [isZoomed, setIsZoomed] = useState(false)
  const [snapHint, setSnapHint] = useState<null | 'left' | 'right' | 'top'>(null)
  const prevSizeRef = useRef({ x: win.x, y: win.y, width: win.width, height: win.height })
  const [isMinimizing, setIsMinimizing] = useState(false)
  const [groupHover, setGroupHover] = useState(false)

  const handleZoom = () => {
    if (isZoomed) {
      updateWindow(win.id, prevSizeRef.current)
      setIsZoomed(false)
    } else {
      prevSizeRef.current = { x: win.x, y: win.y, width: win.width, height: win.height }
      updateWindow(win.id, {
        x: 0,
        y: 0,
        width: globalThis.window?.innerWidth ?? 1280,
        height: (globalThis.window?.innerHeight ?? 800) - 28,
      })
      setIsZoomed(true)
    }
  }

  // Play open sound once on mount
  useEffect(() => {
    play(sounds.windowOpen)
  }, [])

  const handleClose = () => {
    play(sounds.windowClose)
    setTimeout(() => closeWindow(win.id), 130)
  }

  const handleMinimize = () => {
    play(sounds.minimize)
    setIsMinimizing(true)
    setTimeout(() => {
      minimizeWindow(win.id)
      setIsMinimizing(false)
    }, 280)
  }

  // Edge snapping — only triggered when mouse cursor is at the actual screen edge
  // AND the user is holding the Option/Alt key. This prevents accidental snaps
  // during normal dragging.
  const isDraggingRef = useRef(false)
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return
      // Only when Option/Alt held — opt-in snap
      if (!e.altKey) {
        if (snapHint) setSnapHint(null)
        return
      }
      const w = globalThis.window?.innerWidth ?? 1280
      const EDGE = 4 // cursor must be within 4px of the screen edge
      if (e.clientX <= EDGE) setSnapHint('left')
      else if (e.clientX >= w - EDGE) setSnapHint('right')
      else if (e.clientY <= 28 + EDGE) setSnapHint('top') // 28 = menu bar height
      else setSnapHint(null)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [snapHint])

  const handleDragStart = () => {
    isDraggingRef.current = true
  }

  const handleDragStop = (_: unknown, d: { x: number; y: number }) => {
    isDraggingRef.current = false
    const w = globalThis.window?.innerWidth ?? 1280
    const h = globalThis.window?.innerHeight ?? 800
    if (snapHint === 'left') {
      prevSizeRef.current = { x: win.x, y: win.y, width: win.width, height: win.height }
      updateWindow(win.id, { x: 0, y: 0, width: Math.round(w / 2), height: h - 28 })
    } else if (snapHint === 'right') {
      prevSizeRef.current = { x: win.x, y: win.y, width: win.width, height: win.height }
      updateWindow(win.id, { x: Math.round(w / 2), y: 0, width: Math.round(w / 2), height: h - 28 })
    } else if (snapHint === 'top') {
      prevSizeRef.current = { x: win.x, y: win.y, width: win.width, height: win.height }
      updateWindow(win.id, { x: 0, y: 0, width: w, height: h - 28 })
      setIsZoomed(true)
    } else {
      updateWindow(win.id, { x: d.x, y: d.y })
    }
    setSnapHint(null)
  }

  if (win.isMinimized) return null

  return (
    <>
      <AnimatePresence>
        {snapHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="absolute pointer-events-none rounded-xl border-2 border-white/45"
            style={{
              left: snapHint === 'right' ? '50%' : 0,
              top: 0,
              width: snapHint === 'top' ? '100%' : '50%',
              height: '100%',
              background: 'rgba(180,200,255,0.12)',
              backdropFilter: 'blur(8px)',
              zIndex: 9999,
            }}
          />
        )}
      </AnimatePresence>

      <Rnd
        style={{ zIndex: win.zIndex }}
        position={{ x: win.x, y: win.y }}
        size={{ width: win.width, height: win.height }}
        minWidth={360}
        minHeight={200}
        dragHandleClassName="window-drag-handle"
        bounds="parent"
        onMouseDown={() => focusWindow(win.id)}
        onDragStart={handleDragStart}
        onDragStop={handleDragStop}
        onResizeStop={(_, __, ref, ___, pos) =>
          updateWindow(win.id, {
            width: parseInt(ref.style.width),
            height: parseInt(ref.style.height),
            x: pos.x,
            y: pos.y,
          })
        }
      >
        <motion.div
          key={win.id}
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={
            isMinimizing
              ? {
                  opacity: 0,
                  scale: 0.05,
                  y: (globalThis.window?.innerHeight ?? 800) - win.y,
                }
              : { opacity: 1, scale: 1, y: 0 }
          }
          transition={{
            duration: isMinimizing ? 0.28 : 0.2,
            ease: isMinimizing ? [0.5, 0, 0.75, 0] : [0.23, 1, 0.32, 1],
          }}
          style={{
            width: '100%',
            height: '100%',
            transformOrigin: '50% 100%',
            border: win.isFocused ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(0,0,0,0.35)',
          }}
          className="flex flex-col rounded-xl overflow-hidden mac-window-shadow"
        >
          {/* Title bar */}
          <div
            className="window-drag-handle flex items-center px-3 h-10 flex-shrink-0 cursor-default select-none"
            style={{
              background: win.isFocused
                ? 'linear-gradient(to bottom, #3d3d3d, #2e2e2e)'
                : 'linear-gradient(to bottom, #2f2f2f, #252525)',
              borderBottom: '1px solid rgba(0,0,0,0.4)',
            }}
            onDoubleClick={handleZoom}
            onMouseEnter={() => setGroupHover(true)}
            onMouseLeave={() => setGroupHover(false)}
          >
            {/* Traffic lights */}
            <div
              className="flex items-center gap-2 mr-4 flex-shrink-0"
              onMouseEnter={() => setGroupHover(true)}
              onMouseLeave={() => setGroupHover(false)}
            >
              <TrafficLight color="#ff5f56" icon="×" onClick={(e) => { e.stopPropagation(); handleClose() }} active={win.isFocused} groupHover={groupHover} />
              <TrafficLight color="#ffbd2e" icon="−" onClick={(e) => { e.stopPropagation(); handleMinimize() }} active={win.isFocused} groupHover={groupHover} />
              <TrafficLight color="#28c840" icon="+" onClick={(e) => { e.stopPropagation(); handleZoom() }} active={win.isFocused} groupHover={groupHover} />
            </div>

            {/* Title */}
            <span
              className="flex-1 text-center text-xs font-medium truncate"
              style={{ color: win.isFocused ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)' }}
            >
              {win.title}
            </span>
            <div className="w-16 flex-shrink-0" />
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden" style={{ background: '#1e1e1e' }}>
            {children}
          </div>
        </motion.div>
      </Rnd>
    </>
  )
}

function TrafficLight({
  color,
  icon,
  onClick,
  active,
  groupHover,
}: {
  color: string
  icon: string
  onClick: (e: React.MouseEvent) => void
  active: boolean
  groupHover: boolean
}) {
  return (
    <button
      className="w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold transition-colors"
      style={{
        background: active ? color : '#555',
        color: 'rgba(0,0,0,0.7)',
        lineHeight: 1,
        boxShadow: active ? `inset 0 0 0 0.5px rgba(0,0,0,0.4)` : 'none',
      }}
      onClick={onClick}
    >
      {groupHover && active ? icon : ''}
    </button>
  )
}
