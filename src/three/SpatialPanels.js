import * as THREE from 'three'
import { createDotTexture } from './Materials'

const PANELS = [
  {
    title: 'CONTEXT',
    code: 'FIELD / 01',
    meta: 'ROOM MODEL / LIVE',
    value: '1.4M',
    unit: 'CONTEXT POINTS',
    accent: '#a25cff',
    position: [0, 0.35, 11.0],
    size: [4.9, 2.8],
    type: 'map',
    phase: 0.2,
    speed: 0.32,
  },
  {
    title: 'VISION',
    code: 'FIELD / 02',
    meta: 'OPTICAL CONTEXT',
    value: '180°',
    unit: 'SPATIAL FOV',
    accent: '#22f0ff',
    position: [-4.35, 1.25, 9.35],
    size: [3.3, 2.05],
    type: 'reticle',
    phase: 1.1,
    speed: 0.4,
  },
  {
    title: 'VOICE',
    code: 'FIELD / 03',
    meta: 'INTENT CAPTURE',
    value: '0.7ms',
    unit: 'LATENCY',
    accent: '#ff2fb9',
    position: [4.3, -0.15, 8.55],
    size: [3.1, 1.95],
    type: 'wave',
    phase: 2.2,
    speed: 0.36,
  },
  {
    title: 'MEMORY',
    code: 'FIELD / 04',
    meta: 'CONTINUUM STORE',
    value: '2TB',
    unit: 'ON-DEVICE',
    accent: '#c8ff2e',
    position: [-3.4, -1.55, 7.1],
    size: [2.7, 1.7],
    type: 'grid',
    phase: 3.3,
    speed: 0.44,
  },
  {
    title: 'AUTOMATION',
    code: 'FIELD / 05',
    meta: 'AGENT LAYER',
    value: '24/7',
    unit: 'AUTONOMY',
    accent: '#ff6a1a',
    position: [3.5, 1.55, 5.9],
    size: [3.25, 2.05],
    type: 'bars',
    phase: 4.1,
    speed: 0.38,
  },
  {
    title: 'PRESENCE',
    code: 'FIELD / 06',
    meta: 'BODY AWARENESS',
    value: '6DOF',
    unit: 'TRACKED',
    accent: '#3d5bff',
    position: [1.25, -0.9, 4.1],
    size: [2.55, 1.6],
    type: 'orbit',
    phase: 5.2,
    speed: 0.46,
  },
  {
    title: 'DEPTH',
    code: 'FIELD / 07',
    meta: 'SURFACE-FREE UI',
    value: '∞',
    unit: 'LAYERS',
    accent: '#22f0ff',
    position: [-3.9, 0.85, 3.0],
    size: [3.5, 2.15],
    type: 'layers',
    phase: 6.3,
    speed: 0.34,
  },
  {
    title: 'SIGNAL',
    code: 'FIELD / 08',
    meta: 'NEURAL UPLINK',
    value: '99.8',
    unit: 'UPTIME %',
    accent: '#c8ff2e',
    position: [-1.75, -1.25, 1.3],
    size: [2.45, 1.55],
    type: 'wave',
    phase: 7.4,
    speed: 0.5,
  },
  {
    title: 'AURA',
    code: 'FIELD / 09',
    meta: 'EMOTIONAL LAYER',
    value: '7',
    unit: 'CHROMA BANDS',
    accent: '#ff2fb9',
    position: [3.8, 0.55, 0.2],
    size: [2.85, 1.8],
    type: 'orbit',
    phase: 8.5,
    speed: 0.42,
  },
  {
    title: 'NEURAL',
    code: 'FIELD / 10',
    meta: 'PREDICTIVE CORE',
    value: '4.8M',
    unit: 'NODES',
    accent: '#a25cff',
    position: [0.35, 0.9, -2.0],
    size: [4.25, 2.45],
    type: 'constellation',
    phase: 9.6,
    speed: 0.28,
  },
  {
    title: 'INTENT',
    code: 'FIELD / 11',
    meta: 'AGENTIC FLOW',
    value: '001',
    unit: 'ACTIVE TASK',
    accent: '#ffffff',
    position: [-4.9, -0.8, -3.6],
    size: [3.2, 2.0],
    type: 'bars',
    phase: 10.7,
    speed: 0.4,
  },
]

