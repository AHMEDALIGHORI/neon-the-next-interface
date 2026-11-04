import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * A glass card that tilts toward the cursor and lifts its glow with it.
 */
export default function TiltCard({ className = '', children, ...props }) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const card = ref.current
    if (!card || !window.matchMedia('(pointer: fine)').matches) return undefined

    const rotateX = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' })
    const rotateY = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' })
    const lift = gsap.quickTo(card, 'y', { duration: 0.6, ease: 'power3.out' })

    gsap.set(card, { transformPerspective: 900, transformOrigin: 'center center' })

    const onMove = (event) => {
      const bounds = card.getBoundingClientRect()
      const px = (event.clientX - bounds.left) / bounds.width
      const py = (event.clientY - bounds.top) / bounds.height
      rotateY((px - 0.5) * 13)
      rotateX((0.5 - py) * 11)
      lift(-10)
      card.style.setProperty('--glow-x', `${px * 100}%`)
      card.style.setProperty('--glow-y', `${py * 100}%`)
    }
    const onLeave = () => {
      rotateY(0)
      rotateX(0)
      lift(0)
    }

    card.addEventListener('pointermove', onMove)
    card.addEventListener('pointerleave', onLeave)
    return () => {
      card.removeEventListener('pointermove', onMove)
      card.removeEventListener('pointerleave', onLeave)
      gsap.killTweensOf(card)
    }
  }, [])

  return (
    <article ref={ref} className={`tilt-card ${className}`} {...props}>
      {children}
    </article>
  )
}
