import * as THREE from 'three'
import { createDotTexture, createGlowTexture } from './Materials'

const TMP_COLOR = new THREE.Color()

const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3)

/**
 * NEON — a procedural spatial AI device.
 *
 * The whole object is built from primitives: a dark liquid-metal shell, an
 * emissive neural core, transparent glass, gyroscopic rings, iris shards and
 * suspended holographic details. Every piece keeps its own exploded target so
 * the device can dismantle, orbit and re-form continuously.
 */
export default class NeonDevice {
  constructor(scene, materials, { mobile = false } = {}) {
    this.scene = scene
    this.materials = materials
    this.mobile = mobile
    this.group = new THREE.Group()
    this.group.name = 'NEON-DEVICE'
    scene.add(this.group)

    this.parts = []
    this.rings = []
    this.microCapsules = []
    this.shards = []
    this.lights = []
    this.tmpVector = new THREE.Vector3()

    this.dotTexture = createDotTexture()
    this.glowTexture = createGlowTexture()

    this.buildCore()
    this.buildCaps()
    this.buildRings()
    this.buildIris()
    this.buildCollar()
    this.buildDetails()
    this.buildDust()
    this.buildAura()
    this.buildLights()

    this.stageSpin = 0
    this.basePalette = {
      a: new THREE.Color(0x22f0ff),
      b: new THREE.Color(0xff2fb9),
      c: new THREE.Color(0x3d5bff),
    }
    this.colorPalette = {
      a: new THREE.Color(0xff2fb9),
      b: new THREE.Color(0xc8ff2e),
      c: new THREE.Color(0xff6a1a),
    }
  }

