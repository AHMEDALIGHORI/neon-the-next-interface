import * as THREE from 'three'

/**
 * Procedural material library. Every surface in NEON is generated locally —
 * no external 3D assets, no texture downloads.
 */
export function createMaterials({ mobile = false, capture = false } = {}) {
  const metal = capture
    ? new THREE.MeshStandardMaterial({
        color: 0x08090d,
        metalness: 1,
        roughness: 0.2,
        envMapIntensity: 1.05,
      })
    : new THREE.MeshPhysicalMaterial({
        color: 0x08090d,
        metalness: 1,
        roughness: 0.18,
        clearcoat: 0.75,
        clearcoatRoughness: 0.12,
        envMapIntensity: 1.05,
      })

  const brushed = new THREE.MeshStandardMaterial({
    color: 0x13151b,
    metalness: 0.92,
    roughness: 0.38,
    envMapIntensity: 0.9,
  })

  const ivory = new THREE.MeshStandardMaterial({
    color: 0xb9bcc4,
    metalness: 0.7,
    roughness: 0.3,
    envMapIntensity: 1.3,
  })

  const glass = capture
    ? new THREE.MeshStandardMaterial({
        color: 0x9af4ff,
        metalness: 0.25,
        roughness: 0.06,
        transparent: true,
        opacity: 0.16,
        envMapIntensity: 1.5,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    : mobile
      ? new THREE.MeshPhysicalMaterial({
          color: 0x7fe9ff,
          metalness: 0.15,
          roughness: 0.08,
          transparent: true,
          opacity: 0.14,
          clearcoat: 1,
          clearcoatRoughness: 0.05,
          envMapIntensity: 2.1,
          iridescence: 1,
          iridescenceIOR: 1.3,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      : new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          metalness: 0,
          roughness: 0.06,
          transmission: 0.94,
          thickness: 0.75,
          ior: 1.46,
          iridescence: 1,
          iridescenceIOR: 1.35,
          clearcoat: 1,
          clearcoatRoughness: 0.04,
          transparent: true,
          opacity: 1,
          envMapIntensity: 2.2,
          side: THREE.DoubleSide,
          depthWrite: false,
        })

  const darkGlass = capture
    ? new THREE.MeshStandardMaterial({
        color: 0x090d15,
        metalness: 0.35,
        roughness: 0.1,
        transparent: true,
        opacity: 0.82,
        envMapIntensity: 1.2,
        side: THREE.DoubleSide,
      })
    : new THREE.MeshPhysicalMaterial({
        color: 0x090d15,
        metalness: 0.35,
        roughness: 0.08,
        transparent: true,
        opacity: 0.82,
        clearcoat: 1,
        clearcoatRoughness: 0.03,
        envMapIntensity: 1.8,
        side: THREE.DoubleSide,
      })

  const coreShell = capture
    ? new THREE.MeshStandardMaterial({
        color: 0x060a12,
        metalness: 0.4,
        roughness: 0.1,
        transparent: true,
        opacity: 0.82,
        envMapIntensity: 1.2,
        side: THREE.DoubleSide,
      })
    : new THREE.MeshPhysicalMaterial({
        color: 0x060a12,
        metalness: 0.4,
        roughness: 0.08,
        transparent: true,
        opacity: 0.82,
        clearcoat: 1,
        clearcoatRoughness: 0.02,
        envMapIntensity: 2,
        side: THREE.DoubleSide,
      })

  const emissive = (hex, intensity = 2) =>
    new THREE.MeshStandardMaterial({
      color: 0x020304,
      emissive: new THREE.Color(hex),
      emissiveIntensity: intensity,
      metalness: 0.2,
      roughness: 0.4,
      toneMapped: true,
    })

  const materials = {
    metal,
    brushed,
    ivory,
    glass,
    darkGlass,
    coreShell,
    cyan: emissive(0x22f0ff, 2.1),
    pink: emissive(0xff2fb9, 2),
    orange: emissive(0xff6a1a, 1.9),
    acid: emissive(0xc8ff2e, 1.8),
    violet: emissive(0xa25cff, 1.9),
    white: emissive(0xdffcff, 1.15),
    lineCyan: new THREE.LineBasicMaterial({ color: 0x22f0ff, transparent: true, opacity: 0.7 }),
    linePink: new THREE.LineBasicMaterial({ color: 0xff2fb9, transparent: true, opacity: 0.6 }),
    lineWhite: new THREE.LineBasicMaterial({ color: 0xaaaeb8, transparent: true, opacity: 0.24 }),
    glow: null,
  }

  materials.core = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 1 },
      uColorA: { value: new THREE.Color(0x22f0ff) },
      uColorB: { value: new THREE.Color(0xff2fb9) },
      uColorC: { value: new THREE.Color(0x3d5bff) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vView;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vPosition = position;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = viewMatrix * worldPosition;
        vView = normalize(-mvPosition.xyz);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uIntensity;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform vec3 uColorC;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec3 vView;

      float hash(vec3 p) {
        p = fract(p * 0.3183099 + 0.1);
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
      }

      float noise(vec3 p) {
        vec3 i = floor(p);
        vec3 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
          mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
          f.z
        );
      }

      void main() {
        float fresnel = pow(1.0 - max(0.0, dot(normalize(vNormal), normalize(vView))), 2.0);
        float pulse = 0.5 + 0.5 * sin(uTime * 2.2 + vPosition.y * 4.0);
        float flow = noise(vPosition * 3.1 + vec3(uTime * 0.45, uTime * 0.3, uTime * 0.25));
        float veins = smoothstep(0.48, 0.8, noise(vPosition * 6.0 - vec3(uTime * 0.2)));
        vec3 color = mix(uColorC, uColorA, flow);
        color = mix(color, uColorB, veins * 0.75);
        color += vec3(1.0, 0.95, 0.9) * fresnel * 0.7;
        color *= (0.85 + pulse * 0.55 + fresnel * 1.2) * uIntensity;
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    toneMapped: false,
  })

  materials.aura = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uColorA: { value: new THREE.Color(0x22f0ff) },
      uColorB: { value: new THREE.Color(0xa25cff) },
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
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying vec2 vUv;
      void main() {
        vec2 p = vUv - 0.5;
        float d = length(p);
        float ring = smoothstep(0.5, 0.28, d) * smoothstep(0.12, 0.3, d);
        float wobble = 0.5 + 0.5 * sin(atan(p.y, p.x) * 5.0 + uTime * 1.4);
        float alpha = ring * (0.55 + wobble * 0.45) * uOpacity;
        vec3 color = mix(uColorA, uColorB, vUv.x + sin(uTime * 0.4) * 0.2);
        gl_FragColor = vec4(color, alpha);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false,
  })

  return materials
}

export function createGlowTexture() {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.16, 'rgba(190,240,255,0.8)')
  gradient.addColorStop(0.42, 'rgba(90,130,255,0.24)')
  gradient.addColorStop(1, 'rgba(20,20,40,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  return texture
}

export function createDotTexture() {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.25, 'rgba(255,255,255,0.8)')
  gradient.addColorStop(0.65, 'rgba(255,255,255,0.12)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  context.fillStyle = gradient
  context.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}
