import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { CHAPTERS, CHAPTER_COUNT } from '../lib/motionState'
import { CUE, cue, soundEngine } from '../lib/audio'

const scrollToChapter = (index) => {
  if (typeof window === 'undefined') return
  const root = document.documentElement
  const max = root.scrollHeight - window.innerHeight
  const progress = index === 0 ? 0 : Math.min(0.985, (index + 0.22) / CHAPTER_COUNT)
  if (window.__lenis) {
    window.__lenis.scrollTo(max * progress, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) })
  } else {
    window.scrollTo({ top: max * progress, behavior: 'smooth' })
  }
}

export default function Navigation({ ready }) {
  const navRef = useRef(null)
  const [soundOn, setSoundOn] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => soundEngine.subscribe(setSoundOn), [])

  useLayoutEffect(() => {
    if (!ready || !navRef.current) return undefined
    const tween = gsap.fromTo(
      navRef.current,
      { y: -28, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 1.1, ease: 'power3.out', delay: 0.2 },
    )
    return () => tween.kill()
  }, [ready])

  useEffect(() => {
    if (!open) return undefined
    window.__lenis?.stop()
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      if (window.__lenis && document.body.classList.contains('is-ready')) {
        window.__lenis.start()
      }
    }
  }, [open])

  const goTo = (index) => {
    cue(CUE.UI)
    setOpen(false)
    window.setTimeout(() => scrollToChapter(index), 50)
  }

  const toggleSound = async () => {
    const enabled = await soundEngine.toggle()
    if (enabled) cue(CUE.UI, { force: true })
  }

  return (
    <>
      <header className="nav" ref={navRef} style={{ visibility: ready ? 'visible' : 'hidden' }}>
        <button className="brand" onClick={() => goTo(0)} data-cursor="TOP" aria-label="NEON — back to beginning">
          <span className="brand__mark" aria-hidden="true">
            <span />
          </span>
          <span className="brand__name">
            NEON<sup>®</sup>
          </span>
          <span className="brand__edition">SPATIAL / 01</span>
        </button>

        <div className="nav__status" aria-hidden="true">
          <span className="status-dot" />
          <span>LIVE SYSTEM</span>
          <span className="nav__status-sep">/</span>
          <span className="nav__status-dim">FEELING: ALIVE</span>
        </div>

        <div className="nav__actions">
          <button
            type="button"
            className={`sound-toggle ${soundOn ? 'is-on' : ''}`}
            onClick={toggleSound}
            aria-pressed={soundOn}
            data-cursor={soundOn ? 'MUTE' : 'PLAY'}
          >
            <span className="sound-bars" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            <span className="sound-toggle__label">AUDIO {soundOn ? 'ON' : 'OFF'}</span>
          </button>
          <button
            type="button"
            className={`menu-toggle ${open ? 'is-open' : ''}`}
            onClick={() => {
              cue(CUE.UI)
              setOpen((value) => !value)
            }}
            aria-expanded={open}
            aria-controls="site-menu"
            data-cursor={open ? 'CLOSE' : 'OPEN'}
          >
            <span>INDEX</span>
            <span className="menu-toggle__icon" aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
      </header>

      <div className={`site-menu ${open ? 'is-open' : ''}`} id="site-menu" aria-hidden={!open}>
        <div className="site-menu__wash" aria-hidden="true" />
        <div className="site-menu__inner">
          <div className="site-menu__head">
            <span className="micro">NEON / NAVIGATION / 2026</span>
            <span className="micro">SEVEN CHAPTERS. ONE INTERFACE.</span>
          </div>
          <nav className="site-menu__nav" aria-label="Chapters">
            <ul>
              {CHAPTERS.map((chapter, index) => (
                <li key={chapter.id} style={{ '--i': index }}>
                  <button
                    type="button"
                    onClick={() => goTo(index)}
                    data-cursor="GO"
                    tabIndex={open ? 0 : -1}
                  >
                    <span className="site-menu__index">{chapter.index}</span>
                    <span className="site-menu__label">{chapter.label}</span>
                    <span className="site-menu__arrow">↗</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <aside className="site-menu__aside">
            <p className="site-menu__manifesto">
              Technology should
              <br />
              feel <em>alive.</em>
            </p>
            <p className="site-menu__body">
              NEON is a fictional spatial companion. A surface-free computer that listens, sees and
              learns the shape of your world.
            </p>
            <div className="site-menu__meta">
              <span>EST. 2026</span>
              <span>EARTH / NEAR FUTURE</span>
              <button type="button" onClick={() => goTo(6)} tabIndex={open ? 0 : -1}>
                REQUEST ACCESS →
              </button>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
