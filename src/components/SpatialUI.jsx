import { Line, Marquee } from './ui/Type'

export default function SpatialUI() {
  return (
    <section id="spatial" className="chapter spatial" data-chapter="3" aria-labelledby="spatial-title">
      <div className="chapter__inner spatial__inner">
        <div className="spatial__header">
          <p className="eyebrow">
            <span className="live-dot live-dot--blue" />
            04 / SPATIAL UI
          </p>
          <p className="micro spatial__header-right">
            SURFACE-FREE COMPUTING
            <br />
            <span>NO SCREEN. NO EDGES. NO LIMITS.</span>
          </p>
        </div>

        <h2 className="spatial__title display" id="spatial-title">
          <Line>BEYOND</Line>
          <Line>
            THE <span className="display-outline">SCREEN.</span>
          </Line>
        </h2>

        <div className="spatial__reticle" aria-hidden="true">
          <span className="spatial__reticle-circle" />
          <span className="spatial__reticle-circle spatial__reticle-circle--inner" />
          <span className="spatial__reticle-cross spatial__reticle-cross--h" />
          <span className="spatial__reticle-cross spatial__reticle-cross--v" />
          <span className="spatial__reticle-dot" />
          <span className="spatial__reticle-text micro">TRACKING / LOCKED</span>
        </div>

        <div className="spatial__labels">
          <div className="spatial__label spatial__label--vision">
            <span className="micro micro--dim">FIELD 01</span>
            <span className="spatial__label-title">VISION</span>
            <span className="spatial__label-meta">OPTICAL CONTEXT / LIVE</span>
          </div>
          <div className="spatial__label spatial__label--voice">
            <span className="micro micro--dim">FIELD 02</span>
            <span className="spatial__label-title">VOICE</span>
            <span className="spatial__label-meta">INTENT CAPTURE / LIVE</span>
          </div>
          <div className="spatial__label spatial__label--memory">
            <span className="micro micro--dim">FIELD 03</span>
            <span className="spatial__label-title">MEMORY</span>
            <span className="spatial__label-meta">CONTEXT STORE / SYNCED</span>
          </div>
          <div className="spatial__label spatial__label--automation">
            <span className="micro micro--dim">FIELD 04</span>
            <span className="spatial__label-title">AUTOMATION</span>
            <span className="spatial__label-meta">AGENT LAYER / PRIMED</span>
          </div>
        </div>

        <div className="spatial__bottom">
          <div className="spatial__strip">
            <Marquee text="CONTEXT / VISION / VOICE / MEMORY / AUTOMATION / PRESENCE / DEPTH / INTENT" reverse />
          </div>
          <div className="spatial__bottom-row">
            <p className="micro">SCROLL TO TRAVERSE THE FIELD</p>
            <p className="micro micro--dim">FRAME 04 / 07</p>
          </div>
        </div>

        <span className="spatial__frame" aria-hidden="true" />
        <span className="tech-corner tech-corner--tl" aria-hidden="true" />
        <span className="tech-corner tech-corner--tr" aria-hidden="true" />
        <span className="tech-corner tech-corner--bl" aria-hidden="true" />
        <span className="tech-corner tech-corner--br" aria-hidden="true" />
      </div>
    </section>
  )
}
