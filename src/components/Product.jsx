import { Line } from './ui/Type'
import TiltCard from './ui/TiltCard'

const products = [
  {
    index: '01',
    tag: 'COGNITION',
    title: 'AI',
    body: 'An intelligence that lives in the room with you. On-device, ambient, and quietly aware.',
    footer: 'NEURAL PRESENCE',
    glyph: 'ai',
  },
  {
    index: '02',
    tag: 'PRESENCE',
    title: 'SPATIAL',
    body: 'Depth becomes an input. NEON maps the space between you and everything else.',
    footer: 'SURFACE-FREE',
    glyph: 'spatial',
  },
  {
    index: '03',
    tag: 'AGENCY',
    title: 'AUTONOMOUS',
    body: 'A quiet agent that acts before you ask. It updates itself. It evolves with you.',
    footer: 'SELF-DIRECTED',
    glyph: 'auto',
  },
]

function Glyph({ type }) {
  if (type === 'ai') {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="5" />
        <ellipse cx="32" cy="32" rx="25" ry="11" transform="rotate(28 32 32)" />
        <ellipse cx="32" cy="32" rx="25" ry="11" transform="rotate(-28 32 32)" />
        <circle cx="51" cy="18" r="2.5" className="fill" />
      </svg>
    )
  }
  if (type === 'spatial') {
    return (
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M32 6 56 20v24L32 58 8 44V20Z" />
        <path d="m8 20 24 14 24-14M32 34v24" />
        <circle cx="32" cy="34" r="3.5" className="fill" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="24" strokeDasharray="3 5" />
      <path d="M18 38c8-15 17-18 28-12" />
      <path d="m38 17 9 9-12 2" />
      <circle cx="22" cy="43" r="2.5" className="fill" />
    </svg>
  )
}

export default function Product() {
  return (
    <section id="product" className="chapter product" data-chapter="5" aria-labelledby="product-title">
      <div className="chapter__inner product__inner">
        <div className="product__header">
          <p className="eyebrow">
            <span className="live-dot live-dot--cyan" />
            06 / THE OBJECT
          </p>
          <p className="micro product__header-right">
            REASSEMBLING
            <br />
            <span>ONE OBJECT / INFINITE CONTEXTS</span>
          </p>
        </div>

        <h2 className="product__title display" id="product-title">
          <Line>ONE OBJECT.</Line>
          <Line>
            <span className="display-outline">INFINITE STATES.</span>
          </Line>
        </h2>

        <div className="product__cards">
          {products.map((product) => (
            <TiltCard className="product-card" key={product.title} data-cursor="HOLD">
              <div className="product-card__top">
                <span className="micro">{product.index}</span>
                <span className="product-card__dot" />
                <span className="micro micro--dim">{product.tag}</span>
              </div>
              <div className="product-card__glyph">
                <Glyph type={product.glyph} />
              </div>
              <h3>{product.title}</h3>
              <p>{product.body}</p>
              <div className="product-card__foot">
                <span className="micro">{product.footer}</span>
                <span className="product-card__arrow" aria-hidden="true">
                  ↗
                </span>
              </div>
              <span className="product-card__glow" aria-hidden="true" />
            </TiltCard>
          ))}
        </div>

        <div className="product__status">
          <span className="micro">FORM / RECONSTRUCTED</span>
          <span className="product__status-bar">
            <i />
          </span>
          <span className="micro">100%</span>
        </div>

        <div className="product__specs micro">
          <span>WEIGHT 148G</span>
          <span>SHELL: LIQUID-TITANIUM</span>
          <span>CORE: NEURAL-SILICON</span>
          <span>COLOR: ALL OF THEM</span>
        </div>

        <span className="tech-corner tech-corner--tl" aria-hidden="true" />
        <span className="tech-corner tech-corner--br" aria-hidden="true" />
      </div>
    </section>
  )
}
