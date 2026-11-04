import * as THREE from 'three'
import { damp, lerp } from '../lib/motionState'

const clamp01 = (x) => Math.min(1, Math.max(0, x))
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const easeOut = (x) => 1 - Math.pow(1 - x, 3)

/**
 * One continuous camera move across all seven chapters.
 *
 * The path is intentionally authored as a single film: push in on the arrival,
 * orbit the core, drift through the neural field, fly through the spatial
 * corridor, then swing out through the colour explosion into the final frame.
 */
export default class CameraRig {
  constructor(camera, { mobile = false, reduced = false } = {}) {
    this.camera = camera
    this.mobile = mobile
    this.reduced = reduced
    this.position = new THREE.Vector3(0, 0.65, 11.5)
    this.desired = new THREE.Vector3()
    this.look = new THREE.Vector3(0, 0, 0)
    this.desiredLook = new THREE.Vector3()
    this.smoothMouse = new THREE.Vector2()
    this.initialized = false
    this.fov = 46
    this.desiredFov = 46
    this.aspect = window.innerWidth / window.innerHeight
    this.distanceFactor = this.aspect < 0.72 ? 1.46 : this.aspect < 1.1 ? 1.18 : 1
    this.time = 0
  }

  resize(width, height) {
    this.aspect = width / height
    this.distanceFactor = this.aspect < 0.72 ? 1.46 : this.aspect < 1.1 ? 1.18 : 1
    this.mobile = width < 820
  }

  update(stage, time, dt, mouse, velocity = 0) {
    this.time = time
    const segment = Math.min(6, Math.floor(stage + 1e-6))
    const inside = clamp01(stage - segment)
    const factor = this.distanceFactor

    // Desired look target drifts slightly for a more alive frame.
    this.desiredLook.set(
      Math.sin(time * 0.23) * 0.06 + this.smoothMouse.x * 0.16,
      Math.cos(time * 0.19) * 0.04 + this.smoothMouse.y * 0.1,
      0,
    )

    if (segment === 0) {
      const t = easeInOut(inside)
      this.desired.set(lerp(0, 2.0, t), lerp(0.65, 1.2, t), lerp(11.5, 8.8, t))
      this.desiredFov = lerp(46, 44, t)
      this.desiredLook.y += -0.02
    } else if (segment === 1) {
      const t = easeInOut(inside)
      this.desired.set(lerp(2.0, 4.6, t), lerp(1.2, 1.6, t), lerp(8.8, 11.2, t))
      this.desiredFov = lerp(44, 41, t)
      this.desiredLook.y += 0.02
    } else if (segment === 2) {
      const t = easeInOut(inside)
      this.desired.set(lerp(4.6, 0.15, t), lerp(1.6, 1.0, t), lerp(11.2, 14.5, t))
      this.desiredFov = lerp(41, 44, t)
      this.desiredLook.y += 0.04
    } else if (segment === 3) {
      const t = easeInOut(inside)
      this.desired.set(
        Math.sin(inside * Math.PI * 2) * 2.9 * (this.mobile ? 0.8 : 1),
        lerp(1.0, 0.55, t) + Math.sin(inside * Math.PI * 2) * 0.6,
        lerp(14.5, 4.0, t),
      )
      this.desiredFov = lerp(44, 52, t)
      this.desiredLook.y += 0.03
    } else if (segment === 4) {
      const t = easeOut(inside)
      const theta = -0.9 * easeInOut(inside)
      const radius = lerp(4.0, 8.3, t)
      this.desired.set(Math.sin(theta) * radius, lerp(0.55, 1.4, t), Math.cos(theta) * radius)
      this.desiredFov = lerp(52, 40, t)
      this.desiredLook.y += 0.05
    } else if (segment === 5) {
      const t = easeInOut(inside)
      const theta = lerp(-0.9, 1.2, t)
      const radius = 8.3
      this.desired.set(Math.sin(theta) * radius, lerp(1.4, 1.2, t), Math.cos(theta) * radius)
      this.desiredFov = lerp(40, 36, t)
      this.desiredLook.y += 0.04
    } else {
      const t = easeInOut(inside)
      this.desired.set(lerp(7.74, 0, t), lerp(1.2, 1.25, t), lerp(3.0, 15.5, t))
      this.desiredFov = lerp(36, 30, t)
      this.desiredLook.y += 0.02
    }

    this.desired.x *= factor
    this.desired.z *= factor
    this.desired.y *= this.mobile ? 1.06 : 1

    if (!this.reduced) {
      this.desired.x += Math.sin(time * 0.31) * 0.022 + Math.sin(time * 1.7) * 0.007
      this.desired.y += Math.cos(time * 0.27) * 0.018
      this.desired.z += Math.sin(time * 0.21) * 0.02
    }

    this.smoothMouse.x = damp(this.smoothMouse.x, mouse.x, 3.5, dt)
    this.smoothMouse.y = damp(this.smoothMouse.y, mouse.y, 3.5, dt)
    this.desired.x += this.smoothMouse.x * (this.mobile ? 0.14 : 0.38)
    this.desired.y += this.smoothMouse.y * (this.mobile ? 0.1 : 0.26)

    if (!this.initialized) {
      this.position.copy(this.desired)
      this.look.copy(this.desiredLook)
      this.fov = this.desiredFov
      this.initialized = true
    } else {
      const posLambda = 9
      this.position.x = damp(this.position.x, this.desired.x, posLambda, dt)
      this.position.y = damp(this.position.y, this.desired.y, posLambda, dt)
      this.position.z = damp(this.position.z, this.desired.z, posLambda, dt)
      this.look.x = damp(this.look.x, this.desiredLook.x, 7, dt)
      this.look.y = damp(this.look.y, this.desiredLook.y, 7, dt)
      this.look.z = damp(this.look.z, this.desiredLook.z, 7, dt)
      this.fov = damp(this.fov, this.desiredFov, 7, dt)
    }

    this.camera.position.copy(this.position)
    this.camera.lookAt(this.look)

    if (!this.reduced) {
      this.camera.rotateZ(Math.sin(time * 0.17) * 0.004 + velocity * 0.008)
    }

    const mobileBoost = this.mobile ? 7 : 0
    const targetFov = this.fov + mobileBoost
    if (Math.abs(this.camera.fov - targetFov) > 0.005) {
      this.camera.fov = targetFov
      this.camera.updateProjectionMatrix()
    }
  }
}
