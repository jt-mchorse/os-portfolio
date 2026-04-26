'use client'

/**
 * All sounds synthesized via Web Audio API — no audio files required.
 * Default off; toggled by the user per session (persisted in localStorage).
 */

let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx || ctx.state === 'closed') {
    ctx = new AudioContext()
  }
  return ctx
}

function now(): number {
  return getCtx().currentTime
}

// ─── Primitive helpers ────────────────────────────────────────────────────────

function osc(
  freq: number,
  type: OscillatorType,
  start: number,
  end: number,
  gainPeak: number,
  gainEnd = 0
): void {
  const ac = getCtx()
  const g = ac.createGain()
  const o = ac.createOscillator()
  o.type = type
  o.frequency.setValueAtTime(freq, start)
  g.gain.setValueAtTime(0, start)
  g.gain.linearRampToValueAtTime(gainPeak, start + 0.01)
  g.gain.linearRampToValueAtTime(gainEnd, end)
  o.connect(g)
  g.connect(ac.destination)
  o.start(start)
  o.stop(end + 0.01)
}

function sweep(
  freqStart: number,
  freqEnd: number,
  type: OscillatorType,
  start: number,
  duration: number,
  gain: number
): void {
  const ac = getCtx()
  const g = ac.createGain()
  const o = ac.createOscillator()
  o.type = type
  o.frequency.setValueAtTime(freqStart, start)
  o.frequency.exponentialRampToValueAtTime(freqEnd, start + duration)
  g.gain.setValueAtTime(gain, start)
  g.gain.linearRampToValueAtTime(0, start + duration)
  o.connect(g)
  g.connect(ac.destination)
  o.start(start)
  o.stop(start + duration + 0.01)
}

function noise(start: number, duration: number, gain: number): void {
  const ac = getCtx()
  const bufSize = ac.sampleRate * duration
  const buf = ac.createBuffer(1, bufSize, ac.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1
  const src = ac.createBufferSource()
  src.buffer = buf
  const g = ac.createGain()
  const filter = ac.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 800
  filter.Q.value = 0.5
  g.gain.setValueAtTime(gain, start)
  g.gain.linearRampToValueAtTime(0, start + duration)
  src.connect(filter)
  filter.connect(g)
  g.connect(ac.destination)
  src.start(start)
  src.stop(start + duration + 0.01)
}

// ─── Sound library ────────────────────────────────────────────────────────────

export const sounds = {
  /**
   * macOS startup chime — classic ascending chord (La-Sol-Mi triad with reverb)
   */
  macBoot(): void {
    const t = now() + 0.05
    // Chord: A2 (110Hz), E3 (165Hz), A3 (220Hz), C#4 (277Hz) — staggered entry
    const notes = [110, 165, 220, 277, 330]
    notes.forEach((freq, i) => {
      osc(freq, 'sine', t + i * 0.06, t + 2.8, 0.14, 0)
    })
    // Subtle shimmer on top
    osc(660, 'sine', t + 0.3, t + 2.2, 0.06, 0)
  },

  /**
   * Arch Linux boot — single ascending beep like a BIOS POST
   */
  archBoot(): void {
    const t = now() + 0.05
    sweep(220, 880, 'square', t, 0.18, 0.08)
    osc(880, 'sine', t + 0.18, t + 0.5, 0.1, 0)
  },

  /**
   * macOS window open — soft ascending whoosh
   */
  windowOpen(): void {
    const t = now()
    sweep(300, 900, 'sine', t, 0.12, 0.07)
    osc(900, 'sine', t + 0.1, t + 0.22, 0.05, 0)
  },

  /**
   * macOS window close — descending whoosh
   */
  windowClose(): void {
    const t = now()
    sweep(700, 250, 'sine', t, 0.12, 0.06)
  },

  /**
   * macOS click — brief soft thud (like the old trackpad click)
   */
  click(): void {
    const t = now()
    noise(t, 0.04, 0.12)
    osc(90, 'sine', t, t + 0.04, 0.15, 0)
  },

  /**
   * macOS minimize — genie-like downward sweep
   */
  minimize(): void {
    const t = now()
    sweep(500, 120, 'sine', t, 0.22, 0.07)
  },

  /**
   * macOS / Arch error — the classic buzz
   */
  error(): void {
    const t = now()
    osc(200, 'sawtooth', t, t + 0.12, 0.1, 0)
    osc(180, 'sawtooth', t + 0.05, t + 0.17, 0.08, 0)
  },

  /**
   * macOS restart / shutdown — fade-out descending chord
   */
  shutdown(): void {
    const t = now()
    const notes = [330, 220, 165, 110]
    notes.forEach((freq, i) => {
      osc(freq, 'sine', t + i * 0.18, t + i * 0.18 + 0.8, 0.1, 0)
    })
  },

  /**
   * Arch keypress — very subtle tick (used sparingly, not on every keydown)
   */
  archKey(): void {
    const t = now()
    noise(t, 0.018, 0.06)
  },

  /**
   * Arch command success — short terminal beep
   */
  archBeep(): void {
    const t = now()
    osc(880, 'square', t, t + 0.06, 0.07, 0)
  },

  /**
   * Arch command not found — descending buzz
   */
  archError(): void {
    const t = now()
    sweep(400, 150, 'square', t, 0.15, 0.09)
  },

  /**
   * OS selection confirm — satisfying pop
   */
  select(): void {
    const t = now()
    osc(440, 'sine', t, t + 0.08, 0.12, 0)
    osc(660, 'sine', t + 0.04, t + 0.14, 0.08, 0)
  },
}

// ─── Sound store (localStorage-backed) ───────────────────────────────────────

const STORAGE_KEY = 'os-portfolio-sound'

export function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(STORAGE_KEY) === 'true'
}