function drawPanelTexture(config, mobile) {
  const width = mobile ? 512 : 768
  const height = Math.round(width / 1.6)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const accent = config.accent
  const pad = width * 0.055

  ctx.clearRect(0, 0, width, height)

  // Glass tint and a faint engineered grid.
  const bg = ctx.createLinearGradient(0, 0, width, height)
  bg.addColorStop(0, 'rgba(10, 16, 32, 0.58)')
  bg.addColorStop(1, 'rgba(3, 6, 14, 0.32)')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, width, height)

  ctx.strokeStyle = 'rgba(255,255,255,0.035)'
  ctx.lineWidth = 1
  for (let x = 0; x < width; x += width / 16) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
  for (let y = 0; y < height; y += height / 10) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  // Corner brackets.
  ctx.strokeStyle = accent
  ctx.lineWidth = 2
  const corner = width * 0.04
  ctx.beginPath()
  ctx.moveTo(pad * 0.4, pad * 0.4 + corner)
  ctx.lineTo(pad * 0.4, pad * 0.4)
  ctx.lineTo(pad * 0.4 + corner, pad * 0.4)
  ctx.moveTo(width - pad * 0.4 - corner, pad * 0.4)
  ctx.lineTo(width - pad * 0.4, pad * 0.4)
  ctx.lineTo(width - pad * 0.4, pad * 0.4 + corner)
  ctx.moveTo(pad * 0.4, height - pad * 0.4 - corner)
  ctx.lineTo(pad * 0.4, height - pad * 0.4)
  ctx.lineTo(pad * 0.4 + corner, height - pad * 0.4)
  ctx.moveTo(width - pad * 0.4 - corner, height - pad * 0.4)
  ctx.lineTo(width - pad * 0.4, height - pad * 0.4)
  ctx.lineTo(width - pad * 0.4, height - pad * 0.4 - corner)
  ctx.stroke()

  // Header.
  ctx.fillStyle = 'rgba(244,243,238,0.55)'
  ctx.font = '500 15px "Space Grotesk", Arial, sans-serif'
  ctx.fillText('NEON® / SPATIAL OS', pad, pad + 14)
  ctx.textAlign = 'right'
  ctx.fillStyle = accent
  ctx.fillText(config.code, width - pad, pad + 14)
  ctx.textAlign = 'left'

  ctx.strokeStyle = 'rgba(255,255,255,0.14)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(pad, pad + 32)
  ctx.lineTo(width - pad, pad + 32)
  ctx.stroke()

  // Title, scaled to fit.
  const titleSize = Math.min(width * 0.128, height * 0.23)
  ctx.font = `700 ${titleSize}px "Unbounded", "Space Grotesk", Arial, sans-serif`
  let measured = ctx.measureText(config.title).width
  if (measured > width - pad * 2) {
    ctx.font = `700 ${titleSize * ((width - pad * 2) / measured)}px "Unbounded", "Space Grotesk", Arial, sans-serif`
  }
  ctx.fillStyle = 'rgba(244,243,238,0.96)'
  ctx.fillText(config.title, pad, height * 0.47)

  // Meta.
  ctx.font = '500 14px "Space Grotesk", Arial, sans-serif'
  ctx.fillStyle = 'rgba(244,243,238,0.44)'
  ctx.fillText(config.meta, pad, height * 0.54)

  // Big value.
  ctx.font = `500 ${width * 0.07}px "Unbounded", "Space Grotesk", Arial, sans-serif`
  ctx.fillStyle = accent
  ctx.fillText(config.value, pad, height - pad - height * 0.1)
  ctx.font = '500 11px "Space Grotesk", Arial, sans-serif'
  ctx.fillStyle = 'rgba(244,243,238,0.36)'
  ctx.fillText(config.unit, pad, height - pad - 3)

  // Visualisation block.
  const graphX = width * 0.57
  const graphY = height * 0.66
  const graphW = width * 0.35
  const graphH = height * 0.2
  ctx.strokeStyle = 'rgba(244,243,238,0.15)'
  ctx.strokeRect(graphX, graphY, graphW, graphH)

  if (config.type === 'wave') {
    ctx.strokeStyle = accent
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let i = 0; i <= 48; i += 1) {
      const x = graphX + (i / 48) * graphW
      const y = graphY + graphH / 2 + Math.sin(i * 0.6) * graphH * 0.25 * Math.cos(i * 0.14)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  } else if (config.type === 'bars') {
    ctx.fillStyle = accent
    for (let i = 0; i < 12; i += 1) {
      const barW = graphW / 18
      const h = (0.18 + ((i * 7) % 10) / 12) * graphH
      ctx.globalAlpha = 0.4 + (i % 4) * 0.14
      ctx.fillRect(graphX + 8 + i * (graphW / 13), graphY + graphH - h - 6, barW, h)
    }
    ctx.globalAlpha = 1
  } else if (config.type === 'reticle') {
    ctx.strokeStyle = accent
    ctx.beginPath()
    ctx.arc(graphX + graphW / 2, graphY + graphH / 2, graphH * 0.35, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(graphX + graphW / 2, graphY + graphH / 2, graphH * 0.16, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(graphX + graphW / 2 - graphH * 0.55, graphY + graphH / 2)
    ctx.lineTo(graphX + graphW / 2 + graphH * 0.55, graphY + graphH / 2)
    ctx.moveTo(graphX + graphW / 2, graphY + graphH / 2 - graphH * 0.5)
    ctx.lineTo(graphX + graphW / 2, graphY + graphH / 2 + graphH * 0.5)
    ctx.stroke()
  } else if (config.type === 'grid') {
    ctx.fillStyle = accent
    for (let x = 0; x < 8; x += 1) {
      for (let y = 0; y < 4; y += 1) {
        ctx.globalAlpha = 0.2 + ((x + y) % 3) * 0.2
        ctx.fillRect(graphX + 8 + x * (graphW / 9), graphY + 8 + y * (graphH / 5), graphW / 22, 3)
      }
    }
    ctx.globalAlpha = 1
  } else if (config.type === 'layers') {
    ctx.strokeStyle = accent
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath()
      ctx.rect(graphX + i * 10, graphY + i * 9, graphW - 24, graphH - 20)
      ctx.globalAlpha = 0.35 + i * 0.13
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  } else if (config.type === 'orbit') {
    ctx.strokeStyle = accent
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath()
      ctx.ellipse(graphX + graphW / 2, graphY + graphH / 2, graphW * 0.3 - i * 12, graphH * 0.28 - i * 5, i * 0.5, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.fillStyle = accent
    ctx.beginPath()
    ctx.arc(graphX + graphW * 0.66, graphY + graphH * 0.42, 3, 0, Math.PI * 2)
    ctx.fill()
  } else if (config.type === 'map') {
    ctx.strokeStyle = accent
    for (let i = 0; i < 11; i += 1) {
      const x = graphX + (i / 10) * graphW
      const y = graphY + graphH / 2 + Math.sin(i * 0.75) * graphH * 0.25
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
    ctx.fillStyle = accent
    for (let i = 0; i < 9; i += 1) {
      ctx.beginPath()
      ctx.arc(graphX + ((i * 37) % 100) / 100 * graphW, graphY + ((i * 61) % 100) / 100 * graphH, 2, 0, Math.PI * 2)
      ctx.fill()
    }
  } else {
    ctx.strokeStyle = accent
    ctx.beginPath()
    ctx.arc(graphX + graphW / 2, graphY + graphH / 2, graphH * 0.3, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Live status row.
  ctx.fillStyle = accent
  ctx.beginPath()
  ctx.arc(pad + 4, height - pad + 12, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(244,243,238,0.38)'
  ctx.font = '500 11px "Space Grotesk", Arial, sans-serif'
  ctx.fillText('LIVE / SYNCED TO NEON', pad + 16, height - pad + 16)
  ctx.textAlign = 'right'
  ctx.fillStyle = 'rgba(244,243,238,0.28)'
  ctx.fillText(`FIELD ${config.code.split('/')[1]?.trim() ?? '00'}`, width - pad, height - pad + 16)
  ctx.textAlign = 'left'

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = true
  texture.anisotropy = 4
  return texture
}

export default class SpatialPanels {
  constructor(scene, { mobile = false, capture = false, materials } = {}) {
    this.scene = scene
    this.mobile = mobile
    this.capture = capture
    this.materials = materials
    this.group = new THREE.Group()
    this.group.name = 'SPATIAL-FIELD'
    scene.add(this.group)
    this.panels = []
    this.tmp = new THREE.Vector3()
    this.textures = []

    this.glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x07162a,
      metalness: 0.15,
      roughness: 0.1,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      depthWrite: false,
      envMapIntensity: 1.6,
    })

    this.borderMaterials = {
      cyan: new THREE.LineBasicMaterial({ color: 0x22f0ff, transparent: true, opacity: 0 }),
      pink: new THREE.LineBasicMaterial({ color: 0xff2fb9, transparent: true, opacity: 0 }),
      violet: new THREE.LineBasicMaterial({ color: 0xa25cff, transparent: true, opacity: 0 }),
      acid: new THREE.LineBasicMaterial({ color: 0xc8ff2e, transparent: true, opacity: 0 }),
      white: new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 }),
      orange: new THREE.LineBasicMaterial({ color: 0xff6a1a, transparent: true, opacity: 0 }),
      blue: new THREE.LineBasicMaterial({ color: 0x3d5bff, transparent: true, opacity: 0 }),
    }

    const list = mobile ? PANELS.filter((_, index) => index !== 6 && index !== 9 && index !== 10) : PANELS
    list.forEach((config) => this.buildPanel(config))

    this.buildEnvironment()
    this.group.visible = false
  }

  buildPanel(config) {
    const wrapper = new THREE.Group()
    wrapper.position.set(...config.position)
    // Face the viewer's corridor. Using the origin would show the mirrored
    // backside of every panel as the camera flies through.
    wrapper.lookAt(wrapper.position.x * 0.22, wrapper.position.y * 0.12, 20)
    if (this.mobile) {
      wrapper.scale.setScalar(0.52)
      wrapper.position.x *= 0.32
      wrapper.position.y *= 0.7
    }

    const width = config.size[0]
    const height = config.size[1]
    const planeGeometry = new THREE.PlaneGeometry(width, height)

    const glassMaterial = this.glassMaterial.clone()
    glassMaterial.opacity = 0.1
    const glass = new THREE.Mesh(planeGeometry, glassMaterial)
    wrapper.add(glass)

    const texture = drawPanelTexture(config, this.mobile)
    this.textures.push(texture)
    const textMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false,
    })
    const text = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.965, height * 0.96), textMaterial)
    text.position.z = 0.012
    text.renderOrder = 12
    wrapper.add(text)

    const borderMaterial = (
      this.borderMaterials[this.getAccentKey(config.accent)] ?? this.borderMaterials.white
    ).clone()
    const borderGeometry = new THREE.EdgesGeometry(planeGeometry)
    const border = new THREE.LineSegments(borderGeometry, borderMaterial)
    border.position.z = 0.02
    wrapper.add(border)

    const scanMaterial = new THREE.MeshBasicMaterial({
      color: config.accent,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
      side: THREE.DoubleSide,
    })
    const scan = new THREE.Mesh(new THREE.PlaneGeometry(width * 0.92, 0.018), scanMaterial)
    scan.position.z = 0.03
    wrapper.add(scan)

    const glowMaterial = new THREE.MeshBasicMaterial({
      color: config.accent,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
      side: THREE.DoubleSide,
    })
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(width * 1.04, height * 1.04), glowMaterial)
    glow.position.z = -0.02
    wrapper.add(glow)

    wrapper.userData = {
      config,
      glass,
      glassMaterial,
      textMaterial,
      borderMaterial,
      borderGeometry,
      planeGeometry,
      scan,
      scanMaterial,
      glowMaterial,
      basePosition: wrapper.position.clone(),
      baseRotation: wrapper.rotation.clone(),
      phase: config.phase,
      speed: config.speed,
      width,
      height,
    }

    this.group.add(wrapper)
    this.panels.push(wrapper)
  }

  getAccentKey(accent) {
    const map = {
      '#22f0ff': 'cyan',
      '#ff2fb9': 'pink',
      '#a25cff': 'violet',
      '#c8ff2e': 'acid',
      '#ff6a1a': 'orange',
      '#3d5bff': 'blue',
      '#ffffff': 'white',
    }
    return map[accent] ?? 'white'
  }

  buildEnvironment() {
    // A wireframe floor gives the camera something to fly over.
    this.grid = new THREE.GridHelper(34, 34, 0x2b5cff, 0x102040)
    this.grid.position.set(0, -3.1, 3.5)
    this.grid.material.transparent = true
    this.grid.material.opacity = 0
    this.grid.material.depthWrite = false
    this.group.add(this.grid)

    const dotTexture = createDotTexture()
    this.dotTexture = dotTexture
    const dustGeometry = new THREE.BufferGeometry()
    const dustCount = this.mobile ? 220 : 540
    const dustPositions = new Float32Array(dustCount * 3)
    for (let i = 0; i < dustCount; i += 1) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 20
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 9
      dustPositions[i * 3 + 2] = 14 - Math.random() * 20
    }
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3))
    this.dustMaterial = new THREE.PointsMaterial({
      color: 0x7ba9ff,
      size: 0.045,
      map: dotTexture,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
      toneMapped: false,
    })
    this.dust = new THREE.Points(dustGeometry, this.dustMaterial)
    this.dust.frustumCulled = false
    this.group.add(this.dust)

    // Neon speed lines through the corridor.
    const linePositions = []
    for (let i = 0; i < 42; i += 1) {
      const x = (Math.random() - 0.5) * 18
      const y = (Math.random() - 0.5) * 8
      const z = 12 - Math.random() * 22
      const length = 0.8 + Math.random() * 3
      linePositions.push(x, y, z, x, y, z - length)
    }
    const lineGeometry = new THREE.BufferGeometry()
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))
    this.speedMaterial = new THREE.LineBasicMaterial({
      color: 0x3f7cff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    })
    this.speedLines = new THREE.LineSegments(lineGeometry, this.speedMaterial)
    this.speedLines.frustumCulled = false
    this.group.add(this.speedLines)
  }

  update({ opacity, time, camera }) {
    const visible = opacity > 0.004
    this.group.visible = visible
    if (!visible) return

    this.panels.forEach((panel) => {
      const data = panel.userData
      const drift = time * data.speed + data.phase
      panel.position.x = data.basePosition.x + Math.sin(drift * 0.7) * 0.08
      panel.position.y = data.basePosition.y + Math.cos(drift) * 0.09
      panel.position.z = data.basePosition.z + Math.sin(drift * 0.5) * 0.12
      panel.rotation.z = Math.sin(drift * 0.6) * 0.012

      this.tmp.copy(panel.position)
      const distance = camera.position.distanceTo(this.tmp)
      const nearFade = this.mobile
        ? THREE.MathUtils.smoothstep(distance, 4.0, 7.0)
        : THREE.MathUtils.smoothstep(distance, 0.75, 2.3)
      const farFade = 1 - THREE.MathUtils.smoothstep(distance, 26, 38)
      const panelOpacity = opacity * nearFade * farFade

      data.textMaterial.opacity = panelOpacity
      data.glassMaterial.opacity = 0.12 * panelOpacity
      data.glowMaterial.opacity = 0.055 * panelOpacity
      data.scanMaterial.opacity = panelOpacity * 0.7
      data.borderMaterial.opacity = 0.55 * panelOpacity
      panel.visible = panelOpacity > 0.005

      const scanRange = data.height * 0.78
      data.scan.position.y = Math.sin(time * 0.7 + data.phase) * scanRange * 0.5
      panel.rotation.y = data.baseRotation.y + Math.sin(drift * 0.35) * 0.02
    })

    this.grid.material.opacity = opacity * 0.22
    this.dustMaterial.opacity = opacity * 0.65
    this.speedMaterial.opacity = opacity * 0.28
    this.dust.rotation.z = Math.sin(time * 0.05) * 0.03
  }

  dispose() {
    this.textures.forEach((texture) => texture.dispose())
    this.glassMaterial.dispose()
    this.panels.forEach((panel) => {
      const data = panel.userData
      data.glassMaterial.dispose()
      data.textMaterial.dispose()
      data.borderMaterial.dispose()
      data.borderGeometry.dispose()
      data.planeGeometry.dispose()
      data.scan.geometry.dispose()
      data.scanMaterial.dispose()
      data.glowMaterial.dispose()
      panel.traverse((child) => {
        if (child.geometry) child.geometry.dispose()
      })
    })
    this.grid.geometry.dispose()
    this.grid.material.dispose()
    this.dust.geometry.dispose()
    this.dustMaterial.dispose()
    this.dotTexture.dispose()
    this.speedLines.geometry.dispose()
    this.speedMaterial.dispose()
    Object.values(this.borderMaterials).forEach((material) => material.dispose())
    this.scene.remove(this.group)
  }
}
