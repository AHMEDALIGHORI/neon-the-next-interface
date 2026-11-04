/* eslint-disable no-unused-expressions */
async page => {
  const OUT = 'C:/Users/user/Downloads/earbuds/recordings/neon-cinematic-16x9.webm'
  const wait = (ms) => page.waitForTimeout(ms)

  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.goto('about:blank')
  await page.evaluate(() => {
    document.documentElement.style.background = '#040405'
    document.body.style.background = '#040405'
  })
  await wait(250)

  await page.screencast.start({
    path: OUT,
    size: { width: 1920, height: 1080 },
    fps: 30,
  })

  await page.goto('http://127.0.0.1:5173/?capture=1', { waitUntil: 'domcontentloaded' })
  await page.addStyleTag({
    content: `
      html { scrollbar-width: none !important; }
      html::-webkit-scrollbar { display: none !important; }
      .cursor { display: none !important; }
    `,
  })
  await page.waitForFunction(() => document.body.classList.contains('is-ready'), null, { timeout: 30000 })
  await wait(1950)

  const scrollTo = async (stage, duration, pause = 0) => {
    await page.evaluate(
      ({ stage, duration }) => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        window.__lenis?.scrollTo(max * (stage / 7), {
          duration,
          force: true,
          easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
        })
      },
      { stage, duration },
    )
    await wait(Math.round(duration * 1000) + 140)
    if (pause) await wait(pause)
  }

  // Opening hero → deconstruction
  await scrollTo(0.72, 2.0, 200)
  await scrollTo(1.12, 1.5, 220)
  await scrollTo(1.55, 1.8, 900)

  // Neural field
  await scrollTo(1.95, 1.4, 200)
  await scrollTo(2.22, 1.2, 900)
  await scrollTo(2.62, 1.8, 1000)

  // Spatial corridor
  await scrollTo(3.05, 1.4, 300)
  await scrollTo(3.45, 1.8, 700)
  await scrollTo(3.85, 1.4, 200)

  // Chroma explosion
  await scrollTo(4.15, 1.2, 400)
  await scrollTo(4.45, 1.3, 800)
  await scrollTo(4.78, 1.4, 400)

  // Object reconstruction
  await scrollTo(5.08, 1.2, 300)
  await scrollTo(5.42, 1.6, 1000)
  await scrollTo(5.85, 1.2, 200)

  // Final frame
  await scrollTo(6.15, 1.3, 600)
  await scrollTo(6.78, 2.4, 1000)

  // Cinematic fade out.
  await page.evaluate(() => {
    const overlay = document.createElement('div')
    overlay.style.cssText =
      'position:fixed;inset:0;background:#050506;z-index:99999;opacity:0;transition:opacity 1.2s ease;pointer-events:none;'
    document.body.appendChild(overlay)
    requestAnimationFrame(() => requestAnimationFrame(() => { overlay.style.opacity = '1' }))
  })
  await wait(1400)

  await page.screencast.stop()
  return { saved: OUT }
}
