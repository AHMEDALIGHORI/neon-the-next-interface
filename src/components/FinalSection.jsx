import { Line } from './ui/Type'
import Magnetic from './ui/Magnetic'
import { CUE, cue } from '../lib/audio'

export default function FinalSection() {
  const enter = () => {
    cue(CUE.UI)
    window.__lenis?.scrollTo(0, { duration: 2.4, easing: (t) => 1 - Math.pow(1 - t, 5) })
  }

  return (
    <section id="final" className="chapter final" data-chapter="6" aria-labelledby="final-title">
      <div className="chapter__inner final__inner">
        <div className="final__header">
          <p className="eyebrow">
            <span className="live-dot" />
            07 / FINAL FRAME
          </p>
          <p className="micro final__header-right">A FICTIONAL PRODUCT / AN HONEST FEELING</p>
        </div>

        <h2 className="final__title display" id="final-title">
          <Line>THE FUTURE</Line>
          <Line>IS ALREADY</Line>
          <Line>
            <span className="gradient-text">INTERACTIVE.</span>
          </Line>
        </h2>

        <div className="final__center">
          <p className="final__edition">NEON — 2026</p>
          <Magnetic
            as="button"
            className="final__cta"
            strength={0.4}
            onClick={enter}
            data-cursor="ENTER"
            aria-label="Enter the interface — return to the beginning"
          >
            <span className="final__cta-label">ENTER THE INTERFACE</span>
            <span className="final__cta-arrow" aria-hidden="true">
              →
            </span>
            <span className="final__cta-glow" aria-hidden="true" />
          </Magnetic>
          <p className="final__cta-note micro">NO SCREEN REQUIRED / A NEW SENSE OF COMPUTING</p>
        </div>

        <footer className="footer">
          <div className="footer__brand">
            <span className="brand__mark" aria-hidden="true">
              <span />
            </span>
            <span>
              NEON<sup>®</sup>
            </span>
          </div>
          <p className="footer__line micro">
            TECHNOLOGY SHOULD FEEL ALIVE.
            <span>© 2026 NEON SYSTEMS. A SPECULATIVE INTERFACE.</span>
          </p>
          <div className="footer__meta micro">
            <span>SPATIAL / AI / 2026</span>
            <span>EARTH — NEAR FUTURE</span>
            <span>MADE TO BE FELT</span>
          </div>
        </footer>

        <span className="final__ver micro" aria-hidden="true">
          DESIGNED &amp; ENGINEERED IN THE NEAR FUTURE
        </span>
      </div>
    </section>
  )
}
