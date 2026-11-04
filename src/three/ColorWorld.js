import * as THREE from 'three'
import { createGlowTexture } from './Materials'

const COLOR_PALETTE = [0xff2fb9, 0xff6a1a, 0xffe74a, 0xc8ff2e, 0x22f0ff, 0x3d5bff, 0xa25cff, 0xffffff]

function createFluidRibbon(points, color) {
  const curve = new THREE.CatmullRomCurve3(points, true, 'catmullrom', 0.5)
  const geometry = new THREE.TubeGeometry(curve, 220, 0.024, 7, true)
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  })
  return new THREE.Mesh(geometry, material)
}

/**
 * The chroma engine: a full-screen procedural sky, a fluid-like field of
 * colour particles and three orbital ribbons. It is always behind everything
 * and grows from a near-black fog into a full spectrum explosion.
 */
export default class ColorWorld {
  constructor(scene, { mobile = false, capture = false } = {}) {
    this.scene = scene
    this.mobile = mobile
    this.capture = capture
    this.group = new THREE.Group()
    this.group.name = 'CHROMA-ENGINE'
    scene.add(this.group)
    this.colorMix = 0
    this.viewportHeight = window.innerHeight * Math.min(window.devicePixelRatio, 1.5)
    this.colors = COLOR_PALETTE.map((hex) => new THREE.Color(hex))

    this.buildSky()
    this.buildParticles()
    this.buildRibbons()
    this.buildMist()
  }

