import * as THREE from 'three'
import { createGlowTexture } from './Materials'

const PALETTE = [0x22f0ff, 0x3d5bff, 0xa25cff, 0xff2fb9, 0xb9ffff, 0xffffff]

function organicBrainPosition(index, count, target) {
  const golden = Math.PI * (3 - Math.sqrt(5))
  const phi = Math.acos(1 - (2 * (index + 0.5)) / count)
  const theta = golden * index

  const shellBias = index % 9 === 0 ? 0.48 : 1
  const ripple = Math.sin(phi * 5.5 + index * 0.037) * 0.18 + Math.cos(theta * 3.2) * 0.12
  const radius = (2.12 + ripple) * shellBias + (index % 17 === 0 ? 0.62 : 0)
  const sponge = 1 + Math.sin(theta * 7 + phi * 4) * 0.055

  target.set(
    Math.sin(phi) * Math.cos(theta) * radius * sponge,
    Math.cos(phi) * radius * 0.86,
    Math.sin(phi) * Math.sin(theta) * radius * sponge,
  )

  // Filaments: a handful of particles are pulled out into long tendrils.
  if (index % 37 === 0) {
    const stretch = 1.45 + (index % 11) * 0.08
    target.x *= stretch
    target.y *= 0.8
    target.z *= stretch
  }

  return target
}

/**
 * A living particle brain. The cloud begins as five component clusters and
 * morphs into an organic neural envelope, with procedural synapses connecting
 * nearby nodes. Mouse input ripples through the field.
 */
