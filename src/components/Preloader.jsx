import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'

export default function Preloader({ onComplete }) {
  const rootRef = useRef(null)
  const countRef = useRef(null)
  const completeRef = useRef(onComplete)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    completeRef.current = onComplete
  }, [onComplete])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return undefined
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const counter = { value: 0 }

    if (reduce) {
      const timer = window.setTimeout(() => {
        setGone(true)
        completeRef.current?.()
      }, 320)
      return () => window.clearTimeout(timer)
    }

    const timeline = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        setGone(true)
        completeRef.current?.()
      },
    })

    timeline
      .fromTo(
        '.preloader__wordmark .char',
        { yPercent: 112, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.055 },
        0,
      )
      .to('.preloader__orb', { scale: 1, opacity: 1, rotate: 180, duration: 1.2, ease: 'expo.out' }, 0)
      .to('.preloader__status', { opacity: 1, duration: 0.4 }, 0.3)
      .to(
        counter,
        {
          value: 100,
          duration: 1.0,
          ease: 'power2.inOut',
          onUpdate: () => {
            if (countRef.current) {
              countRef.current.textContent = String(Math.round(counter.value)).padStart(3, '0')
            }
          },
        },
        0.08,
      )
      .to('.preloader__bar-fill', { scaleX: 1, duration: 1.0, ease: 'power2.inOut' }, 0.08)
      .to('.preloader__note', { opacity: 1, duration: 0.3 }, 0.55)
      .to('.preloader__inner', { autoAlpha: 0, y: -14, duration: 0.3, ease: 'power2.in' }, 1.18)
      .to('.preloader', { clipPath: 'inset(0 0 100% 0)', duration: 0.72, ease: 'power4.inOut' }, 1.28)
      .to('.preloader__flash', { opacity: 0.9, duration: 0.12, yoyo: true, repeat: 1 }, 1.2)

    return () => timeline.kill()
  }, [])

  if (gone) return null

  return (
    <div className="preloader" ref={rootRef} role="status" aria-live="polite">
      <div className="preloader__flash" aria-hidden="true" />
      <div className="preloader__inner">
        <div className="preloader__top">
          <span className="preloader__eyebrow">NEON SYSTEMS / BOOT SEQUENCE</span>
          <span className="preloader__build">BUILD 2026.01</span>
        </div>
        <div className="preloader__center">
          <div className="preloader__orb" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="preloader__wordmark" aria-label="NEON">
            {'NEON'.split('').map((char, index) => (
              <span className="char" key={`${char}-${index}`}>
                {char}
              </span>
            ))}
          </div>
          <p className="preloader__status">CALIBRATING SPATIAL FIELD</p>
        </div>
        <div className="preloader__bottom">
          <span className="preloader__count" ref={countRef}>
            000
          </span>
          <div className="preloader__bar">
            <span className="preloader__bar-fill" />
          </div>
          <p className="preloader__note">A LIVING INTERFACE IS ARRIVING</p>
        </div>
      </div>
      <span className="preloader__corner preloader__corner--tl">◢</span>
      <span className="preloader__corner preloader__corner--br">◣</span>
    </div>
  )
}
