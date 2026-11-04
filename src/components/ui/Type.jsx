/**
 * Splitting primitives. The markup stays semantic — GSAP only sees nested
 * spans, so scroll timelines can reveal lines, words or characters.
 */

export function Line({ children, className = '', ...props }) {
  return (
    <span className={`line ${className}`} {...props}>
      <span className="line__in">{children}</span>
    </span>
  )
}

export function Words({ text, className = '' }) {
  return (
    <>
      {text.split(' ').map((word, index) => (
        <span className={`word ${className}`} key={`${word}-${index}`}>
          <span className="word__in">{word}</span>
          {index < text.split(' ').length - 1 ? ' ' : ''}
        </span>
      ))}
    </>
  )
}

export function Chars({ text, className = '', wordClassName = '' }) {
  const words = text.split(' ')
  return (
    <>
      {words.map((word, wordIndex) => (
        <span className={`char-word ${wordClassName}`} key={`${word}-${wordIndex}`}>
          {word.split('').map((char, charIndex) => (
            <span className={`char ${className}`} key={`${char}-${charIndex}`} aria-hidden="true">
              {char}
            </span>
          ))}
          {wordIndex < words.length - 1 ? <span className="char-space">&nbsp;</span> : null}
        </span>
      ))}
      <span className="sr-only">{text}</span>
    </>
  )
}

export function Marquee({ text, className = '', reverse = false }) {
  const content = `${text} — ${text} — ${text} — `
  return (
    <div className={`marquee ${className}`} aria-hidden="true">
      <div className={`marquee__track ${reverse ? 'marquee__track--reverse' : ''}`}>
        <span>{content}</span>
        <span>{content}</span>
      </div>
    </div>
  )
}