  buildCore() {
    this.coreGroup = new THREE.Group()
    this.group.add(this.coreGroup)

    this.coreMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.53, 5), this.materials.core)
    this.coreGroup.add(this.coreMesh)

    this.coreShell = new THREE.Mesh(new THREE.IcosahedronGeometry(0.73, 2), this.materials.coreShell)
    this.coreGroup.add(this.coreShell)

    const coreWire = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.74, 2)),
      new THREE.LineBasicMaterial({ color: 0x22f0ff, transparent: true, opacity: 0.1 }),
    )
    this.coreGroup.add(coreWire)

    for (let i = 0; i < 3; i += 1) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.86 + i * 0.05, 0.0045, 4, 96),
        i === 0 ? this.materials.cyan : i === 1 ? this.materials.pink : this.materials.white,
      )
      ring.rotation.x = Math.PI / 2 + i * 0.42
      ring.rotation.y = i * 0.8
      this.coreGroup.add(ring)
    }

    const glowMaterial = new THREE.SpriteMaterial({
      map: this.glowTexture,
      color: 0x8ff9ff,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      opacity: 0,
    })
    this.coreGlow = new THREE.Sprite(glowMaterial)
    this.coreGlow.scale.setScalar(3.4)
    this.coreGlow.renderOrder = 2
    this.coreGroup.add(this.coreGlow)

    this.coreGroup.rotation.order = 'YXZ'
  }

  buildCaps() {
    const theta = 0.92
    const radius = 1.48
    const rimRadius = radius * Math.sin(theta)
    const rimY = radius * Math.cos(theta)
    const capGeometryTop = new THREE.SphereGeometry(radius, 72, 36, 0, Math.PI * 2, 0, theta)
    const capGeometryBottom = new THREE.SphereGeometry(
      radius,
      72,
      36,
      0,
      Math.PI * 2,
      Math.PI - theta,
      theta,
    )

    const makeCap = (geometry, side) => {
      const wrapper = new THREE.Group()

      const shell = new THREE.Mesh(geometry, this.materials.metal)
      wrapper.add(shell)

      const inner = new THREE.Mesh(
        new THREE.SphereGeometry(radius - 0.035, 48, 24, 0, Math.PI * 2, side === 'top' ? 0 : Math.PI - theta, theta),
        new THREE.MeshStandardMaterial({
          color: 0x05080d,
          metalness: 0.75,
          roughness: 0.4,
          emissive: new THREE.Color(0x04131a),
          emissiveIntensity: 0.6,
          side: THREE.BackSide,
        }),
      )
      wrapper.add(inner)

      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(rimRadius, 0.018, 6, 120),
        side === 'top' ? this.materials.cyan : this.materials.pink,
      )
      rim.rotation.x = Math.PI / 2
      rim.position.y = side === 'top' ? rimY : -rimY
      wrapper.add(rim)

      const innerRim = new THREE.Mesh(
        new THREE.TorusGeometry(rimRadius * 0.72, 0.006, 4, 96),
        this.materials.white,
      )
      innerRim.rotation.x = Math.PI / 2
      innerRim.position.y = side === 'top' ? rimY - 0.03 : -rimY + 0.03
      wrapper.add(innerRim)

      const circuit = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.TorusGeometry(rimRadius * 0.9, 0.12, 6, 36)),
        new THREE.LineBasicMaterial({ color: 0x22f0ff, transparent: true, opacity: 0.16 }),
      )
      circuit.rotation.x = Math.PI / 2
      circuit.position.y = side === 'top' ? rimY - 0.02 : -rimY + 0.02
      wrapper.add(circuit)

      // Little precision-engineered ports around the rim (one instanced draw call).
      const portGeometry = new THREE.BoxGeometry(0.075, 0.026, 0.026)
      const ports = new THREE.InstancedMesh(portGeometry, this.materials.cyan, 8)
      const portObject = new THREE.Object3D()
      for (let i = 0; i < 8; i += 1) {
        const angle = (i / 8) * Math.PI * 2 + (side === 'top' ? 0.2 : 0)
        portObject.position.set(
          Math.cos(angle) * rimRadius * 0.98,
          rimY - 0.012,
          Math.sin(angle) * rimRadius * 0.98,
        )
        portObject.lookAt(0, 0, 0)
        portObject.updateMatrix()
        ports.setMatrixAt(i, portObject.matrix)
      }
      ports.instanceMatrix.needsUpdate = true
      wrapper.add(ports)

      wrapper.userData.rim = rim
      wrapper.userData.side = side
      this.group.add(wrapper)
      this.parts.push({
        object: wrapper,
        name: side,
        basePosition: new THREE.Vector3(0, 0, 0),
        baseRotation: new THREE.Euler(0, 0, 0),
        explodePosition: new THREE.Vector3(0, side === 'top' ? 1.85 : -1.85, 0),
        explodeRotation: new THREE.Euler(side === 'top' ? 0.9 : -0.9, side === 'top' ? 0.25 : -0.2, 0),
        spin: new THREE.Vector3(0.002, 0.004, 0.001),
      })
      return wrapper
    }

    this.capTop = makeCap(capGeometryTop, 'top')
    this.capBottom = makeCap(capGeometryBottom, 'bottom')

    // Glass equator band: the transparent waist of the object.
    this.glassBand = new THREE.Mesh(
      new THREE.CylinderGeometry(1.505, 1.505, 0.56, 96, 1, true),
      this.materials.glass,
    )
    this.group.add(this.glassBand)
    this.parts.push({
      object: this.glassBand,
      name: 'glass-band',
      basePosition: new THREE.Vector3(0, 0, 0),
      baseRotation: new THREE.Euler(0, 0, 0),
      explodePosition: new THREE.Vector3(0, 0, 0),
      explodeRotation: new THREE.Euler(0, 0, 0),
      spin: new THREE.Vector3(0, 0.06, 0),
      glass: true,
    })

    this.equatorRim = new THREE.Mesh(
      new THREE.TorusGeometry(1.51, 0.01, 6, 160),
      this.materials.white,
    )
    this.equatorRim.rotation.x = Math.PI / 2
    this.group.add(this.equatorRim)
  }

  buildRings() {
    this.ringGroup = new THREE.Group()
    this.group.add(this.ringGroup)

    const ringConfigs = [
      { radius: 2.04, tube: 0.012, x: Math.PI / 2, y: 0, z: 0.12, color: 'violet', speed: 0.15 },
      { radius: 2.24, tube: 0.008, x: Math.PI / 2.1, y: 0.42, z: -0.25, color: 'cyan', speed: -0.11 },
      { radius: 2.46, tube: 0.007, x: Math.PI / 1.78, y: -0.5, z: 0.35, color: 'pink', speed: 0.09 },
    ]

    ringConfigs.forEach((config, index) => {
      const holder = new THREE.Group()
      holder.rotation.set(config.x, config.y, config.z)

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(config.radius, config.tube, 4, 220),
        this.materials[config.color],
      )
      holder.add(ring)

      const arcMaterial = index === 1 ? this.materials.cyan : index === 2 ? this.materials.pink : this.materials.acid
      for (let i = 0; i < 2; i += 1) {
        const arc = new THREE.Mesh(
          new THREE.TorusGeometry(config.radius + 0.012, 0.021, 4, 36, 0.55 + i * 0.22),
          arcMaterial,
        )
        arc.rotation.z = i * 2.6 + index * 0.7
        holder.add(arc)
      }

      const tickGeometry = new THREE.BoxGeometry(0.035, 0.004, 0.045)
      const ticks = new THREE.InstancedMesh(tickGeometry, this.materials.brushed, 18)
      const tickObject = new THREE.Object3D()
      for (let i = 0; i < 18; i += 1) {
        const angle = (i / 18) * Math.PI * 2
        tickObject.position.set(
          Math.cos(angle) * (config.radius + 0.03),
          Math.sin(angle) * (config.radius + 0.03),
          0,
        )
        tickObject.rotation.set(0, 0, angle)
        if (i % 3 === 0) tickObject.scale.set(1, 2.1, 1)
        else tickObject.scale.set(1, 1, 1)
        tickObject.updateMatrix()
        ticks.setMatrixAt(i, tickObject.matrix)
      }
      ticks.instanceMatrix.needsUpdate = true
      holder.add(ticks)

      holder.userData.baseX = config.x
      holder.userData.baseY = config.y
      holder.userData.baseZ = config.z
      holder.userData.speed = config.speed
      holder.userData.index = index
      this.ringGroup.add(holder)
      this.rings.push(holder)
    })
  }

  buildIris() {
    const shardGeometry = new THREE.BoxGeometry(0.36, 0.032, 0.94)
    const edgeGeometry = new THREE.EdgesGeometry(shardGeometry)
    const count = this.mobile ? 8 : 10

    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2
      const wrapper = new THREE.Group()
      wrapper.rotation.y = -angle

      const shard = new THREE.Mesh(shardGeometry, i % 3 === 0 ? this.materials.brushed : this.materials.metal)
      wrapper.add(shard)

      const edges = new THREE.LineSegments(edgeGeometry, i % 2 === 0 ? this.materials.lineCyan : this.materials.linePink)
      wrapper.add(edges)

      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.006, 0.12),
        i % 3 === 0 ? this.materials.acid : i % 2 === 0 ? this.materials.cyan : this.materials.pink,
      )
      strip.position.set(0, 0.022, 0.35)
      wrapper.add(strip)

      const base = new THREE.Vector3(Math.cos(angle) * 1.92, 0, Math.sin(angle) * 1.92)
      const expRadius = 2.75 + (i % 3) * 0.17
      const exploded = new THREE.Vector3(
        Math.cos(angle) * expRadius,
        (i % 2 === 0 ? 1 : -1) * (0.55 + (i % 4) * 0.16),
        Math.sin(angle) * expRadius,
      )
      const part = {
        object: wrapper,
        name: `shard-${i}`,
        basePosition: base,
        baseRotation: new THREE.Euler(0, -angle, 0),
        explodePosition: exploded,
        explodeRotation: new THREE.Euler(
          (i % 2 === 0 ? 1 : -1) * 0.7,
          (i % 3 === 0 ? 1 : -1) * 0.9,
          Math.sin(i * 2.1) * 0.6,
        ),
        spin: new THREE.Vector3(0.16 + (i % 3) * 0.03, 0.1 + (i % 4) * 0.02, 0.08),
      }
      wrapper.position.copy(base)
      wrapper.rotation.copy(part.baseRotation)
      this.group.add(wrapper)
      this.parts.push(part)
      this.shards.push(part)
    }

    // Transparent fins that orbit the shell.
    const finGeometry = new THREE.PlaneGeometry(0.42, 1.15)
    for (let i = 0; i < 4; i += 1) {
      const angle = Math.PI / 4 + (i / 4) * Math.PI * 2
      const fin = new THREE.Mesh(finGeometry, this.materials.glass)
      fin.position.set(Math.cos(angle) * 2.25, 0.15, Math.sin(angle) * 2.25)
      fin.lookAt(0, 0, 0)
      fin.rotateY(Math.PI / 2)
      this.group.add(fin)
      this.parts.push({
        object: fin,
        name: `fin-${i}`,
        basePosition: fin.position.clone(),
        baseRotation: fin.rotation.clone(),
        explodePosition: new THREE.Vector3(Math.cos(angle) * 3.1, 0.6 - i * 0.25, Math.sin(angle) * 3.1),
        explodeRotation: new THREE.Euler(0.4, -angle, 0.8),
        spin: new THREE.Vector3(0.03, 0.02, 0.04),
        glass: true,
      })
    }
  }

  buildCollar() {
    this.collar = new THREE.Group()
    const segments = 4
    const arcLength = (Math.PI * 2) / segments - 0.22
    for (let i = 0; i < segments; i += 1) {
      const holder = new THREE.Group()
      holder.rotation.y = (i / segments) * Math.PI * 2 + 0.2

      const brace = new THREE.Mesh(
        new THREE.TorusGeometry(1.57, 0.052, 8, 48, arcLength),
        i % 2 === 0 ? this.materials.metal : this.materials.brushed,
      )
      brace.rotation.x = Math.PI / 2
      holder.add(brace)

      const edge = new THREE.Mesh(
        new THREE.TorusGeometry(1.57, 0.006, 4, 48, arcLength),
        this.materials.cyan,
      )
      edge.rotation.x = Math.PI / 2
      edge.position.y = 0.057
      holder.add(edge)

      const notch = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.075, 0.052), this.materials.acid)
      notch.position.set(Math.cos(arcLength / 2) * 1.57, 0, Math.sin(arcLength / 2) * 1.57)
      holder.add(notch)

      this.collar.add(holder)
    }
    this.group.add(this.collar)
  }

  buildDetails() {
    const capsuleGeometry = new THREE.CapsuleGeometry(0.045, 0.2, 3, 8)
    for (let i = 0; i < 6; i += 1) {
      const angle = i * 2.37
      const holder = new THREE.Group()
      const capsule = new THREE.Mesh(capsuleGeometry, i % 2 === 0 ? this.materials.ivory : this.materials.brushed)
      holder.add(capsule)

      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.022, 8, 8),
        i % 3 === 0 ? this.materials.acid : this.materials.cyan,
      )
      glow.position.y = 0.16
      holder.add(glow)

      holder.position.set(Math.cos(angle) * 2.15, (i % 2 === 0 ? 1 : -1) * 1.18, Math.sin(angle) * 2.15)
      holder.lookAt(0, 0, 0)
      this.group.add(holder)
      const base = holder.position.clone()
      this.parts.push({
        object: holder,
        name: `micro-${i}`,
        basePosition: base,
        baseRotation: holder.rotation.clone(),
        explodePosition: new THREE.Vector3(base.x * 1.7, base.y * 1.3, base.z * 1.7),
        explodeRotation: new THREE.Euler(1.2, base.x, -0.8),
        spin: new THREE.Vector3(0.1, 0.08, 0.1),
      })
      this.microCapsules.push(holder)
    }

    // Holographic base disc — a scanning field under the device.
    this.scanMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0 },
        uColor: { value: new THREE.Color(0x22f0ff) },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uOpacity;
        uniform vec3 uColor;
        varying vec2 vUv;
        void main() {
          vec2 p = vUv - 0.5;
          float r = length(p) * 2.0;
          float angle = atan(p.y, p.x);
          float rings = smoothstep(0.83, 0.86, fract(r * 6.0 - uTime * 0.08));
          float spokes = smoothstep(0.92, 1.0, sin(angle * 12.0 + uTime * 0.35) * 0.5 + 0.5);
          float sweep = smoothstep(0.95, 1.0, sin(angle - uTime * 0.55) * 0.5 + 0.5);
          float edge = smoothstep(1.0, 0.72, r);
          float alpha = (rings * 0.25 + spokes * 0.18 + sweep * 0.22) * edge * uOpacity;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
    this.scanDisc = new THREE.Mesh(new THREE.CircleGeometry(2.65, 96), this.scanMaterial)
    this.scanDisc.rotation.x = -Math.PI / 2
    this.scanDisc.position.y = -2.35
    this.group.add(this.scanDisc)
  }

  buildDust() {
    const count = this.mobile ? 100 : 220
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const palette = [new THREE.Color(0x22f0ff), new THREE.Color(0xff2fb9), new THREE.Color(0xffffff), new THREE.Color(0xa25cff)]

    for (let i = 0; i < count; i += 1) {
      const radius = 1.4 + Math.random() * 2.8
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      positions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius
      positions[i * 3 + 1] = Math.cos(phi) * radius * 0.7
      positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius
      const color = palette[i % palette.length]
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    this.dust = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        size: 0.035,
        map: this.dotTexture,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        sizeAttenuation: true,
      }),
    )
    this.group.add(this.dust)
  }

  buildAura() {
    this.aura = new THREE.Mesh(new THREE.PlaneGeometry(7.4, 7.4), this.materials.aura)
    this.aura.renderOrder = 1
    this.aura.frustumCulled = false
    this.scene.add(this.aura)
  }

  buildLights() {
    const configs = [
      { color: 0x22f0ff, intensity: 14, position: [2.6, 2.2, 3.2] },
      { color: 0xff2fb9, intensity: 11, position: [-2.8, -1.4, 2.4] },
      { color: 0xff6a1a, intensity: 7, position: [0.2, 2.8, -2.2] },
    ]
    configs.forEach((config) => {
      const light = new THREE.PointLight(config.color, config.intensity, 12, 2)
      light.position.set(...config.position)
      this.group.add(light)
      this.lights.push(light)
    })
  }

  getAnchor(name, target = new THREE.Vector3()) {
    if (name === 'CORE') {
      return this.coreMesh.getWorldPosition(target)
    }
    if (name === 'MEMORY') {
      return this.capTop.getWorldPosition(target).add(this.tmpVector.set(0, 0.45, 0))
    }
    if (name === 'MOTION') {
      return this.capBottom.getWorldPosition(target).add(this.tmpVector.set(0, -0.45, 0))
    }
    if (name === 'VISION') {
      const index = 1
      return this.shards[index]?.object.getWorldPosition(target) ?? target.set(1.8, 0.2, 0)
    }
    if (name === 'VOICE') {
      const index = Math.min(6, this.shards.length - 1)
      return this.shards[index]?.object.getWorldPosition(target) ?? target.set(-1.8, 0.2, 0)
    }
    return this.group.getWorldPosition(target)
  }

  update({ time, intro, explode, colorMix, visibility, scale: stageScale = 1, mouse, camera, stage }) {
    const introEase = easeOutCubic(THREE.MathUtils.clamp(intro, 0, 1))
    const assembly = 1 - introEase
    const e = Math.min(1.65, explode + assembly * 1.28)
    const visible = introEase > 0.002 && visibility > 0.002
    this.group.visible = visible
    this.aura.visible = visible
    if (!visible) {
      this.aura.material.uniforms.uOpacity.value = 0
      return
    }

    const scale = introEase * (0.4 + 0.6 * visibility) * visibility * stageScale
    this.group.scale.setScalar(scale)
    this.group.rotation.y = time * 0.09 + stage * 0.38 + mouse.x * 0.2
    this.group.rotation.x = Math.sin(time * 0.27) * 0.06 + mouse.y * 0.11 - e * 0.04
    this.group.rotation.z = Math.sin(time * 0.18) * 0.035
    this.group.position.y = Math.sin(time * 0.62) * 0.1 * (1 - e * 0.35)

    // Core breathing.
    this.coreMesh.rotation.y = time * 0.28
    this.coreMesh.rotation.x = time * 0.12
    this.coreShell.rotation.y = -time * 0.16
    this.coreShell.rotation.z = time * 0.08
    const corePulse = 1 + Math.sin(time * 2.0) * 0.025 + e * 0.08
    this.coreMesh.scale.setScalar(corePulse)
    const coreIntensity = 0.95 + (colorMix > 0 ? colorMix * 1.4 : 0) + (1 - introEase) * 1.6
    this.materials.core.uniforms.uTime.value = time
    this.materials.core.uniforms.uIntensity.value = coreIntensity
    TMP_COLOR.copy(this.basePalette.a).lerp(this.colorPalette.a, colorMix)
    this.materials.core.uniforms.uColorA.value.copy(TMP_COLOR)
    TMP_COLOR.copy(this.basePalette.b).lerp(this.colorPalette.b, colorMix)
    this.materials.core.uniforms.uColorB.value.copy(TMP_COLOR)
    TMP_COLOR.copy(this.basePalette.c).lerp(this.colorPalette.c, colorMix)
    this.materials.core.uniforms.uColorC.value.copy(TMP_COLOR)

    this.coreGlow.material.opacity = introEase * (0.26 + Math.sin(time * 1.7) * 0.05) * (1 - e * 0.12)
    this.coreGlow.material.color.copy(this.materials.core.uniforms.uColorA.value)
    this.coreGlow.scale.setScalar(2.5 + Math.sin(time * 1.2) * 0.16 + e * 0.4)

    // Exploded hardware.
    this.parts.forEach((part) => {
      const object = part.object
      object.position.lerpVectors(part.basePosition, part.explodePosition, e)
      object.rotation.x = part.baseRotation.x + part.explodeRotation.x * e + time * part.spin.x
      object.rotation.y = part.baseRotation.y + part.explodeRotation.y * e + time * part.spin.y
      object.rotation.z = part.baseRotation.z + part.explodeRotation.z * e + time * part.spin.z
      if (part.glass) {
        object.material.opacity = 0.1 + (1 - e) * 0.12 + colorMix * 0.08
      }
    })

    this.glassBand.scale.set(1 + e * 0.11, 1 + e * 0.4, 1 + e * 0.11)
    this.equatorRim.scale.setScalar(1 + e * 0.2)
    this.equatorRim.rotation.z = time * 0.09

    this.ringGroup.scale.setScalar(1 + e * 0.16)
    this.rings.forEach((ring, index) => {
      const speed = ring.userData.speed
      ring.rotation.x = ring.userData.baseX + Math.sin(time * 0.2 + index) * 0.12 + e * (0.4 - index * 0.12)
      ring.rotation.y = ring.userData.baseY + time * speed
      ring.rotation.z = ring.userData.baseZ + Math.cos(time * 0.15 + index) * 0.08
    })

    this.dust.rotation.y = time * 0.045
    this.dust.rotation.x = Math.sin(time * 0.08) * 0.2 + e * 0.18
    this.dust.scale.setScalar(0.8 + e * 0.35)

    this.scanDisc.material.uniforms.uTime.value = time
    this.scanDisc.material.uniforms.uOpacity.value = introEase * (0.2 + e * 0.35 + colorMix * 0.2)
    this.scanDisc.rotation.z = time * 0.05
    this.scanDisc.position.y = -2.35 - e * 0.2
    this.materials.aura.uniforms.uTime.value = time
    this.materials.aura.uniforms.uOpacity.value = introEase * (0.08 + e * 0.055 + colorMix * 0.16)
    TMP_COLOR.copy(this.basePalette.a).lerp(this.colorPalette.a, colorMix)
    this.materials.aura.uniforms.uColorA.value.copy(TMP_COLOR)
    TMP_COLOR.copy(this.basePalette.b).lerp(this.colorPalette.b, colorMix)
    this.materials.aura.uniforms.uColorB.value.copy(TMP_COLOR)

    this.aura.position.copy(this.group.position)
    this.aura.quaternion.copy(camera.quaternion)
    this.aura.scale.setScalar(0.9 + Math.sin(time * 0.8) * 0.03 + e * 0.15)

    this.materials.cyan.emissive.lerpColors(new THREE.Color(0x22f0ff), new THREE.Color(0xc8ff2e), colorMix)
    this.materials.pink.emissive.lerpColors(new THREE.Color(0xff2fb9), new THREE.Color(0xff2fb9), colorMix)
    this.materials.orange.emissive.lerpColors(new THREE.Color(0xff6a1a), new THREE.Color(0x22f0ff), colorMix)

    this.lights.forEach((light, index) => {
      const base = index === 0 ? 14 : index === 1 ? 11 : 7
      light.intensity = base * introEase * (0.75 + e * 0.3 + colorMix * 0.5) * (0.9 + Math.sin(time * 1.3 + index) * 0.08)
    })
  }

  dispose() {
    this.dotTexture.dispose()
    this.glowTexture.dispose()
    this.aura.geometry.dispose()
    this.materials.aura.dispose()
    if (this.aura.parent) this.aura.parent.remove(this.aura)
  }
}
