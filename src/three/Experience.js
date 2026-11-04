import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { damp, lerp, motionState, smoothstep, windowFade } from '../lib/motionState'
import CameraRig from '../animations/cameraAnimation'
import NeonDevice from './NeonDevice'
import DeviceLabels from './DeviceLabels'
import NeuralNetwork from './NeuralNetwork'
import SpatialPanels from './SpatialPanels'
import ColorWorld from './ColorWorld'
import ParticleField from './ParticleField'
import PostProcessing from './PostProcessing'
import { createMaterials } from './Materials'

const dustLevels = [0.22, 0.18, 0.14, 0.24, 0.6, 0.18, 0.24]

const sampleLevels = (stage, levels) => {
  const index = Math.min(levels.length - 1, Math.max(0, Math.floor(stage)))
  const next = Math.min(levels.length - 1, index + 1)
  const t = smoothstep(0.05, 0.95, stage - index)
  return lerp(levels[index], levels[next], t)
}

/**
 * Owns the WebGL side of NEON. React never touches Three objects; it mounts the
 * canvas and calls playIntro once the preloader lifts.
 */
export default class Experience {
  constructor(canvas) {
    this.canvas = canvas
    this.mobile = window.matchMedia('(max-width: 820px)').matches
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.captureMode = new URLSearchParams(window.location.search).has('capture')
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.pixelRatio = this.getTargetPixelRatio()
    this.introStart = null
    this.intro = 0
    this.elapsed = 0
    this.mouse = new THREE.Vector2()
    this.lastStage = -1
    this.visual = {
      deviceVisibility: 1,
      explode: 0,
      colorMix: 0,
      backgroundMix: 0.1,
      neuralVisibility: 0,
      neuralMorph: 0,
      panelVisibility: 0,
      labels: 0,
      dust: 0.34,
      deviceScale: 1,
    }

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
      stencil: false,
    })
    this.renderer.setPixelRatio(this.pixelRatio)
    this.renderer.setSize(this.width, this.height, false)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 0.92
    this.renderer.setClearColor(0x050506, 1)
    if ('transmissionResolutionScale' in this.renderer) {
      this.renderer.transmissionResolutionScale = this.mobile ? 0.35 : 0.5
    }

    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.FogExp2(0x050506, 0.009)
    this.camera = new THREE.PerspectiveCamera(46, this.width / this.height, 0.08, 220)

    this.setupEnvironment()
    this.setupLights()

    this.materials = createMaterials({ mobile: this.mobile, capture: this.captureMode })
    this.colorWorld = new ColorWorld(this.scene, { mobile: this.mobile, capture: this.captureMode })
    this.particleField = new ParticleField(this.scene, { mobile: this.mobile, capture: this.captureMode })
    this.device = new NeonDevice(this.scene, this.materials, { mobile: this.mobile })
    this.labels = new DeviceLabels(this.scene, this.device, { mobile: this.mobile })
    this.neural = new NeuralNetwork(this.scene, { mobile: this.mobile, capture: this.captureMode })
    this.panels = new SpatialPanels(this.scene, {
      mobile: this.mobile,
      capture: this.captureMode,
      materials: this.materials,
    })

    this.cameraRig = new CameraRig(this.camera, { mobile: this.mobile, reduced: this.reduced })
    this.post = new PostProcessing(this.renderer, this.scene, this.camera, { mobile: this.mobile })

    if (import.meta.env.DEV) window.__NEON__ = this

    this.startTime = performance.now() / 1000
    this.previousTime = this.startTime
    this.tick = this.tick.bind(this)
    this.onResize = this.onResize.bind(this)
    window.addEventListener('resize', this.onResize)
    window.addEventListener('orientationchange', this.onResize)
    this.resize()

    // Put the camera at its opening mark for the very first frame.
    this.cameraRig.update(0, 0, 1 / 60, { x: 0, y: 0 })
    this.renderer.setAnimationLoop(this.tick)
  }

  setupEnvironment() {
    this.pmrem = new THREE.PMREMGenerator(this.renderer)
    this.pmrem.compileEquirectangularShader()
    this.environmentScene = new RoomEnvironment()
    this.envTexture = this.pmrem.fromScene(this.environmentScene, 0.04).texture
    this.scene.environment = this.envTexture
    this.scene.environmentIntensity = 0.72
    this.environmentScene.dispose?.()
    this.pmrem.dispose()
  }

  setupLights() {
    this.ambient = new THREE.AmbientLight(0x22345c, 0.65)
    this.scene.add(this.ambient)

    this.hemisphere = new THREE.HemisphereLight(0x3d5bff, 0x030305, 0.7)
    this.scene.add(this.hemisphere)

    this.keyLight = new THREE.DirectionalLight(0xe8f4ff, 2.2)
    this.keyLight.position.set(5, 7, 8)
    this.scene.add(this.keyLight)

    this.rimLight = new THREE.DirectionalLight(0xff2fb9, 1.1)
    this.rimLight.position.set(-6, -2, -5)
    this.scene.add(this.rimLight)

    this.fillLight = new THREE.DirectionalLight(0x22f0ff, 0.6)
    this.fillLight.position.set(2, -5, 4)
    this.scene.add(this.fillLight)
  }

  getTargetPixelRatio() {
    const dpr = window.devicePixelRatio || 1
    if (this.captureMode) return Math.min(dpr, 1)
    return Math.min(dpr, this.mobile ? 1.35 : 1.5)
  }

  playIntro() {
    if (this.introStart !== null) return
    this.introStart = performance.now() / 1000 - this.startTime
  }

  onResize() {
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.mobile = window.matchMedia('(max-width: 820px)').matches
    this.pixelRatio = this.getTargetPixelRatio()
    this.renderer.setPixelRatio(this.pixelRatio)
    this.renderer.setSize(this.width, this.height, false)
    this.camera.aspect = this.width / this.height
    this.camera.updateProjectionMatrix()
    this.cameraRig.resize(this.width, this.height)
    this.post.resize(this.width, this.height, this.pixelRatio)
    this.neural.setViewport(this.width, this.height, this.pixelRatio)
    this.colorWorld.setViewport(this.width, this.height, this.pixelRatio)
    this.particleField.setViewport(this.width, this.height, this.pixelRatio)
  }

  resize() {
    this.onResize()
  }

  updateVisualState(stage) {
    const visual = this.visual

    // Device presence.
    if (stage < 2.02) visual.deviceVisibility = 1
    else if (stage < 2.42) visual.deviceVisibility = 1 - smoothstep(2.02, 2.42, stage)
    else if (stage < 3.94) visual.deviceVisibility = 0
    else if (stage < 4.24) visual.deviceVisibility = smoothstep(3.94, 4.24, stage)
    else visual.deviceVisibility = 1

    if (stage < 2) visual.deviceScale = 1
    else if (stage < 3.94) visual.deviceScale = 0.94
    else if (stage < 4.24) visual.deviceScale = lerp(0.94, 1.04, smoothstep(3.94, 4.24, stage))
    else if (stage < 5.0) visual.deviceScale = 1.04
    else if (stage < 5.35) visual.deviceScale = lerp(1.04, 0.84, smoothstep(5.0, 5.35, stage))
    else if (stage < 6.0) visual.deviceScale = 0.84
    else visual.deviceScale = lerp(0.84, 0.92, smoothstep(6.0, 6.35, stage))

    // Exploded engineering view.
    if (stage < 1.06) visual.explode = 0
    else if (stage < 1.74) visual.explode = smoothstep(1.06, 1.74, stage)
    else if (stage < 5.0) visual.explode = 1
    else if (stage < 5.34) visual.explode = 1 - smoothstep(5.0, 5.34, stage)
    else visual.explode = 0

    if (stage > 4.02 && stage < 4.9) {
      visual.explode = Math.min(1.1, visual.explode + Math.sin(stage * 8.4) * 0.035)
    }

    // Chroma choreography.
    visual.colorMix = smoothstep(3.96, 4.2, stage) * (1 - smoothstep(4.82, 5.02, stage))
    visual.backgroundMix =
      0.07 +
      visual.colorMix * 0.95 +
      windowFade(stage, 1.7, 2.4, 2.9, 3.5) * 0.16 +
      windowFade(stage, 0.8, 1.5, 1.8, 2.4) * 0.08

    // Neural field.
    visual.neuralVisibility = windowFade(stage, 1.94, 2.28, 2.98, 3.22)
    visual.neuralMorph = smoothstep(1.98, 2.46, stage)
    const neuralExpand =
      0.78 + smoothstep(2.05, 2.5, stage) * 0.26 + Math.sin(stage * 3.2) * 0.025
    visual.neuralExpand = neuralExpand

    // Spatial corridor.
    visual.panelVisibility = windowFade(stage, 3.12, 3.32, 3.88, 3.99)

    // Annotations only during the deconstruction chapter.
    visual.labels = windowFade(stage, 1.08, 1.32, 1.82, 1.97) * (this.mobile ? 0 : 1)

    visual.dust = sampleLevels(stage, dustLevels) + visual.colorMix * 0.16
    // The final frame lets the particles dissolve away.
    visual.dust *= 1 - smoothstep(6.05, 6.95, stage) * 0.84
  }

  tick() {
    const now = performance.now() / 1000
    const dt = Math.min(now - this.previousTime, 0.05)
    this.previousTime = now
    const time = now - this.startTime
    this.elapsed = time

    if (this.introStart !== null) {
      const duration = this.reduced ? 0.6 : 2.15
      this.intro = Math.min(1, (time - this.introStart) / duration)
    }

    const stage = motionState.stage
    this.updateVisualState(stage)
    const visual = this.visual

    this.mouse.x = damp(this.mouse.x, motionState.mouse.tx, 4.2, dt)
    this.mouse.y = damp(this.mouse.y, motionState.mouse.ty, 4.2, dt)

    this.cameraRig.update(
      stage,
      time,
      dt,
      { x: this.mouse.x, y: this.mouse.y },
      Math.min(1, motionState.velocity / 60),
    )

    this.ambient.intensity = 0.3 + this.intro * 0.45
    this.hemisphere.intensity = 0.22 + this.intro * 0.55
    this.keyLight.intensity = 0.4 + this.intro * 1.85 + visual.colorMix * 1.0
    this.rimLight.intensity = 0.2 + this.intro * 0.95 + visual.colorMix * 1.2
    this.fillLight.intensity = 0.1 + this.intro * 0.55 + visual.colorMix * 0.5

    this.device.update({
      time,
      intro: this.intro,
      explode: visual.explode,
      colorMix: visual.colorMix,
      visibility: visual.deviceVisibility,
      scale: visual.deviceScale,
      mouse: { x: this.mouse.x, y: this.mouse.y },
      camera: this.camera,
      stage,
    })

    this.labels.update(this.camera, visual.labels * Math.min(1, this.intro * 1.6), time)

    this.neural.update({
      visibility: visual.neuralVisibility,
      morph: visual.neuralMorph,
      time,
      mouse: { x: this.mouse.x, y: this.mouse.y },
      expand: visual.neuralExpand,
      opacityBoost: 1,
    })

    this.panels.update({
      opacity: visual.panelVisibility,
      time,
      camera: this.camera,
    })

    this.colorWorld.update({
      backgroundMix: visual.backgroundMix,
      chroma: visual.colorMix,
      time,
      mouse: { x: this.mouse.x, y: this.mouse.y },
      velocity: Math.min(1, motionState.velocity / 60),
    })

    this.particleField.update({
      time,
      opacity: visual.dust * (0.25 + this.intro * 0.75),
      mouse: { x: this.mouse.x, y: this.mouse.y },
      velocity: Math.min(1, motionState.velocity / 60),
    })

    this.post.update({
      time,
      velocity: Math.min(1, motionState.velocity / 60),
      colorMix: Math.max(visual.colorMix, visual.backgroundMix * 0.3),
    })

    this.renderer.setClearColor(0x050506, 1)
    this.post.render()
  }

  dispose() {
    this.renderer.setAnimationLoop(null)
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('orientationchange', this.onResize)

    this.labels.dispose()
    this.device.dispose()
    this.neural.dispose()
    this.panels.dispose()
    this.colorWorld.dispose()
    this.particleField.dispose()
    this.post.dispose()

    this.scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose()
      if (object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        materials.forEach((material) => {
          Object.values(material).forEach((value) => {
            if (value && value.isTexture) value.dispose()
          })
          material.dispose()
        })
      }
    })
    this.scene.clear()
    this.envTexture?.dispose()
    this.renderer.dispose()
  }
}
