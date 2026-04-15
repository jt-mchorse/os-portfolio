'use client'

import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  const prevSizeRef = useRef({ x: win.x, y: win.y, width: win.width, height: win.height })

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

  if (win.isMinimized) return null

  return (
    // Rnd sits directly inside the desktop container so bounds="parent" works correctly.
    // The entrance animation is applied to the inner chrome div, not Rnd's wrapper.
    <Rnd
      style={{ zIndex: win.zIndex }}
      position={{ x: win.x, y: win.y }}
      size={{ width: win.width, height: win.height }}
      minWidth={360}
      minHeight={200}
      dragHandleClassName="window-drag-handle"
      bounds="parent"
      onMouseDown={() => focusWindow(win.id)}
      onDragStop={(_, d) => updateWindow(win.id, { x: d.x, y: d.y })}
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
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
        className="flex flex-col rounded-xl overflow-hidden mac-window-shadow"
        style={{
          width: '100%',
          height: '100%',
          border: win.isFocused ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(0,0,0,0.35)',
        }}
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
        >
          {/* Traffic lights */}
          <div className="flex items-center gap-2 mr-4 flex-shrink-0">
            <TrafficLight
              color="#ff5f56"
              icon="×"
              onClick={(e) => { e.stopPropagation(); play(sounds.windowClose); closeWindow(win.id) }}
              active={win.isFocused}
            />
            <TrafficLight
              color="#ffbd2e"
              icon="−"
              onClick={(e) => { e.stopPropagation(); play(sounds.minimize); minimizeWindow(win.id) }}
              active={win.isFocused}
            />
            <TrafficLight
              color="#28c840"
              icon="+"
              onClick={(e) => { e.stopPropagation(); handleZoom() }}
              active={win.isFocused}
            />
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
  )
}

function TrafficLight({
  color,
  icon,
  onClick,
  active,
}: {
  color: string
  icon: string
  onClick: (e: React.MouseEvent) => void
  active: boolean
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      className="w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-bold transition-all"
      style={{
        background: active ? color : '#555',
        color: 'rgba(0,0,0,0.7)',
        lineHeight: 1,
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && active ? icon : ''}
    </button>
  )
}