  buildSky() {
    this.skyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColorMix: { value: 0 },
        uIntensity: { value: 1 },
        uA: { value: this.colors[0] },
        uB: { value: this.colors[5] },
        uC: { value: this.colors[6] },
        uD: { value: this.colors[4] },
        uE: { value: this.colors[1] },
        uCapture: { value: this.capture ? 1 : 0 },
      },
      vertexShader: /* glsl */ `
        varying vec3 vDirection;
        varying vec2 vUv;
        void main() {
          vDirection = normalize(position);
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        uniform float uColorMix;
        uniform float uIntensity;
        uniform vec3 uA;
        uniform vec3 uB;
        uniform vec3 uC;
        uniform vec3 uD;
        uniform vec3 uE;
        uniform float uCapture;
        varying vec3 vDirection;
        varying vec2 vUv;

        float hash(vec3 p) {
          p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
          p *= 17.0;
          return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
        }

        float noise(vec3 x) {
          vec3 i = floor(x);
          vec3 f = fract(x);
          f = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
            mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
            f.z
          );
        }

        float fbm(vec3 p) {
          float value = 0.0;
          float amplitude = 0.55;
          for (int i = 0; i < 4; i++) {
            value += amplitude * noise(p);
            p *= 2.05;
            amplitude *= 0.48;
          }
          return value;
        }

        void main() {
          vec3 dir = normalize(vDirection);
          vec2 centeredUv = vUv - vec2(0.5, 0.5);
          float radial = length(centeredUv);

          // Lighter background path used while capturing the cinematic video.
          if (uCapture > 0.5) {
            float q = noise(dir * 2.6 + vec3(0.0, uTime * 0.016, uTime * 0.01));
            float q2 = noise(dir * 5.4 - vec3(uTime * 0.012, 0.0, uTime * 0.018));
            vec3 baseQ = mix(vec3(0.004, 0.004, 0.009), vec3(0.012, 0.011, 0.028), smoothstep(-1.0, 1.0, dir.y));
            baseQ += vec3(0.012, 0.016, 0.034) * q * 0.7;
            vec3 auroraQ = uA * smoothstep(0.48, 0.9, q) * 0.4;
            auroraQ += uB * smoothstep(0.44, 0.92, q2) * 0.32;
            auroraQ += uC * smoothstep(0.52, 0.95, q + q2) * 0.24;
            auroraQ += uD * smoothstep(0.5, 0.94, q2) * 0.18;
            auroraQ += uE * smoothstep(0.58, 0.97, q + q2) * 0.24;
            vec3 colorQ = mix(baseQ, auroraQ * (0.16 + uColorMix * 0.95), 0.1 + uColorMix * 0.9);
            colorQ += auroraQ * pow(max(0.0, 1.0 - abs(dir.y + 0.1) * 1.8), 3.0) * (0.04 + uColorMix * 0.1);
            colorQ += mix(uC, uA, 0.5) * exp(-radial * 6.0) * (0.012 + uColorMix * 0.08);
            colorQ *= mix(0.5, 1.0, smoothstep(0.04, 0.58, radial));
            float starQ = step(0.9984, hash(floor(dir * 460.0)));
            colorQ += vec3(0.55, 0.7, 1.0) * starQ * (1.0 - uColorMix * 0.65);
            colorQ *= uIntensity;
            gl_FragColor = vec4(colorQ, 1.0);
            return;
          }

          float n = fbm(dir * 2.4 + vec3(0.0, uTime * 0.018, uTime * 0.012));
          float n2 = fbm(dir * 4.7 - vec3(uTime * 0.022, 0.0, uTime * 0.017));
          float n3 = fbm(dir * 8.0 + vec3(uTime * 0.03));

          vec3 base = mix(vec3(0.004, 0.004, 0.009), vec3(0.012, 0.011, 0.028), smoothstep(-1.0, 1.0, dir.y));
          base += vec3(0.012, 0.016, 0.034) * n * 0.7;

          vec3 aurora = uA * smoothstep(0.52, 0.9, n) * 0.36;
          aurora += uB * smoothstep(0.46, 0.92, n2) * 0.28;
          aurora += uC * smoothstep(0.56, 0.94, n3) * 0.2;
          aurora += uD * smoothstep(0.5, 0.92, n + n2) * 0.16;
          aurora += uE * smoothstep(0.64, 0.98, n2 + n3) * 0.22;

          float horizon = pow(max(0.0, 1.0 - abs(dir.y + 0.1) * 1.8), 3.0);
          vec3 color = mix(base, aurora * (0.18 + uColorMix * 0.82), 0.1 + uColorMix * 0.9);
          color += aurora * horizon * (0.05 + uColorMix * 0.12);

          // A soft chromatic sun behind the device, with a darker iris so the
          // hardware always reads against the colour field.
          color += mix(uC, uA, smoothstep(0.2, 0.9, n)) * exp(-radial * 6.0) * (0.015 + uColorMix * 0.1);
          color *= mix(0.5, 1.0, smoothstep(0.04, 0.58, radial));

          // Sparse stars in the dark.
          float star = step(0.9984, hash(floor(dir * 460.0)));
          color += vec3(0.55, 0.7, 1.0) * star * (1.0 - uColorMix * 0.65);

          // Subtle vertical scan.
          color *= 0.965 + 0.035 * sin(vUv.y * 700.0 + uTime * 0.6);
          color *= uIntensity;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: true,
      toneMapped: false,
      fog: false,
    })
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(78, 64, 40), this.skyMaterial)
    this.sky.renderOrder = -20
    this.sky.frustumCulled = false
    this.group.add(this.sky)
  }

  buildParticles() {
    this.count = this.mobile ? 900 : this.capture ? 1100 : 1900
    const positions = new Float32Array(this.count * 3)
    const colors = new Float32Array(this.count * 3)
    const seeds = new Float32Array(this.count)
    const speeds = new Float32Array(this.count)
    const sizes = new Float32Array(this.count)
    const color = new THREE.Color()

    for (let i = 0; i < this.count; i += 1) {
      const radius = 2.2 + Math.pow(Math.random(), 0.62) * 5.2
      const phi = Math.acos(Math.random() * 2 - 1)
      const theta = Math.random() * Math.PI * 2
      positions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius
      positions[i * 3 + 1] = Math.cos(phi) * radius * 0.74
      positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius

      color.setHex(COLOR_PALETTE[i % COLOR_PALETTE.length])
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b

      seeds[i] = Math.random()
      speeds[i] = 0.12 + Math.random() * 0.7
      sizes[i] = 0.015 + Math.random() * 0.05
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 9)

    this.particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0 },
        uViewportHeight: { value: this.viewportHeight },
        uMouse: { value: new THREE.Vector2() },
      },
      vertexShader: /* glsl */ `
        attribute vec3 aColor;
        attribute float aSeed;
        attribute float aSpeed;
        attribute float aSize;
        uniform float uTime;
        uniform float uViewportHeight;
        uniform vec2 uMouse;
        varying vec3 vColor;
        varying float vTwinkle;

        void main() {
          vec3 p = position;
          float angle = uTime * aSpeed * 0.35 + aSeed * 6.2831;
          float c = cos(angle);
          float s = sin(angle);
          p.xz = mat2(c, -s, s, c) * p.xz;
          p.y += sin(uTime * 0.9 + aSeed * 15.0) * 0.28;
          p += normalize(p + 0.0001) * sin(uTime * 1.6 + aSeed * 9.0) * 0.11;
          p.x += uMouse.x * (0.4 + aSeed * 0.5);
          p.y += uMouse.y * (0.3 + aSeed * 0.4);

          vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = clamp(aSize * uViewportHeight * 0.5 / max(1.0, -mvPosition.z), 1.0, 12.0);
          vColor = aColor;
          vTwinkle = 0.55 + 0.45 * sin(uTime * 2.1 + aSeed * 28.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uOpacity;
        varying vec3 vColor;
        varying float vTwinkle;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float alpha = smoothstep(0.5, 0.02, d) * uOpacity * (0.4 + vTwinkle * 0.7);
          if (alpha < 0.002) discard;
          gl_FragColor = vec4(vColor * (1.3 + vTwinkle), alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    })

    this.particles = new THREE.Points(geometry, this.particleMaterial)
    this.particles.frustumCulled = false
    this.particles.renderOrder = 3
    this.group.add(this.particles)
  }