export default class NeuralNetwork {
  constructor(scene, { mobile = false, capture = false } = {}) {
    this.scene = scene
    this.mobile = mobile
    this.capture = capture
    this.count = mobile ? 2400 : capture ? 3400 : 5200
    this.group = new THREE.Group()
    this.group.name = 'NEURAL-FIELD'
    scene.add(this.group)

    this.tmp = new THREE.Vector3()
    this.positions = new Float32Array(this.count * 3)
    this.clusterPositions = new Float32Array(this.count * 3)
    this.brainPositions = new Float32Array(this.count * 3)
    this.seeds = new Float32Array(this.count)
    this.sizes = new Float32Array(this.count)
    this.colors = new Float32Array(this.count * 3)
    this.morph = 0
    this.viewportHeight = window.innerHeight * Math.min(window.devicePixelRatio, 1.5)

    const clusterCenters = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 2.05, 0.25),
      new THREE.Vector3(2.25, 0.55, -0.15),
      new THREE.Vector3(-2.25, 0.3, 0.1),
      new THREE.Vector3(0, -2.05, 0.15),
    ]

    const color = new THREE.Color()
    for (let i = 0; i < this.count; i += 1) {
      const center = clusterCenters[i % clusterCenters.length]
      const radius = Math.pow(Math.random(), 0.7) * 0.55
      const phi = Math.acos(Math.random() * 2 - 1)
      const theta = Math.random() * Math.PI * 2
      this.clusterPositions[i * 3] = center.x + Math.sin(phi) * Math.cos(theta) * radius
      this.clusterPositions[i * 3 + 1] = center.y + Math.cos(phi) * radius
      this.clusterPositions[i * 3 + 2] = center.z + Math.sin(phi) * Math.sin(theta) * radius

      organicBrainPosition(i, this.count, this.tmp)
      this.brainPositions[i * 3] = this.tmp.x
      this.brainPositions[i * 3 + 1] = this.tmp.y
      this.brainPositions[i * 3 + 2] = this.tmp.z

      this.positions[i * 3] = this.clusterPositions[i * 3]
      this.positions[i * 3 + 1] = this.clusterPositions[i * 3 + 1]
      this.positions[i * 3 + 2] = this.clusterPositions[i * 3 + 2]

      this.seeds[i] = Math.random()
      this.sizes[i] = 0.012 + Math.random() * 0.038

      color.setHex(PALETTE[i % PALETTE.length])
      const brightness = 0.6 + Math.random() * 0.8
      this.colors[i * 3] = color.r * brightness
      this.colors[i * 3 + 1] = color.g * brightness
      this.colors[i * 3 + 2] = color.b * brightness
    }

    this.geometry = new THREE.BufferGeometry()
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3))
    this.geometry.setAttribute('aColor', new THREE.BufferAttribute(this.colors, 3))
    this.geometry.setAttribute('aSize', new THREE.BufferAttribute(this.sizes, 1))
    this.geometry.setAttribute('aSeed', new THREE.BufferAttribute(this.seeds, 1))
    this.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 6)

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0 },
        uMorph: { value: 0 },
        uExpand: { value: 1 },
        uSize: { value: 1 },
        uViewportHeight: { value: this.viewportHeight },
        uMouse: { value: new THREE.Vector2() },
      },
      vertexShader: /* glsl */ `
        attribute vec3 aColor;
        attribute float aSize;
        attribute float aSeed;
        uniform float uTime;
        uniform float uMorph;
        uniform float uExpand;
        uniform float uSize;
        uniform float uViewportHeight;
        uniform vec2 uMouse;
        varying vec3 vColor;
        varying float vTwinkle;

        void main() {
          vec3 p = position;
          float wave = sin(p.y * 2.2 + uTime * 0.8 + aSeed * 6.2831);
          p.x += uMouse.x * (0.13 + 0.1 * wave) * (1.0 + uMorph * 0.8);
          p.y += uMouse.y * (0.1 + 0.08 * wave) * (1.0 + uMorph * 0.8);
          p *= uExpand;

          vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          float pointSize = aSize * uSize * uViewportHeight * 0.5 / max(1.0, -mvPosition.z);
          gl_PointSize = clamp(pointSize, 1.0, 9.0);
          vColor = aColor;
          vTwinkle = 0.62 + 0.38 * sin(uTime * 1.6 + aSeed * 31.415);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uOpacity;
        varying vec3 vColor;
        varying float vTwinkle;

        void main() {
          vec2 p = gl_PointCoord - 0.5;
          float d = length(p);
          float core = smoothstep(0.5, 0.02, d);
          float halo = smoothstep(0.5, 0.15, d) * 0.4;
          float alpha = (core + halo) * uOpacity * (0.55 + vTwinkle * 0.7);
          if (alpha < 0.002) discard;
          gl_FragColor = vec4(vColor * (1.4 + vTwinkle * 0.9), alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
      toneMapped: false,
    })

    this.points = new THREE.Points(this.geometry, this.material)
    this.points.frustumCulled = false
    this.group.add(this.points)

    this.buildSynapses(clusterCenters)
    this.buildAura()
    this.buildHalos()

    this.group.visible = false
    this.rotationSpeed = 0.02
  }

  buildSynapses(clusterCenters) {
    const pairCount = this.mobile ? 260 : this.capture ? 400 : 620
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(pairCount * 6)
    const pairs = []
    let attempts = 0
    while (pairs.length < pairCount && attempts < pairCount * 30) {
      attempts += 1
      const a = Math.floor(Math.random() * this.count)
      const b = Math.floor(Math.random() * this.count)
      if (a === b) continue
      const ax = this.brainPositions[a * 3]
      const ay = this.brainPositions[a * 3 + 1]
      const az = this.brainPositions[a * 3 + 2]
      const bx = this.brainPositions[b * 3]
      const by = this.brainPositions[b * 3 + 1]
      const bz = this.brainPositions[b * 3 + 2]
      const distance = Math.hypot(ax - bx, ay - by, az - bz)
      if (distance < 0.62) {
        pairs.push([a, b])
      }
    }
    while (pairs.length < pairCount) {
      pairs.push([Math.floor(Math.random() * this.count), Math.floor(Math.random() * this.count)])
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 6)
    this.synapseMaterial = new THREE.LineBasicMaterial({
      color: 0x5a7dff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    })
    this.synapses = new THREE.LineSegments(geometry, this.synapseMaterial)
    this.synapses.frustumCulled = false
    this.synapsePositions = positions
    this.synapsePairs = pairs
    this.synapseGeometry = geometry
    this.group.add(this.synapses)

    // Keep the cluster centers for a subtle pulse at the origin.
    this.clusterCenters = clusterCenters
  }

  buildAura() {
    this.glowTexture = createGlowTexture()
    const makeGlow = (color, scale, opacity) => {
      const material = new THREE.SpriteMaterial({
        map: this.glowTexture,
        color,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      })
      const sprite = new THREE.Sprite(material)
      sprite.scale.setScalar(scale)
      this.group.add(sprite)
      return sprite
    }
    this.auraOuter = makeGlow(0x6a4fff, 7.8, 0)
    this.auraInner = makeGlow(0x22f0ff, 3.2, 0)
  }

  buildHalos() {
    this.halos = []
    const configs = [
      { radius: 3.2, tube: 0.007, color: 0x2f9fff, rotation: [Math.PI / 2.2, 0.4, 0.1] },
      { radius: 3.65, tube: 0.005, color: 0xb13cff, rotation: [Math.PI / 1.7, -0.35, 0.2] },
      { radius: 4.1, tube: 0.004, color: 0xff2fb9, rotation: [Math.PI / 2.8, 0.7, -0.1] },
    ]
    configs.forEach((config) => {
      const material = new THREE.MeshBasicMaterial({
        color: config.color,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      })
      const mesh = new THREE.Mesh(new THREE.TorusGeometry(config.radius, config.tube, 4, 180), material)
      mesh.rotation.set(...config.rotation)
      this.group.add(mesh)
      this.halos.push({ mesh, material, baseRotation: mesh.rotation.clone() })
    })
  }

  setViewport(width, height, pixelRatio) {
    this.viewportHeight = height * pixelRatio
    this.material.uniforms.uViewportHeight.value = this.viewportHeight
  }

  update({ visibility, morph, time, mouse, expand, opacityBoost }) {
    this.group.visible = visibility > 0.004
    if (!this.group.visible) return

    this.morph = morph
    this.material.uniforms.uTime.value = time
    this.material.uniforms.uOpacity.value = Math.min(1, visibility * (opacityBoost ?? 1))
    this.material.uniforms.uMorph.value = morph
    this.material.uniforms.uExpand.value = expand
    this.material.uniforms.uMouse.value.set(mouse.x, mouse.y)

    const breath = 1 + Math.sin(time * 0.8) * 0.018
    this.group.rotation.y = time * 0.05 + mouse.x * 0.22
    this.group.rotation.x = Math.sin(time * 0.22) * 0.07 + mouse.y * 0.14
    this.group.rotation.z = Math.sin(time * 0.16) * 0.025
    this.group.scale.setScalar((0.9 + morph * 0.1) * breath)

    if (visibility > 0.01) {
      const positions = this.positions
      const clusters = this.clusterPositions
      const brain = this.brainPositions
      const m = morph
      for (let i = 0; i < this.count; i += 1) {
        const index = i * 3
        const wave = Math.sin(time * 0.55 + this.seeds[i] * 12.2) * 0.045 * m
        positions[index] = clusters[index] + (brain[index] - clusters[index]) * m + wave
        positions[index + 1] =
          clusters[index + 1] + (brain[index + 1] - clusters[index + 1]) * m + wave * 0.6
        positions[index + 2] =
          clusters[index + 2] + (brain[index + 2] - clusters[index + 2]) * m + wave * 0.8
      }
      this.geometry.attributes.position.needsUpdate = true

      const synapses = this.synapsePositions
      for (let p = 0; p < this.synapsePairs.length; p += 1) {
        const [a, b] = this.synapsePairs[p]
        const offset = p * 6
        synapses[offset] = positions[a * 3]
        synapses[offset + 1] = positions[a * 3 + 1]
        synapses[offset + 2] = positions[a * 3 + 2]
        synapses[offset + 3] = positions[b * 3]
        synapses[offset + 4] = positions[b * 3 + 1]
        synapses[offset + 5] = positions[b * 3 + 2]
      }
      this.synapseGeometry.attributes.position.needsUpdate = true
      this.synapseMaterial.opacity = visibility * 0.2 * (0.4 + morph * 0.6)
    }

    this.auraOuter.material.opacity = visibility * 0.22 * (0.5 + morph * 0.5)
    this.auraInner.material.opacity = visibility * 0.28
    this.auraOuter.scale.setScalar(7.8 + Math.sin(time * 0.9) * 0.25 + morph * 1.2)
    this.auraInner.scale.setScalar(3.1 + Math.sin(time * 1.3) * 0.15 + morph * 0.4)

    this.halos.forEach((halo, index) => {
      halo.material.opacity = visibility * (0.18 + morph * 0.2)
      halo.mesh.rotation.z = halo.baseRotation.z + time * (0.05 + index * 0.02)
      halo.mesh.rotation.y = halo.baseRotation.y + time * 0.03
    })
  }

  dispose() {
    this.glowTexture.dispose()
    this.geometry.dispose()
    this.material.dispose()
    this.synapseGeometry.dispose()
    this.synapseMaterial.dispose()
    this.halos.forEach((halo) => {
      halo.mesh.geometry.dispose()
      halo.material.dispose()
    })
    this.scene.remove(this.group)
  }
}
