import * as THREE from 'three'

const LABELS = [
  { key: 'CORE', index: '01', meta: 'NEURAL SILICON / 4NM', offset: new THREE.Vector2(2.35, 0.5), color: 0x22f0ff },
  { key: 'MEMORY', index: '02', meta: 'CONTINUUM / 2TB', offset: new THREE.Vector2(-2.55, 1.05), color: 0xc8ff2e },
  { key: 'VISION', index: '03', meta: 'SPATIAL FIELD / 180°', offset: new THREE.Vector2(2.5, 1.65), color: 0x3d5bff },
  { key: 'VOICE', index: '04', meta: 'MICRO ARRAY / 360°', offset: new THREE.Vector2(-2.65, -1.3), color: 0xff2fb9 },
  { key: 'MOTION', index: '05', meta: 'HAPTIC MESH / 12K', offset: new THREE.Vector2(1.55, -2.25), color: 0xff6a1a },
]

function createLabelTexture(label) {
  const width = 720
  const height = 190
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  context.clearRect(0, 0, width, height)

  const hex = `#${label.color.toString(16).padStart(6, '0')}`
  context.shadowColor = 'rgba(0,0,0,0.95)'
  context.shadowBlur = 18

  context.fillStyle = hex
  context.fillRect(0, 32, 52, 2)
  context.beginPath()
  context.arc(63, 33, 3, 0, Math.PI * 2)
  context.fill()

  context.font = '500 20px "Space Grotesk", Arial, sans-serif'
  context.fillStyle = 'rgba(244,243,238,0.5)'
  context.fillText(label.index, 84, 40)

  context.font = '700 58px "Unbounded", "Space Grotesk", Arial, sans-serif'
  context.fillStyle = 'rgba(244,243,238,0.98)'
  context.fillText(label.key, 0, 112)

  context.font = '500 19px "Space Grotesk", Arial, sans-serif'
  context.fillStyle = 'rgba(244,243,238,0.5)'
  context.fillText(label.meta, 0, 150)

  context.font = '500 17px "Space Grotesk", Arial, sans-serif'
  context.fillStyle = hex
  context.fillText('+', 690, 40)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  return texture
}

/**
 * Physically anchored technical labels and leader lines, redrawn every frame so
 * they stay attached to the exploded hardware as the camera orbits.
 */
export default class DeviceLabels {
  constructor(scene, device, { mobile = false } = {}) {
    this.scene = scene
    this.device = device
    this.mobile = mobile
    this.group = new THREE.Group()
    this.group.name = 'DEVICE-ANNOTATIONS'
    scene.add(this.group)
    this.items = []
    this.anchor = new THREE.Vector3()
    this.labelPosition = new THREE.Vector3()
    this.right = new THREE.Vector3()
    this.up = new THREE.Vector3()
    this.elbow = new THREE.Vector3()

    if (mobile) return

    LABELS.forEach((label, index) => {
      const texture = createLabelTexture(label)
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        depthTest: false,
        depthWrite: false,
      })
      const sprite = new THREE.Sprite(material)
      sprite.renderOrder = 30
      this.group.add(sprite)

      const positions = new Float32Array(9)
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      const lineMaterial = new THREE.LineBasicMaterial({
        color: label.color,
        transparent: true,
        opacity: 0,
        depthTest: false,
        depthWrite: false,
      })
      const line = new THREE.Line(geometry, lineMaterial)
      line.renderOrder = 29
      line.frustumCulled = false
      this.group.add(line)

      this.items.push({
        ...label,
        sprite,
        line,
        material,
        lineMaterial,
        positions,
        geometry,
        distance: 8,
        seed: index * 1.7,
      })
    })
  }

  update(camera, opacity, time) {
    if (this.mobile) return
    this.group.visible = opacity > 0.005
    if (!this.group.visible) return

    const matrix = camera.matrixWorld.elements
    this.right.set(matrix[0], matrix[1], matrix[2]).normalize()
    this.up.set(matrix[4], matrix[5], matrix[6]).normalize()

    this.items.forEach((item) => {
      this.device.getAnchor(item.key, this.anchor)
      this.labelPosition
        .copy(this.anchor)
        .addScaledVector(this.right, item.offset.x + Math.sin(time * 0.45 + item.seed) * 0.03)
        .addScaledVector(this.up, item.offset.y + Math.cos(time * 0.4 + item.seed) * 0.03)

      const distance = camera.position.distanceTo(this.labelPosition)
      item.distance = distance
      const width = distance * 0.16
      item.sprite.scale.set(width, width * 0.264, 1)
      item.sprite.position.copy(this.labelPosition)
      item.sprite.material.opacity = opacity
      item.sprite.material.rotation = 0

      const sign = Math.sign(item.offset.x) || 1
      this.elbow
        .copy(this.anchor)
        .addScaledVector(this.right, sign * 0.38)
        .addScaledVector(this.up, item.offset.y * 0.08)
      const labelEdge = this.labelPosition.clone().addScaledVector(this.right, -sign * width * 0.42)

      item.positions[0] = this.anchor.x
      item.positions[1] = this.anchor.y
      item.positions[2] = this.anchor.z
      item.positions[3] = this.elbow.x
      item.positions[4] = this.elbow.y
      item.positions[5] = this.elbow.z
      item.positions[6] = labelEdge.x
      item.positions[7] = labelEdge.y
      item.positions[8] = labelEdge.z
      item.geometry.attributes.position.needsUpdate = true
      item.lineMaterial.opacity = opacity * 0.55
    })
  }

  dispose() {
    this.items.forEach((item) => {
      item.material.map?.dispose()
      item.material.dispose()
      item.lineMaterial.dispose()
      item.geometry.dispose()
    })
    this.scene.remove(this.group)
  }
}
