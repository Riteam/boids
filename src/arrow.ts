import { Graphics, Application } from 'pixi.js'
import V from './V2D'
import Utils from './Utils'
import { minSpeed, maxSpeed, visionRadius } from './Config.json'
import { getTheme } from './theme'

const KNOCKED_OUT_TIME = 100
const defaultColor = 0xffff00

export default class Arrow extends V {
  v: V
  shape: Graphics
  trailShape: Graphics
  acc: V
  knocked_out: boolean
  knocked_out_time: number
  hasGlow: boolean

  constructor(
    public app: Application,
    public x: number,
    public y: number
  ) {
    super(x, y)
    this.v = V.random(Utils.randomRange(minSpeed, maxSpeed))

    this.shape = new Graphics()
    this.trailShape = new Graphics()
    this.acc = new V(0, 0)
    this.knocked_out = false
    this.knocked_out_time = 0
    // 关闭未使用的轨迹记录，避免高频内存分配导致的偶发 GC 抖动
    // 以50% 概率启用夜光，降低像素填充
    this.hasGlow = true

    // 预构建一次用于暗色主题的光圈几何，并缓存为位图，避免每帧重建几何
    // 将半径适当缩小，减少像素填充开销
    const glowRadius = Math.max(8, visionRadius)
    // 光圈使用白色填充，运行时通过 tint 映射颜色
    this.trailShape.circle(0, 0, glowRadius)
    this.trailShape.fill({ color: 0xffffff, alpha: 1 })
    this.trailShape.alpha = 0.03
    this.trailShape.visible = false
    // 启用加法混合以获得更亮的发光效果，同时降低需要的 alpha
    this.trailShape.blendMode = 'add'
  }

  move(delta: number = 1) {
    // 速度转化为位移
    // 添加0-2度的随机噪声
    if (this.knocked_out) {
      return this.dizzy(delta)
    }

    const noiseDeg = Utils.randomRange(-2, 2)
    this.v.rotate(noiseDeg * (Math.PI / 180))
    this.v.mult(0.997)
    this.v.sclAdd(this.acc, delta)
    this.v.min(minSpeed)
    this.v.max(maxSpeed)

    this.sclAdd(this.v, delta)
    this.checkBounds()
  }

  setKnockedOut() {
    this.knocked_out = true
    this.knocked_out_time = KNOCKED_OUT_TIME
  }

  // 眩晕中
  dizzy(delta: number) {
    this.knocked_out_time -= delta
    const halfTime = KNOCKED_OUT_TIME / 2
    if (this.knocked_out_time <= 1) {
      this.knocked_out = false
      return
    }
    // 前一半时间减速
    if (this.knocked_out_time > halfTime) {
      this.v.mult(0.9)
      this.v.min(0.1)
    }
    // 后一半时间恢复原速
    else {
      const progress = 1 - this.knocked_out_time / halfTime
      this.v.sclAdd(this.acc.mult(progress), delta)
      this.v.max(maxSpeed * progress)
    }

    this.sclAdd(this.v, delta)
    this.checkBounds()
  }

  checkBounds() {
    // 边界检测
    const { width, height } = this.app.screen
    if (this.x < 0) this.x = width
    if (this.x > width) this.x = 0
    if (this.y < 0) this.y = height
    if (this.y > height) this.y = 0
  }

  draw() {
    const { shape, x, y, v, trailShape } = this
    shape.clear()
    // shape.circle(0, 0, 16)
    // shape.fill({ color: 'red', alpha: 0.8 });

    const theme = getTheme()

    // 按速度映射颜色（暗色：橙->绿，亮色：原逻辑）
    let color: number = defaultColor
    if (theme === 'dark') {
      const speed = this.v.mag()
      const t = Math.max(
        0,
        Math.min(1, (speed - minSpeed) / (maxSpeed - minSpeed))
      )
      color = Utils.interpolateColor(0xffa500, 0x00ffff, t)
    } else {
      if (this.knocked_out) {
        if (this.knocked_out_time <= KNOCKED_OUT_TIME / 2) {
          const half = KNOCKED_OUT_TIME / 2
          const progress = 1 - this.knocked_out_time / half
          color = Utils.interpolateColor(0xffa500, defaultColor, progress)
        } else {
          color = 0xffa500
        }
      }
    }

    // 光圈（暗色主题下显示）：使用预构建的圆形，运行时仅更新位置和颜色
    if (theme === 'dark' && this.hasGlow) {
      trailShape.visible = true
      trailShape.x = x
      trailShape.y = y
      trailShape.tint = color
      shape.alpha = 0.8
    } else {
      trailShape.visible = false
      shape.alpha = 1
    }

    // 绘制箭头本体
    shape.moveTo(16, 0)
    shape.lineTo(-10, -10)
    shape.lineTo(-10, 10)
    shape.fill({ color })

    shape.scale.set(0.5)
    shape.x = x
    shape.y = y

    if (!v.isZero()) {
      shape.rotation = v.angle()
    }
  }
}