export function setSoundEnabled(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEY, String(enabled))
}

export function toggleSound(): boolean {
  const next = !isSoundEnabled()
  setSoundEnabled(next)
  return next
}

/**
 * Play a sound only if sound is enabled.
 * Silently resumes a suspended AudioContext (required by browser autoplay policy).
 */
export function play(soundFn: () => void): void {
  if (!isSoundEnabled()) return
  try {
    const ac = getCtx()
    if (ac.state === 'suspended') {
      ac.resume().then(soundFn)
    } else {
      soundFn()
    }
  } catch {
    // Ignore — browser may block audio before user interaction
  }
}

// ─── Ambient background loop (synthesized soft noise + slow LFO drone) ───────

const AMBIENT_KEY = 'os-portfolio-ambient'

let ambientNodes: {
  noiseSrc: AudioBufferSourceNode
  filter: BiquadFilterNode
  gain: GainNode
  drone1: OscillatorNode
  drone2: OscillatorNode
  droneGain: GainNode
} | null = null

function startAmbientNodes(): void {
  if (ambientNodes) return
  const ac = getCtx()
  // Long looping pink-ish noise buffer
  const len = ac.sampleRate * 4
  const buf = ac.createBuffer(1, len, ac.sampleRate)
  const data = buf.getChannelData(0)
  let lastOut = 0
  for (let i = 0; i < len; i++) {
    const white = Math.random() * 2 - 1
    lastOut = (lastOut + 0.02 * white) / 1.02
    data[i] = lastOut * 3
  }
  const src = ac.createBufferSource()
  src.buffer = buf
  src.loop = true

  const filter = ac.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 380
  filter.Q.value = 0.6

  const gain = ac.createGain()
  gain.gain.value = 0
  gain.gain.linearRampToValueAtTime(0.045, ac.currentTime + 1.2)

  src.connect(filter)
  filter.connect(gain)
  gain.connect(ac.destination)
  src.start()

  // Slow drone pad
  const d1 = ac.createOscillator()
  d1.type = 'sine'
  d1.frequency.value = 110
  const d2 = ac.createOscillator()
  d2.type = 'sine'
  d2.frequency.value = 165
  const dGain = ac.createGain()
  dGain.gain.value = 0
  dGain.gain.linearRampToValueAtTime(0.012, ac.currentTime + 1.5)
  d1.connect(dGain)
  d2.connect(dGain)
  dGain.connect(ac.destination)
  d1.start()
  d2.start()

  ambientNodes = { noiseSrc: src, filter, gain, drone1: d1, drone2: d2, droneGain: dGain }
}

function stopAmbientNodes(): void {
  if (!ambientNodes) return
  const ac = getCtx()
  const t = ac.currentTime
  ambientNodes.gain.gain.linearRampToValueAtTime(0, t + 0.6)
  ambientNodes.droneGain.gain.linearRampToValueAtTime(0, t + 0.6)
  const n = ambientNodes
  setTimeout(() => {
    try {
      n.noiseSrc.stop()
      n.drone1.stop()
      n.drone2.stop()
    } catch {}
  }, 700)
  ambientNodes = null
}

export function isAmbientPlaying(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(AMBIENT_KEY) === 'true'
}

export function setAmbientPlaying(on: boolean): void {
  localStorage.setItem(AMBIENT_KEY, String(on))
  try {
    const ac = getCtx()
    if (on) {
      const start = () => startAmbientNodes()
      if (ac.state === 'suspended') ac.resume().then(start)
      else start()
    } else {
      stopAmbientNodes()
    }
  } catch {}
}

/** Resume ambient playback on mount if it was on previously (after user gesture) */
export function resumeAmbientIfEnabled(): void {
  if (typeof window === 'undefined') return
  if (isAmbientPlaying()) {
    try {
      const ac = getCtx()
      if (ac.state === 'suspended') ac.resume().then(() => startAmbientNodes())
      else startAmbientNodes()
    } catch {}
  }
}
