/**
 * Optional, user-initiated sound design.
 *
 * The experience is silent by default. When the visitor enables audio we
 * synthesize every cue with the Web Audio API — no external audio assets.
 * Any future sample-based soundscape can subscribe to the same cue bus.
 */

const listeners = new Set()

export const CUE = {
  SECTION: 'section',
  EXPLODE: 'explode',
  NEURAL: 'neural',
  UI: 'ui',
  COLOR: 'color',
  RECONSTRUCT: 'reconstruct',
  FINAL: 'final',
}

class SoundEngine {
  constructor() {
    this.enabled = false
    this.context = null
    this.master = null
    this.delay = null
    this.noiseBuffer = null
    this.lastCue = 0
  }

  subscribe(listener) {
    listeners.add(listener)
    listener(this.enabled)
    return () => listeners.delete(listener)
  }

  emit() {
    listeners.forEach((listener) => listener(this.enabled))
  }

  async enable() {
    if (this.enabled) return true
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) return false
      this.context ??= new AudioContext()
      if (this.context.state === 'suspended') await this.context.resume()

      if (!this.master) {
        const compressor = this.context.createDynamicsCompressor()
        compressor.threshold.value = -22
        compressor.ratio.value = 8
        compressor.connect(this.context.destination)

        this.master = this.context.createGain()
        this.master.gain.value = 0.16
        this.master.connect(compressor)

        this.delay = this.context.createDelay(1)
        this.delay.delayTime.value = 0.23
        const feedback = this.context.createGain()
        feedback.gain.value = 0.26
        const wet = this.context.createGain()
        wet.gain.value = 0.2
        this.delay.connect(feedback)
        feedback.connect(this.delay)
        this.delay.connect(wet)
        wet.connect(this.master)
        this.delayWet = wet

        const seconds = 1.4
        this.noiseBuffer = this.context.createBuffer(
          1,
          Math.floor(this.context.sampleRate * seconds),
          this.context.sampleRate,
        )
        const data = this.noiseBuffer.getChannelData(0)
        for (let i = 0; i < data.length; i += 1) {
          data[i] = Math.random() * 2 - 1
        }
      }

      this.enabled = true
      this.emit()
      this.play(CUE.UI, { force: true })
      return true
    } catch {
      return false
    }
  }

  disable() {
    this.enabled = false
    if (this.context?.state === 'running') {
      this.context.suspend().catch(() => {})
    }
    this.emit()
  }

  async toggle() {
    if (this.enabled) {
      this.disable()
      return false
    }
    return this.enable()
  }

  connectDelay(node, amount = 0.25) {
    const send = this.context.createGain()
    send.gain.value = amount
    node.connect(send)
    send.connect(this.delay)
  }

  tone({ frequency = 440, endFrequency, duration = 0.5, type = 'sine', gain = 0.15, delay = 0, pan = 0 }) {
    if (!this.context || !this.master) return
    const t0 = this.context.currentTime + delay
    const osc = this.context.createOscillator()
    const amp = this.context.createGain()
    const panner = this.context.createStereoPanner?.()
    osc.type = type
    osc.frequency.setValueAtTime(frequency, t0)
    if (endFrequency) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), t0 + duration)
    }
    amp.gain.setValueAtTime(0.0001, t0)
    amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.012)
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
    if (panner) {
      panner.pan.value = pan
      osc.connect(amp).connect(panner)
      panner.connect(this.master)
      this.connectDelay(panner, 0.18)
    } else {
      osc.connect(amp).connect(this.master)
      this.connectDelay(amp, 0.18)
    }
    osc.start(t0)
    osc.stop(t0 + duration + 0.05)
  }

  noise({ duration = 0.8, gain = 0.08, frequency = 900, endFrequency = 180, delay = 0, type = 'lowpass' }) {
    if (!this.context || !this.noiseBuffer) return
    const t0 = this.context.currentTime + delay
    const source = this.context.createBufferSource()
    const filter = this.context.createBiquadFilter()
    const amp = this.context.createGain()
    source.buffer = this.noiseBuffer
    filter.type = type
    filter.frequency.setValueAtTime(frequency, t0)
    filter.frequency.exponentialRampToValueAtTime(Math.max(40, endFrequency), t0 + duration)
    amp.gain.setValueAtTime(0.0001, t0)
    amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.04)
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
    source.connect(filter).connect(amp).connect(this.master)
    this.connectDelay(amp, 0.2)
    source.start(t0)
    source.stop(t0 + duration + 0.05)
  }

  play(name, detail = {}) {
    if (!this.enabled || !this.context) return
    const now = performance.now()
    if (!detail.force && now - this.lastCue < 90) return
    this.lastCue = now

    switch (name) {
      case CUE.SECTION:
        this.tone({ frequency: 174 + (detail.index ?? 0) * 23, endFrequency: 230, duration: 0.6, gain: 0.06, type: 'sine', pan: -0.25 })
        this.tone({ frequency: 349, duration: 0.9, gain: 0.035, type: 'triangle', pan: 0.3, delay: 0.08 })
        break
      case CUE.EXPLODE:
        this.noise({ duration: 0.9, gain: 0.12, frequency: 1600, endFrequency: 120 })
        this.tone({ frequency: 88, endFrequency: 42, duration: 1.1, gain: 0.16, type: 'sine' })
        this.tone({ frequency: 660, endFrequency: 330, duration: 0.45, gain: 0.05, type: 'triangle', delay: 0.06 })
        break
      case CUE.NEURAL:
        this.tone({ frequency: 523.25, duration: 1.8, gain: 0.035, type: 'sine', pan: -0.4 })
        this.tone({ frequency: 783.99, duration: 2.1, gain: 0.025, type: 'triangle', pan: 0.35, delay: 0.1 })
        this.noise({ duration: 1.6, gain: 0.025, frequency: 5000, endFrequency: 1200, type: 'highpass' })
        break
      case CUE.UI:
        this.tone({ frequency: 880, endFrequency: 1320, duration: 0.14, gain: 0.045, type: 'square' })
        break
      case CUE.COLOR:
        ;[261.63, 329.63, 392, 523.25, 659.25].forEach((freq, index) => {
          this.tone({ frequency: freq, duration: 1.5, gain: 0.03, type: 'sine', delay: index * 0.055, pan: (index - 2) * 0.2 })
        })
        this.noise({ duration: 1.4, gain: 0.05, frequency: 900, endFrequency: 7000, type: 'bandpass' })
        break
      case CUE.RECONSTRUCT:
        this.tone({ frequency: 120, endFrequency: 880, duration: 1.2, gain: 0.06, type: 'sawtooth' })
        this.tone({ frequency: 240, endFrequency: 1760, duration: 1.3, gain: 0.025, type: 'sine' })
        break
      case CUE.FINAL:
        ;[130.81, 196, 261.63, 392].forEach((freq, index) => {
          this.tone({ frequency: freq, duration: 2.6, gain: 0.035, type: index === 0 ? 'sine' : 'triangle', delay: index * 0.06 })
        })
        break
      default:
        break
    }
  }
}

export const soundEngine = new SoundEngine()

/**
 * Fire a synchronous cue on the global bus. Sound is one subscriber; visual
 * effects, analytics or future haptics can listen in without touching the
 * choreography.
 */
export function cue(name, detail = {}) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('neon:cue', { detail: { name, ...detail } }))
  }
  soundEngine.play(name, detail)
}
