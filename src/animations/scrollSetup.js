import Lenis from 'lenis'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { CHAPTER_COUNT, motionState } from '../lib/motionState'
import { CUE, cue } from '../lib/audio'
import { buildScrollTimeline } from './scrollAnimations'

gsap.registerPlugin(ScrollTrigger)

const clamp01 = (value) => Math.min(1, Math.max(0, value))

/**
 * Boots Lenis, the one master ScrollTrigger, pointer input and the optional
 * sound cues. Everything visual reads motionState, not React.
 */
export function initExperienceScroll({ track, stage }) {
  if (!track || !stage) return () => {}

  motionState.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  motionState.isMobile = window.matchMedia('(max-width: 820px)').matches
  motionState.viewport.width = window.innerWidth
  motionState.viewport.height = window.innerHeight

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  window.scrollTo(0, 0)

  const lenis = new Lenis({
    autoRaf: false,
    duration: motionState.reduced ? 0.6 : 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: !motionState.reduced,
    wheelMultiplier: motionState.isMobile ? 1 : 0.88,
    touchMultiplier: 1.3,
    syncTouch: false,
    anchors: false,
  })
  window.__lenis = lenis
  lenis.stop()
  document.body.classList.add('is-loading')

  const { timeline, sections } = buildScrollTimeline(track, stage)
  const sectionEls = sections

  const master = ScrollTrigger.create({
    id: 'neon-master',
    trigger: track,
    start: 'top top',
    end: 'bottom bottom',
    animation: timeline,
    scrub: true,
    invalidateOnRefresh: true,
    onUpdate: (self) => updateProgress(self.progress),
    onRefresh: (self) => updateProgress(self.progress),
  })

  const cuePoints = [
    { key: 'explode', at: 1.23, name: CUE.EXPLODE },
    { key: 'neural', at: 2.25, name: CUE.NEURAL },
    { key: 'spatial', at: 3.14, name: CUE.UI },
    { key: 'color', at: 4.12, name: CUE.COLOR },
    { key: 'reconstruct', at: 5.12, name: CUE.RECONSTRUCT },
    { key: 'final', at: 6.12, name: CUE.FINAL },
  ]
  const fired = new Set()
  let activeChapter = -1

  function updateProgress(rawProgress) {
    const progress = clamp01(rawProgress)
    const stageValue = progress * CHAPTER_COUNT
    const chapter = Math.min(CHAPTER_COUNT - 1, Math.floor(stageValue + 0.00001))

    motionState.progress = progress
    motionState.stage = stageValue
    motionState.activeChapter = chapter

    document.documentElement.style.setProperty('--page-progress', progress.toFixed(5))

    if (chapter !== activeChapter) {
      activeChapter = chapter
      if (chapter > 0) cue(CUE.SECTION, { index: chapter, chapter: sectionEls[chapter]?.id })
    }

    for (const point of cuePoints) {
      if (stageValue >= point.at && !fired.has(point.key)) {
        fired.add(point.key)
        cue(point.name)
      } else if (stageValue < point.at - 0.18) {
        fired.delete(point.key)
      }
    }
  }

  updateProgress(master.progress)

  const onScroll = (event) => {
    ScrollTrigger.update()
    motionState.scrollY = event.scroll ?? window.scrollY
    const velocity = Math.abs(event.velocity ?? 0)
    motionState.velocity = velocity
    const normalized = Math.min(1, velocity / 34)
    document.documentElement.style.setProperty('--scroll-velocity', normalized.toFixed(4))
  }
  lenis.on('scroll', onScroll)

  const raf = (time) => {
    lenis.raf(time * 1000)
  }
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)

  const onPointerMove = (event) => {
    const { innerWidth, innerHeight } = window
    motionState.mouse.tx = (event.clientX / innerWidth) * 2 - 1
    motionState.mouse.ty = -((event.clientY / innerHeight) * 2 - 1)
    motionState.mouse.active = true
    motionState.pointer.x = event.clientX
    motionState.pointer.y = event.clientY
    document.documentElement.style.setProperty('--pointer-x', `${(event.clientX / innerWidth) * 100}%`)
    document.documentElement.style.setProperty('--pointer-y', `${(event.clientY / innerHeight) * 100}%`)
  }
  const onPointerLeave = () => {
    motionState.mouse.active = false
  }
  const onPointerDown = () => {
    motionState.mouse.down = true
  }
  const onPointerUp = () => {
    motionState.mouse.down = false
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true })
  document.addEventListener('pointerleave', onPointerLeave)
  window.addEventListener('pointerdown', onPointerDown, { passive: true })
  window.addEventListener('pointerup', onPointerUp, { passive: true })

  const refresh = () => {
    motionState.viewport.width = window.innerWidth
    motionState.viewport.height = window.innerHeight
    motionState.isMobile = window.matchMedia('(max-width: 820px)').matches
    ScrollTrigger.refresh()
  }
  let resizeTimer = 0
  const onResize = () => {
    window.clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(refresh, 180)
  }
  window.addEventListener('resize', onResize)

  let disposed = false
  document.fonts?.ready.then(() => {
    if (disposed) return
    ScrollTrigger.refresh()
    updateProgress(master.progress)
  })

  // Browsers can restore the scroll after fonts settle; force the opening frame.
  window.setTimeout(() => {
    if (disposed) return
    if (window.scrollY === 0) {
      master.scroll(0)
      updateProgress(0)
    }
  }, 60)

  return () => {
    disposed = true
    window.clearTimeout(resizeTimer)
    lenis.off('scroll', onScroll)
    gsap.ticker.remove(raf)
    window.removeEventListener('pointermove', onPointerMove)
    document.removeEventListener('pointerleave', onPointerLeave)
    window.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('resize', onResize)
    master.kill()
    timeline.kill()
    lenis.destroy()
    document.body.classList.remove('is-loading')
    window.__lenis = null
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
  }
}
