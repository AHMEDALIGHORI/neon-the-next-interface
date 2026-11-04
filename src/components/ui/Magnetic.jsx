import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'

/**
 * Wraps any element in a subtle magnetic hover field.
 */
export default function Magnetic({
  as: Tag = 'span',
  className = '',
  strength = 0.28,
  children,
  ...props
}) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element || !window.matchMedia('(pointer: fine)').matches) return undefined

    const xTo = gsap.quickTo(element, 'x', { duration: 0.55, ease: 'power3.out' })
    const yTo = gsap.quickTo(element, 'y', { duration: 0.55, ease: 'power3.out' })

    const onMove = (event) => {
      const bounds = element.getBoundingClientRect()
      const x = event.clientX - (bounds.left + bounds.width / 2)
      const y = event.clientY - (bounds.top + bounds.height / 2)
      xTo(x * strength)
      yTo(y * strength)
    }
    const onLeave = () => {
      xTo(0)
      yTo(0)
    }

    element.addEventListener('pointermove', onMove)
    element.addEventListener('pointerleave', onLeave)
    return () => {
      element.removeEventListener('pointermove', onMove)
      element.removeEventListener('pointerleave', onLeave)
      gsap.killTweensOf(element)
    }
  }, [strength])

  return (
    <Tag ref={ref} className={`magnetic ${className}`} {...props}>
      {children}
    </Tag>
  )
}
