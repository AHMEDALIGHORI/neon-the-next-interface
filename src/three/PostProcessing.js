import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'

const ChromaticShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uAberration: { value: 0.18 },
    uGrain: { value: 0.035 },
    uVignette: { value: 0.55 },
    uSaturation: { value: 1.04 },
    uContrast: { value: 1.03 },
    uResolution: { value: new THREE.Vector2(1440, 900) },
    uVelocity: { value: 0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uAberration;
    uniform float uGrain;
    uniform float uVignette;
    uniform float uSaturation;
    uniform float uContrast;
    uniform vec2 uResolution;
    uniform float uVelocity;
    varying vec2 vUv;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    void main() {
      vec2 centered = vUv - 0.5;
      float radial = length(centered);
      vec2 distortion = centered * (1.0 + radial * radial * 0.014);
      vec2 uv = 0.5 + distortion;

      vec2 offset = centered * (0.0015 + uAberration * 0.009) * (0.55 + radial * 1.8);
      offset.x += uVelocity * 0.0025 * sign(centered.x + 0.0001);

      vec3 color;
      color.r = texture2D(tDiffuse, uv + offset).r;
      color.g = texture2D(tDiffuse, uv).g;
      color.b = texture2D(tDiffuse, uv - offset).b;

      float scan = 0.5 + 0.5 * sin(uv.y * uResolution.y * 1.35 + uTime * 6.0);
      color *= 1.0 - scan * 0.022;

      float grain = hash(uv * uResolution + fract(uTime) * 713.0);
      color += (grain - 0.5) * uGrain;

      float luminance = dot(color, vec3(0.2126, 0.7152, 0.0722));
      color = mix(vec3(luminance), color, uSaturation);
      color = (color - 0.5) * uContrast + 0.5;

      float vignette = smoothstep(0.92, 0.26, radial);
      color *= mix(1.0, vignette, uVignette);

      gl_FragColor = vec4(max(color, 0.0), 1.0);
    }
  `,
}

export default class PostProcessing {
  constructor(renderer, scene, camera, { mobile = false } = {}) {
    this.renderer = renderer
    this.scene = scene
    this.camera = camera
    this.mobile = mobile
    this.composer = new EffectComposer(renderer)

    this.renderPass = new RenderPass(scene, camera)
    this.composer.addPass(this.renderPass)

    const width = window.innerWidth
    const height = window.innerHeight
    this.bloom = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      mobile ? 0.42 : 0.46,
      mobile ? 0.32 : 0.4,
      mobile ? 0.88 : 0.86,
    )
    this.composer.addPass(this.bloom)

    this.chromatic = new ShaderPass(ChromaticShader)
    this.composer.addPass(this.chromatic)

    this.output = new OutputPass()
    this.composer.addPass(this.output)
  }

  resize(width, height, pixelRatio) {
    this.composer.setPixelRatio(pixelRatio)
    this.composer.setSize(width, height)
    this.bloom.resolution.set(width, height)
    this.chromatic.uniforms.uResolution.value.set(width * pixelRatio, height * pixelRatio)
    this.renderWidth = width
    this.renderHeight = height
  }

  update({ time, velocity, colorMix }) {
    this.chromatic.uniforms.uTime.value = time
    this.chromatic.uniforms.uAberration.value = 0.12 + velocity * 0.7 + colorMix * 0.65
    this.chromatic.uniforms.uGrain.value = 0.026 + velocity * 0.035 + colorMix * 0.012
    this.chromatic.uniforms.uVignette.value = 0.46 + colorMix * 0.18
    this.chromatic.uniforms.uSaturation.value = 1.02 + colorMix * 0.32
    this.chromatic.uniforms.uContrast.value = 1.03 + colorMix * 0.08
    this.chromatic.uniforms.uVelocity.value = velocity
    this.bloom.strength = (this.mobile ? 0.4 : 0.46) + colorMix * 0.36 + velocity * 0.1
    this.bloom.threshold = 0.88 - colorMix * 0.07
    this.bloom.radius = (this.mobile ? 0.3 : 0.4) + colorMix * 0.14
  }

  render() {
    this.composer.render()
  }

  dispose() {
    this.composer.dispose()
    this.bloom.dispose()
    this.chromatic.dispose()
    this.output.dispose()
  }
}
