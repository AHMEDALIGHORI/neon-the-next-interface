import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motionState } from './lib/motionState'
import { initExperienceScroll } from './animations/scrollSetup'
import Scene from './components/Scene'
import Preloader from './components/Preloader'
import Navigation from './components/Navigation'
import CustomCursor from './components/CustomCursor'
import ProgressRail from './components/ProgressRail'
import Hero from './components/Hero'
import AICore from './components/AICore'
import Intelligence from './components/Intelligence'
import SpatialUI from './components/SpatialUI'
import ColorExplosion from './components/ColorExplosion'
import Product from './components/Product'
import FinalSection from './components/FinalSection'

export default function App() {
  const stageRef = useRef(null)
  const trackRef = useRef(null)
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    const cleanup = initExperienceScroll({
      track: trackRef.current,
      stage: stageRef.current,
    })
    return cleanup
  }, [])

  useEffect(() => {
    motionState.ready = ready
    if (!ready) return
    document.body.classList.remove('is-loading')
    document.body.classList.add('is-ready')
    window.__lenis?.start()
    window.scrollTo(0, 0)
  }, [ready])

  const onLoaded = useCallback(() => {
    setReady(true)
  }, [])

  return (
    <div className="app">
      <Scene ready={ready} />
      <div className="atmosphere" aria-hidden="true">
        <span className="atmosphere__grain" />
        <span className="atmosphere__scanlines" />
        <span className="atmosphere__vignette" />
        <span className="atmosphere__chroma" />
        <span className="atmosphere__corners" />
      </div>

      <Navigation ready={ready} />

      <main className="stage" ref={stageRef}>
        <Hero ready={ready} />
        <AICore />
        <Intelligence />
        <SpatialUI />
        <ColorExplosion />
        <Product />
        <FinalSection />
      </main>

      <div className="scroll-track" ref={trackRef} aria-hidden="true" />
      <ProgressRail />
      <CustomCursor />
      <Preloader onComplete={onLoaded} />
    </div>
  )
}
