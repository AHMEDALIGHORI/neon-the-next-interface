import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'

export default function Hero({ ready }) {
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    if (!ready || !rootRef.current) return undefined
    const root = rootRef.current
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const context = gsap.context(() => {
      if (reduce) {
        gsap.set(root.querySelectorAll('.hero__line .line__in, .hero__topline, .hero__tagline, .hero__aside, .hero__bottom, .scroll-cue, .hero__edge-label'), {
          autoAlpha: 1,
          y: 0,
          yPercent: 0,
        })
        return
      }

      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.08 })
      timeline
        .fromTo(
          '.hero__line .line__in',
          { yPercent: 112, opacity: 1 },
          { yPercent: 0, opacity: 1, duration: 1.25, stagger: 0.11, ease: 'expo.out' },
          0,
        )
        .to('.hero__period', { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' }, 0.85)
        .to('.hero__topline', { autoAlpha: 1, y: 0, duration: 0.7 }, 0.25)
        .to('.hero__tagline', { autoAlpha: 1, y: 0, duration: 0.8 }, 0.55)
        .to('.hero__aside', { autoAlpha: 1, x: 0, duration: 0.8 }, 0.7)
        .to('.hero__bottom', { autoAlpha: 1, y: 0, duration: 0.8 }, 0.85)
        .to('.scroll-cue', { autoAlpha: 1, duration: 0.7 }, 1.0)
        .to('.hero__edge-label', { autoAlpha: 1, duration: 0.8, stagger: 0.08 }, 1.0)
    }, rootRef)

    return () => context.revert()
  }, [ready])

  return (
    <section id="arrival" className="chapter hero" data-chapter="0" aria-labelledby="hero-title" ref={rootRef}>
      <div className="chapter__inner hero__inner">
        <div className="hero__topline">
          <p className="eyebrow">
            <span className="live-dot" />
            A SENSORY COMPUTER / MMXXVI
          </p>
          <p className="eyebrow hero__topline-right">BUILT FOR THE SPACE BETWEEN</p>
        </div>

        <h1 className="hero__title display" id="hero-title">
          <span className="hero__line hero__line--1">
            <span className="line__in">THE NEXT</span>
          </span>
          <span className="hero__line hero__line--2">
            <span className="line__in">
              INTERFACE<span className="hero__period">.</span>
            </span>
          </span>
        </h1>

        <div className="hero__tagline">
          <p className="hero__tagline-main">
            Technology
            <br />
            should feel <em>alive.</em>
          </p>
          <span className="hero__tagline-rule" />
          <p className="micro hero__tagline-meta">AI × SPATIAL × WEARABLE × AUTONOMOUS</p>
        </div>

        <div className="hero__aside">
          <span className="micro">A NEW SPECIES</span>
          <span className="micro">OF COMPUTER</span>
          <span className="hero__aside-rule" />
          <span className="micro micro--dim">FORM 001 / ACTIVE</span>
        </div>

        <div className="hero__bottom">
          <div className="hero__coordinates micro">
            <span>LAT 25.2048° N</span>
            <span>LON 55.2708° E</span>
            <span>DEPTH 001</span>
          </div>
          <div className="hero__signal" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <p className="hero__bottom-note micro">TECHNOLOGY SHOULD FEEL ALIVE</p>
        </div>

        <div className="scroll-cue" aria-hidden="true">
          <span className="scroll-cue__line">
            <i />
          </span>
          <span className="micro">SCROLL TO AWAKEN</span>
        </div>

        <span className="hero__edge-label micro">01 / THE ARRIVAL</span>
        <span className="hero__edge-label hero__edge-label--right micro">STATUS: DREAMING</span>
      </div>
    </section>
  )
}
