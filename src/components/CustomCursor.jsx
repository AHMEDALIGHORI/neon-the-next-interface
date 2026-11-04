import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function CustomCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const labelRef = useRef(null)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches
    if (!fine) return undefined

    const dot = dotRef.current
    const ring = ringRef.current
    const label = labelRef.current
    if (!dot || !ring || !label) return undefined

    document.documentElement.classList.add('has-cursor')
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 0 })

    const dotX = gsap.quickTo(dot, 'x', { duration: 0.08, ease: 'power2.out' })
    const dotY = gsap.quickTo(dot, 'y', { duration: 0.08, ease: 'power2.out' })
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.55, ease: 'power3.out' })
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.55, ease: 'power3.out' })

    const pointerState = { visible: false }
    const onMove = (event) => {
      const { clientX: x, clientY: y } = event
      if (!pointerState.visible) {
        pointerState.visible = true
        gsap.to([dot, ring], { opacity: 1, duration: 0.3 })
        gsap.set([dot, ring], { x, y })
      }
      dotX(x)
      dotY(y)
      ringX(x)
      ringY(y)
    }

    const onOver = (event) => {
      const target = event.target.closest('[data-cursor]')
      if (target) {
        const text = target.getAttribute('data-cursor')
        label.textContent = text
        ring.classList.add('is-active')
        if (text && text.length > 2) ring.classList.add('has-label')
        else ring.classList.remove('has-label')
      }
    }
    const onOut = (event) => {
      const target = event.target.closest('[data-cursor]')
      if (target && !target.contains(event.relatedTarget)) {
        ring.classList.remove('is-active', 'has-label')
        label.textContent = ''
      }
    }
    const onDown = () => ring.classList.add('is-down')
    const onUp = () => ring.classList.remove('is-down')
    const onLeave = () => {
      pointerState.visible = false
      gsap.to([dot, ring], { opacity: 0, duration: 0.25 })
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver)
    document.addEventListener('pointerout', onOut)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.addEventListener('mouseleave', onLeave)

    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('mouseleave', onLeave)
      gsap.killTweensOf([dot, ring])
    }
  }, [])

  return (
    <div className="cursor" aria-hidden="true">
      <span className="cursor__ring" ref={ringRef}>
        <span className="cursor__label" ref={labelRef} />
      </span>
      <span className="cursor__dot" ref={dotRef} />
    </div>
  )
}
