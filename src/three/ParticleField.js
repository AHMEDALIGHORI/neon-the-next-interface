import * as THREE from 'three'

/**
 * Ambient dust that follows the camera through every chapter. It is cheap
 * (one draw call), reacts to cursor position and brightens with scroll speed.
 */
export default class ParticleField {
  constructor(scene, { mobile = false, capture = false } = {}) {
    this.scene = scene
    this.count = mobile ? 320 : capture ? 560 : 900
    this.group = new THREE.Group()
    this.group.name = 'AMBIENT-DUST'
    scene.add(this.group)
    this.viewportHeight = window.innerHeight * Math.min(window.devicePixelRatio, 1.5)

    const positions = new Float32Array(this.count * 3)
    const colors = new Float32Array(this.count * 3)
    const sizes = new Float32Array(this.count)
    const seeds = new Float32Array(this.count)
    const palette = [0x22f0ff, 0xffffff, 0xa25cff, 0x3d5bff, 0xff2fb9]
    const color = new THREE.Color()

    for (let i = 0; i < this.count; i += 1) {
      const radius = 3 + Math.pow(Math.random(), 0.5) * 15
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      positions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius
      positions[i * 3 + 1] = Math.cos(phi) * radius * 0.72
      positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius * 0.82

      color.setHex(palette[i % palette.length])
      const brightness = 0.35 + Math.random() * 0.65
      colors[i * 3] = color.r * brightness
      colors[i * 3 + 1] = color.g * brightness
      colors[i * 3 + 2] = color.b * brightness
      sizes[i] = 0.018 + Math.random() * 0.055
      seeds[i] = Math.random()
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20)

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0 },
        uViewportHeight: { value: this.viewportHeight },
        uMouse: { value: new THREE.Vector2() },
        uSpeed: { value: 0 },
      },
      vertexShader: /* glsl */ `
        attribute vec3 aColor;
        attribute float aSize;
        attribute float aSeed;
        uniform float uTime;
        uniform float uViewportHeight;
        uniform vec2 uMouse;
        uniform float uSpeed;
        varying vec3 vColor;
        varying float vTwinkle;

        void main() {
          vec3 p = position;
          p.y += sin(uTime * 0.12 + aSeed * 8.0) * 0.5;
          p.x += cos(uTime * 0.08 + aSeed * 12.0) * 0.35;
          p.x += uMouse.x * (1.0 + aSeed * 2.0);
          p.y += uMouse.y * (0.6 + aSeed * 1.2);
          p.z += uSpeed * (0.5 + aSeed * 1.5);

          vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          gl_PointSize = clamp(aSize * uViewportHeight * 0.5 / max(1.0, -mvPosition.z), 1.0, 5.5);
          vColor = aColor;
          vTwinkle = 0.45 + 0.55 * sin(uTime * 0.8 + aSeed * 31.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uOpacity;
        varying vec3 vColor;
        varying float vTwinkle;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float alpha = smoothstep(0.5, 0.03, d) * uOpacity * (0.25 + vTwinkle * 0.85);
          if (alpha < 0.002) discard;
          gl_FragColor = vec4(vColor * (0.8 + vTwinkle), alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
      toneMapped: false,
    })

    this.points = new THREE.Points(geometry, this.material)
    this.points.frustumCulled = false
    this.group.add(this.points)
  }

  setViewport(width, height, pixelRatio) {
    this.viewportHeight = height * pixelRatio
    this.material.uniforms.uViewportHeight.value = this.viewportHeight
  }

  update({ time, opacity, mouse, velocity }) {
    this.group.visible = opacity > 0.004
    if (!this.group.visible) return
    this.material.uniforms.uTime.value = time
    this.material.uniforms.uOpacity.value = opacity
    this.material.uniforms.uMouse.value.set(mouse.x, mouse.y)
    this.material.uniforms.uSpeed.value = Math.min(1, velocity * 1.4)
    this.group.rotation.y = time * 0.008 + mouse.x * 0.03
    this.group.rotation.x = Math.sin(time * 0.04) * 0.04
  }

  dispose() {
    this.points.geometry.dispose()
    this.material.dispose()
    this.scene.remove(this.group)
  }
}
