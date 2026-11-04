import { Marquee } from './ui/Type'

const components = [
  { index: '01', name: 'CORE', meta: 'NEURAL SILICON / 4NM', detail: 'A thinking substrate.' },
  { index: '02', name: 'MEMORY', meta: 'CONTINUUM / 2TB', detail: 'Every moment, indexed.' },
  { index: '03', name: 'VISION', meta: 'SPATIAL FIELD / 180°', detail: 'It sees the room.' },
  { index: '04', name: 'VOICE', meta: 'MICRO ARRAY / 360°', detail: 'It hears the intent.' },
  { index: '05', name: 'MOTION', meta: 'HAPTIC MESH / 12K', detail: 'It answers with touch.' },
]

export default function AICore() {
  return (
    <section id="core" className="chapter core" data-chapter="1" aria-labelledby="core-title">
      <div className="chapter__inner core__inner">
        <div className="core__header">
          <p className="eyebrow">
            <span className="live-dot live-dot--orange" />
            02 / AI CORE
          </p>
          <p className="micro core__coords">
            ENGINEERING VISUALIZATION
            <br />
            <span>LAT 00.0000 / LON 00.0000 / DEPTH 002</span>
          </p>
        </div>

        <h2 className="core__title display" id="core-title">
          <span className="line">
            <span className="line__in">OPEN</span>
          </span>
          <span className="line core__title-outline">
            <span className="line__in">SYSTEM</span>
          </span>
        </h2>

        <div className="core__statement">
          <span className="core__statement-index">01</span>
          <div>
            <p className="core__statement-main">
              Five systems.
              <br />
              One nervous system.
            </p>
            <p className="core__statement-body">
              Every layer is a living sense. Unfold NEON and its architecture becomes the interface
              itself.
            </p>
          </div>
        </div>

        <div className="core__components">
          <div className="core__components-head">
            <span className="micro">DECONSTRUCTION</span>
            <span className="micro micro--dim">5 MODULES</span>
          </div>
          <ul>
            {components.map((component) => (
              <li key={component.name} className="core__component">
                <span className="core__component-index">{component.index}</span>
                <span className="core__component-name">{component.name}</span>
                <span className="core__component-meta">{component.meta}</span>
                <span className="core__component-detail">{component.detail}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="core__readout">
          <span className="micro">SYSTEM TENSION</span>
          <span className="core__readout-value">
            99.<span>8</span>%
          </span>
          <span className="core__readout-line" aria-hidden="true" />
          <span className="micro micro--dim">ALL SENSES ONLINE</span>
        </div>

        <div className="core__marquee">
          <Marquee text="CORE / MEMORY / VISION / VOICE / MOTION / EVERYTHING CONNECTED" />
        </div>

        <span className="tech-corner tech-corner--tl" aria-hidden="true" />
        <span className="tech-corner tech-corner--tr" aria-hidden="true" />
        <span className="tech-corner tech-corner--bl" aria-hidden="true" />
        <span className="tech-corner tech-corner--br" aria-hidden="true" />
      </div>
    </section>
  )
}
