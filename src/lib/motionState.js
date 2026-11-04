/**
 * A tiny mutable bridge between the scroll choreography, the DOM and WebGL.
 *
 * Nothing in the render loop reads React state: the DOM stays at 60fps while
 * Three.js consumes this object once per frame.
 */
export const CHAPTERS = [
  { id: 'arrival', index: '01', label: 'THE ARRIVAL' },
  { id: 'core', index: '02', label: 'AI CORE' },
  { id: 'intelligence', index: '03', label: 'INTELLIGENCE' },
  { id: 'spatial', index: '04', label: 'SPATIAL UI' },
  { id: 'color', index: '05', label: 'COLOR EXPLOSION' },
  { id: 'product', index: '06', label: 'THE OBJECT' },
  { id: 'final', index: '07', label: 'THE FUTURE' },
]

export const CHAPTER_COUNT = CHAPTERS.length

export const motionState = {
  progress: 0,
  stage: 0,
  velocity: 0,
  scrollY: 0,
  activeChapter: 0,
  ready: false,
  reduced: false,
  isMobile: false,
  mouse: { x: 0, y: 0, tx: 0, ty: 0, active: false },
  pointer: { x: 0, y: 0 },
  viewport: {
    width: typeof window === 'undefined' ? 1440 : window.innerWidth,
    height: typeof window === 'undefined' ? 900 : window.innerHeight,
  },
}

export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))

export const lerp = (a, b, t) => a + (b - a) * t

export const smoothstep = (edge0, edge1, x) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

/** Fade in over [inStart,inEnd] and out over [outStart,outEnd]. */
export const windowFade = (x, inStart, inEnd, outStart = Infinity, outEnd = Infinity) => {
  const fadeIn = smoothstep(inStart, inEnd, x)
  const fadeOut = Number.isFinite(outStart) ? 1 - smoothstep(outStart, outEnd, x) : 1
  return fadeIn * fadeOut
}

export const damp = (current, target, lambda, dt) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt))
