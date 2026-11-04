import { useEffect, useRef } from 'react'
import Experience from '../three/Experience'

export default function Scene({ ready }) {
  const canvasRef = useRef(null)
  const experienceRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    let experience
    try {
      experience = new Experience(canvas)
      experienceRef.current = experience
    } catch (error) {
      console.error('[NEON] WebGL could not start.', error)
      canvas.closest('.scene')?.classList.add('is-failed')
      return undefined
    }

    return () => {
      experience.dispose()
      experienceRef.current = null
    }
  }, [])

  useEffect(() => {
    if (ready) experienceRef.current?.playIntro()
  }, [ready])

  return (
    <div className="scene" aria-hidden="true">
      <canvas ref={canvasRef} className="scene__canvas" />
      <div className="scene__fallback">
        <span />
      </div>
    </div>
  )
}
