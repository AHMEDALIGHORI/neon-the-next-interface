import { Line } from './ui/Type'

export default function Intelligence() {
  return (
    <section
      id="intelligence"
      className="chapter intelligence"
      data-chapter="2"
      aria-labelledby="intel-title"
    >
      <div className="chapter__inner intelligence__inner">
        <div className="intelligence__header">
          <p className="eyebrow">
            <span className="live-dot live-dot--violet" />
            03 / INTELLIGENCE
          </p>
          <div className="intelligence__stats">
            <div>
              <span className="intelligence__stat-value">4.8M</span>
              <span className="micro">NEURAL NODES</span>
            </div>
            <div>
              <span className="intelligence__stat-value">0.7ms</span>
              <span className="micro">INTENT LATENCY</span>
            </div>
            <div>
              <span className="intelligence__stat-value">∞</span>
              <span className="micro">CONTEXT DEPTH</span>
            </div>
          </div>
        </div>

        <div className="intelligence__ghost" aria-hidden="true">
          ANTICIPATION
        </div>

        <h2 className="intelligence__headline intelligence__headline--one display" id="intel-title">
          <Line>IT DOESN'T</Line>
          <Line>
            WAIT <span className="display-outline">FOR YOU.</span>
          </Line>
        </h2>

        <h2 className="intelligence__headline intelligence__headline--two display" aria-hidden="true">
          <Line>IT</Line>
          <Line>
            <span className="gradient-text">ANTICIPATES.</span>
          </Line>
        </h2>

        <div className="intelligence__side-note">
          <span className="micro">NEURAL FIELD / 003</span>
          <p>
            A living model of your context. It learns the rhythm of a room, the weight of a pause,
            the edge of a thought — then meets you there.
          </p>
          <span className="intelligence__side-line" aria-hidden="true" />
          <span className="micro micro--dim">PREDICTIVE / PRIVATE / PRESENT</span>
        </div>

        <div className="intelligence__sync">
          <span className="micro">MIND / SYNC</span>
          <span className="intelligence__sync-bar">
            <i />
          </span>
          <span className="micro">98.4%</span>
        </div>

        <p className="intelligence__quote micro">THE INTERFACE IS NO LONGER A PLACE YOU GO.</p>

        <span className="tech-corner tech-corner--tl" aria-hidden="true" />
        <span className="tech-corner tech-corner--br" aria-hidden="true" />
      </div>
    </section>
  )
}