  buildRibbons() {
    this.ribbons = []
    const configs = [0xff2fb9, 0x22f0ff, 0xc8ff2e, 0xff6a1a]
    configs.forEach((color, ribbonIndex) => {
      const points = []
      const segments = 14
      for (let i = 0; i < segments; i += 1) {
        const angle = (i / segments) * Math.PI * 2
        const radius = 2.2 + ribbonIndex * 0.38 + Math.sin(angle * 3 + ribbonIndex) * 0.5
        points.push(
          new THREE.Vector3(
            Math.cos(angle) * radius,
            Math.sin(angle * 2 + ribbonIndex * 1.2) * 1.1,
            Math.sin(angle) * radius,
          ),
        )
      }
      const ribbon = createFluidRibbon(points, color)
      ribbon.rotation.set(ribbonIndex * 0.7, ribbonIndex * 1.2, ribbonIndex * 0.4)
      this.group.add(ribbon)
      this.ribbons.push({
        mesh: ribbon,
        material: ribbon.material,
        baseRotation: ribbon.rotation.clone(),
        phase: ribbonIndex * 1.4,
        speed: 0.1 + ribbonIndex * 0.035,
      })
    })
  }

  buildMist() {
    this.glowTexture = createGlowTexture()
    this.mist = []
    const configs = [
      { color: 0xff2fb9, position: [-4.6, 1.8, -2.5], scale: 13 },
      { color: 0x22f0ff, position: [4.8, -1.2, -1.4], scale: 10 },
      { color: 0xff6a1a, position: [0, 3.1, -5.2], scale: 14 },
      { color: 0xa25cff, position: [1.4, -3.2, -3.0], scale: 11 },
    ]
    configs.forEach((config) => {
      const material = new THREE.SpriteMaterial({
        map: this.glowTexture,
        color: config.color,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      })
      const sprite = new THREE.Sprite(material)
      sprite.position.set(...config.position)
      sprite.scale.setScalar(config.scale)
      sprite.renderOrder = 2
      this.group.add(sprite)
      this.mist.push({ sprite, basePosition: sprite.position.clone(), scale: config.scale, phase: Math.random() * 6 })
    })
  }

  setViewport(width, height, pixelRatio) {
    this.viewportHeight = height * pixelRatio
    this.particleMaterial.uniforms.uViewportHeight.value = this.viewportHeight
  }

  update({ backgroundMix = 0, chroma = 0, time, mouse, velocity }) {
    this.colorMix = chroma
    const skyMix = Math.min(1, backgroundMix)
    this.skyMaterial.uniforms.uTime.value = time
    this.skyMaterial.uniforms.uColorMix.value = skyMix
    this.skyMaterial.uniforms.uIntensity.value = 0.85 + skyMix * 0.08

    this.particleMaterial.uniforms.uTime.value = time
    this.particleMaterial.uniforms.uOpacity.value = chroma * 0.62
    this.particleMaterial.uniforms.uMouse.value.set(mouse.x, mouse.y)
    this.particles.rotation.y = time * 0.035
    this.particles.rotation.x = Math.sin(time * 0.1) * 0.08
    this.particles.scale.setScalar(0.92 + chroma * 0.16 + Math.sin(time * 0.8) * 0.015)

    this.ribbons.forEach((ribbon, index) => {
      ribbon.material.opacity = chroma * (0.4 + index * 0.05)
      ribbon.mesh.rotation.x = ribbon.baseRotation.x + time * ribbon.speed
      ribbon.mesh.rotation.y = ribbon.baseRotation.y + time * ribbon.speed * 0.8
      ribbon.mesh.rotation.z = ribbon.baseRotation.z + Math.sin(time * 0.35 + ribbon.phase) * 0.2
      ribbon.mesh.scale.setScalar(0.94 + chroma * 0.12 + Math.sin(time * 0.7 + ribbon.phase) * 0.03)
    })

    this.mist.forEach((item, index) => {
      item.sprite.material.opacity = chroma * (0.075 + index * 0.01)
      item.sprite.position.x = item.basePosition.x + Math.sin(time * 0.22 + item.phase) * 0.6
      item.sprite.position.y = item.basePosition.y + Math.cos(time * 0.18 + item.phase) * 0.45
      item.sprite.scale.setScalar(item.scale * (0.92 + Math.sin(time * 0.4 + index) * 0.06 + chroma * 0.12))
    })

    this.group.rotation.z = Math.sin(time * 0.045) * 0.04 + velocity * 0.02
  }

  dispose() {
    this.sky.geometry.dispose()
    this.skyMaterial.dispose()
    this.particles.geometry.dispose()
    this.particleMaterial.dispose()
    this.ribbons.forEach((ribbon) => {
      ribbon.mesh.geometry.dispose()
      ribbon.material.dispose()
    })
    this.mist.forEach((item) => item.sprite.material.dispose())
    this.glowTexture.dispose()
    this.scene.remove(this.group)
  }
}
