import gsap from 'gsap'

/**
 * The single cinematic scroll timeline.
 *
 * Seven chapters occupy seven units. ScrollTrigger scrubs this timeline 1:1
 * with Lenis, while WebGL reads the same master progress in motionState.
 * Keeping the narrative in one timeline means transitions stay physically
 * connected instead of feeling like separate fade-ins.
 */
export function buildScrollTimeline(track, stage) {
  const sections = Array.from(stage.querySelectorAll('.chapter'))
  const [hero, core, intelligence, spatial, color, product, final] = sections
  const q = (root, selector) => root.querySelector(selector)
  const qa = (root, selector) => Array.from(root.querySelectorAll(selector))
  const all = (selector) => Array.from(stage.querySelectorAll(selector))

  const timeline = gsap.timeline({ paused: true, defaults: { ease: 'none' } })

  // ---------------------------------------------------------------------------
  // Initial states
  // ---------------------------------------------------------------------------
  gsap.set(hero, { autoAlpha: 1 })
  gsap.set(sections.slice(1), { autoAlpha: 0 })

  const hiddenLines = all(
    '.core__title .line__in, .intelligence__headline .line__in, .spatial__title .line__in, .product__title .line__in, .final__title .line__in',
  )
  gsap.set(hiddenLines, { yPercent: 120 })

  gsap.set([q(core, '.core__header'), q(core, '.core__statement'), q(core, '.core__readout'), q(core, '.core__marquee')], {
    autoAlpha: 0,
    y: 24,
  })
  gsap.set(qa(core, '.core__component'), { autoAlpha: 0, x: 44 })
  gsap.set(q(intelligence, '.intelligence__headline--two'), { autoAlpha: 0 })
  gsap.set([q(intelligence, '.intelligence__header')], { autoAlpha: 0, y: 20 })
  gsap.set(
    [
      q(intelligence, '.intelligence__side-note'),
      q(intelligence, '.intelligence__sync'),
      q(intelligence, '.intelligence__quote'),
    ],
    { autoAlpha: 0, y: 24 },
  )
  gsap.set(q(intelligence, '.intelligence__ghost'), { xPercent: 12, opacity: 0.055 })

  gsap.set(q(spatial, '.spatial__header'), { autoAlpha: 0, y: 20 })
  gsap.set(qa(spatial, '.spatial__label'), { autoAlpha: 0, y: 34 })
  gsap.set([q(spatial, '.spatial__bottom'), q(spatial, '.spatial__reticle')], { autoAlpha: 0 })
  gsap.set(q(spatial, '.spatial__reticle'), { scale: 1.25 })
  gsap.set(q(spatial, '.spatial__frame'), { autoAlpha: 0, scale: 0.98 })

  const colorChars = qa(color, '.color__char')
  colorChars.forEach((char) => {
    gsap.set(char, {
      x: gsap.utils.random(-90, 90),
      y: gsap.utils.random(-210, 210),
      rotation: gsap.utils.random(-55, 55),
      scale: gsap.utils.random(0.35, 1.4),
      opacity: 0,
    })
  })
  gsap.set(qa(color, '.color__header, .color__footer'), { autoAlpha: 0, y: 24 })
  gsap.set(q(color, '.color__sticker'), { autoAlpha: 0, rotation: 18, scale: 0.7 })
  gsap.set(q(color, '.color__coords'), { autoAlpha: 0 })
  gsap.set(q(color, '.color__wash'), { autoAlpha: 0 })

  const productCards = qa(product, '.product-card')
  gsap.set(productCards, { autoAlpha: 0, y: 90, rotationX: -14, transformPerspective: 900 })
  gsap.set([q(product, '.product__header'), q(product, '.product__status'), q(product, '.product__specs')], {
    autoAlpha: 0,
    y: 20,
  })

  gsap.set(q(final, '.final__center'), { autoAlpha: 0, y: 35 })
  gsap.set([q(final, '.final__header'), q(final, '.footer'), q(final, '.final__ver')], { autoAlpha: 0, y: 20 })

  const enter = (section, time) => {
    timeline.set(section, { autoAlpha: 1, opacity: 0 }, time)
    timeline.to(section, { opacity: 1, duration: 0.08 }, time + 0.01)
  }
  const exit = (section, time) => {
    timeline.to(section, { opacity: 0, duration: 0.12, ease: 'power2.in' }, time)
    timeline.set(section, { autoAlpha: 0 }, time + 0.13)
  }

  // ---------------------------------------------------------------------------
  // 00 — THE ARRIVAL
  // ---------------------------------------------------------------------------
  const heroLineOne = q(hero, '.hero__line--1')
  const heroLineTwo = q(hero, '.hero__line--2')

  timeline.to(heroLineOne, { xPercent: -11, yPercent: -42, rotation: -1.6, opacity: 0, duration: 0.4, ease: 'power2.in' }, 0.54)
  timeline.to(heroLineTwo, { xPercent: 15, yPercent: 38, rotation: 1.2, opacity: 0, duration: 0.4, ease: 'power2.in' }, 0.55)
  timeline.to(
    qa(hero, '.hero__topline, .hero__tagline, .hero__aside, .hero__bottom, .scroll-cue, .hero__edge-label'),
    { autoAlpha: 0, y: -18, duration: 0.26, stagger: 0.025, ease: 'power2.in' },
    0.57,
  )
  exit(hero, 0.92)

  // ---------------------------------------------------------------------------
  // 01 — AI CORE / EXPLODED VIEW
  // ---------------------------------------------------------------------------
  enter(core, 0.93)
  timeline.to(q(core, '.core__header'), { autoAlpha: 1, y: 0, duration: 0.24 }, 0.99)
  timeline.to(qa(core, '.core__title .line__in'), { yPercent: 0, duration: 0.46, stagger: 0.08, ease: 'power4.out' }, 1.0)
  timeline.to(q(core, '.core__component'), { autoAlpha: 1, x: 0, duration: 0.3, stagger: 0.035, ease: 'power3.out' }, 1.04)
  timeline.to(q(core, '.core__statement'), { autoAlpha: 1, y: 0, duration: 0.32 }, 1.15)
  timeline.to(q(core, '.core__readout'), { autoAlpha: 1, y: 0, duration: 0.3 }, 1.27)
  timeline.to(q(core, '.core__marquee'), { autoAlpha: 1, y: 0, duration: 0.3 }, 1.33)
  timeline.to(q(core, '.core__title'), { yPercent: -7, duration: 0.5, ease: 'sine.inOut' }, 1.54)
  timeline.to(q(core, '.core__statement'), { y: -14, duration: 0.45, ease: 'sine.inOut' }, 1.55)
  exit(core, 1.9)

  // ---------------------------------------------------------------------------
  // 02 — INTELLIGENCE
  // ---------------------------------------------------------------------------
  enter(intelligence, 1.92)
  timeline.to(q(intelligence, '.intelligence__header'), { autoAlpha: 1, y: 0, duration: 0.3 }, 2.0)
  timeline.to(qa(intelligence, '.intelligence__headline--one .line__in'), { yPercent: 0, duration: 0.5, stagger: 0.09, ease: 'expo.out' }, 2.0)
  timeline.to(
    qa(intelligence, '.intelligence__side-note, .intelligence__sync, .intelligence__quote'),
    { autoAlpha: 1, y: 0, duration: 0.32, stagger: 0.06 },
    2.14,
  )
  timeline.to(q(intelligence, '.intelligence__ghost'), { xPercent: -8, opacity: 0.075, duration: 1, ease: 'sine.inOut' }, 2.0)
  timeline.to(q(intelligence, '.intelligence__headline--one'), { yPercent: -18, opacity: 0, duration: 0.32, ease: 'power2.in' }, 2.45)
  timeline.set(q(intelligence, '.intelligence__headline--two'), { autoAlpha: 1 }, 2.5)
  timeline.to(qa(intelligence, '.intelligence__headline--two .line__in'), { yPercent: 0, duration: 0.52, stagger: 0.09, ease: 'expo.out' }, 2.51)
  timeline.to(q(intelligence, '.intelligence__ghost'), { xPercent: -22, opacity: 0.035, duration: 0.55 }, 2.48)
  timeline.to(q(intelligence, '.intelligence__sync-bar i'), { width: '100%', duration: 0.7, ease: 'power2.inOut' }, 2.45)
  exit(intelligence, 2.91)

  // ---------------------------------------------------------------------------
  // 03 — SPATIAL UI
  // ---------------------------------------------------------------------------
  enter(spatial, 2.93)
  timeline.to(q(spatial, '.spatial__header'), { autoAlpha: 1, y: 0, duration: 0.3 }, 3.0)
  timeline.to(qa(spatial, '.spatial__title .line__in'), { yPercent: 0, duration: 0.5, stagger: 0.09, ease: 'expo.out' }, 3.0)
  timeline.to(q(spatial, '.spatial__reticle'), { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'expo.out' }, 3.05)
  timeline.to(q(spatial, '.spatial__frame'), { autoAlpha: 1, scale: 1, duration: 0.5 }, 3.02)
  timeline.to(qa(spatial, '.spatial__label'), { autoAlpha: 1, y: 0, duration: 0.34, stagger: 0.06, ease: 'power3.out' }, 3.07)
  timeline.to(q(spatial, '.spatial__bottom'), { autoAlpha: 1, duration: 0.4 }, 3.16)
  timeline.to(q(spatial, '.spatial__label--vision'), { x: -24, y: -36, duration: 0.55, ease: 'sine.inOut' }, 3.38)
  timeline.to(q(spatial, '.spatial__label--voice'), { x: 30, y: -18, duration: 0.55, ease: 'sine.inOut' }, 3.42)
  timeline.to(q(spatial, '.spatial__label--memory'), { x: -34, y: 22, duration: 0.55, ease: 'sine.inOut' }, 3.46)
  timeline.to(q(spatial, '.spatial__label--automation'), { x: 26, y: 28, duration: 0.55, ease: 'sine.inOut' }, 3.5)
  timeline.to(q(spatial, '.spatial__title'), { yPercent: -14, opacity: 0.08, duration: 0.28, ease: 'sine.inOut' }, 3.28)
  timeline.to(q(spatial, '.spatial__reticle'), { scale: 1.6, opacity: 0.14, duration: 0.5, ease: 'sine.inOut' }, 3.3)
  exit(spatial, 3.9)

  // ---------------------------------------------------------------------------
  // 04 — COLOR EXPLOSION
  // ---------------------------------------------------------------------------
  enter(color, 3.92)
  timeline.to(q(color, '.color__header'), { autoAlpha: 1, y: 0, duration: 0.3 }, 4.0)
  timeline.to(qa(color, '.color__wash'), { autoAlpha: 1, duration: 0.35 }, 4.0)
  timeline.to(q(color, '.color__coords'), { autoAlpha: 1, duration: 0.3 }, 4.05)
  timeline.to(
    qa(color, '.color__row--one .color__char'),
    { opacity: 1, x: 0, y: 0, rotation: 0, scale: 1, duration: 0.55, ease: 'expo.out', stagger: { each: 0.012, from: 'random' } },
    4.02,
  )
  timeline.to(
    qa(color, '.color__row--two .color__char'),
    { opacity: 1, x: 0, y: 0, rotation: 0, scale: 1, duration: 0.6, ease: 'expo.out', stagger: { each: 0.01, from: 'random' } },
    4.07,
  )
  timeline.to(
    qa(color, '.color__row--three .color__char'),
    { opacity: 1, x: 0, y: 0, rotation: 0, scale: 1, duration: 0.55, ease: 'expo.out', stagger: { each: 0.014, from: 'random' } },
    4.12,
  )
  timeline.to(q(color, '.color__sticker'), { autoAlpha: 1, rotation: -7, scale: 1, duration: 0.45, ease: 'back.out(1.7)' }, 4.2)
  timeline.to(q(color, '.color__footer'), { autoAlpha: 1, y: 0, duration: 0.4 }, 4.22)
  timeline.to(q(color, '.color__title'), { scale: 1.035, duration: 0.6, ease: 'sine.inOut' }, 4.42)
  timeline.to(
    qa(color, '.color__row--one .color__char'),
    { y: -150, x: 40, rotation: 22, opacity: 0, duration: 0.32, stagger: 0.006, ease: 'power2.in' },
    4.64,
  )
  timeline.to(
    qa(color, '.color__row--two .color__char'),
    { y: 180, x: -60, rotation: -28, opacity: 0, duration: 0.32, stagger: 0.005, ease: 'power2.in' },
    4.68,
  )
  timeline.to(
    qa(color, '.color__row--three .color__char'),
    { y: -130, x: -30, rotation: 18, opacity: 0, duration: 0.32, stagger: 0.006, ease: 'power2.in' },
    4.7,
  )
  timeline.to(q(color, '.color__sticker'), { y: -70, rotation: 14, autoAlpha: 0, duration: 0.3, ease: 'power2.in' }, 4.72)
  timeline.to(q(color, '.color__footer, .color__header, .color__coords'), { autoAlpha: 0, duration: 0.24 }, 4.72)
  exit(color, 4.9)

  // ---------------------------------------------------------------------------
  // 05 — THE OBJECT
  // ---------------------------------------------------------------------------
  enter(product, 4.92)
  timeline.to(q(product, '.product__header'), { autoAlpha: 1, y: 0, duration: 0.3 }, 5.0)
  timeline.to(qa(product, '.product__title .line__in'), { yPercent: 0, duration: 0.5, stagger: 0.09, ease: 'expo.out' }, 5.0)
  timeline.to(
    productCards,
    { autoAlpha: 1, y: 0, rotationX: 0, duration: 0.55, stagger: 0.1, ease: 'power3.out' },
    5.06,
  )
  timeline.to(q(product, '.product__status'), { autoAlpha: 1, y: 0, duration: 0.35 }, 5.2)
  timeline.to(q(product, '.product__specs'), { autoAlpha: 1, y: 0, duration: 0.35 }, 5.3)
  timeline.to(q(product, '.product__title'), { yPercent: -5, duration: 0.6, ease: 'sine.inOut' }, 5.45)
  exit(product, 5.9)

  // ---------------------------------------------------------------------------
  // 06 — FINAL SHOT
  // ---------------------------------------------------------------------------
  enter(final, 5.92)
  timeline.to(q(final, '.final__header'), { autoAlpha: 1, y: 0, duration: 0.32 }, 6.0)
  timeline.to(qa(final, '.final__title .line__in'), { yPercent: 0, duration: 0.6, stagger: 0.1, ease: 'expo.out' }, 6.0)
  timeline.to(q(final, '.final__center'), { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power3.out' }, 6.32)
  timeline.to(q(final, '.footer'), { autoAlpha: 1, y: 0, duration: 0.35 }, 6.42)
  timeline.to(q(final, '.final__ver'), { autoAlpha: 1, y: 0, duration: 0.35 }, 6.5)
  timeline.to(q(final, '.final__title'), { yPercent: -3, scale: 1.01, duration: 0.6, ease: 'sine.inOut' }, 6.45)

  // Keep the narrative full length even after the last visual tween.
  timeline.to({ end: 0 }, { end: 1, duration: 0.001 }, 7)

  return { timeline, sections }
}
