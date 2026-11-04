import { useEffect, useRef } from 'react'
import { CHAPTERS, CHAPTER_COUNT, motionState } from '../lib/motionState'

export default function ProgressRail() {
  const rootRef = useRef(null)
  const fillRef = useRef(null)
  const valueRef = useRef(null)
  const labelRef = useRef(null)
  const ticksRef = useRef([])

  useEffect(() => {
    const tickState = { active: -1, frame: 0 }
    const render = () => {
      const progress = motionState.progress
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${progress})`
      if (valueRef.current) valueRef.current.textContent = String(Math.round(progress * 100)).padStart(2, '0')
      const active = motionState.activeChapter
      if (active !== tickState.active) {
        ticksRef.current.forEach((tick, index) => {
          tick?.classList.toggle('is-active', index === active)
          tick?.classList.toggle('is-past', index < active)
        })
        if (labelRef.current) labelRef.current.textContent = CHAPTERS[active]?.label ?? ''
        tickState.active = active
      }
      tickState.frame = requestAnimationFrame(render)
    }
    tickState.frame = requestAnimationFrame(render)
    return () => cancelAnimationFrame(tickState.frame)
  }, [])

  return (
    <aside className="rail" ref={rootRef} aria-hidden="true">
      <span className="rail__counter">
        <span ref={valueRef}>00</span>
        <span>/ {String(CHAPTER_COUNT).padStart(2, '0')}</span>
      </span>
      <div className="rail__ticks">
        {CHAPTERS.map((chapter, index) => (
          <span
            className="rail__tick"
            key={chapter.id}
            ref={(node) => {
              ticksRef.current[index] = node
            }}
          >
            <i />
            <span className="rail__tick-index">{chapter.index}</span>
          </span>
        ))}
        <span className="rail__track">
          <span className="rail__fill" ref={fillRef} />
        </span>
      </div>
      <span className="rail__label" ref={labelRef}>
        THE ARRIVAL
      </span>
    </aside>
  )
}
