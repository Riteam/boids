import { Graphics, Application } from 'pixi.js'
import V from './V2D'
import Utils from './Utils'
import { minSpeed, maxSpeed } from './Config.json'

const KNOCKED_OUT_TIME = 100
const defaultColor = 0xffff00

export default class Arrow extends V {
  v: V
  shape: Graphics
  acc: V
  knocked_out: boolean
  knocked_out_time: number

  constructor(
    public app: Application,
    public x: number,
    public y: number
  ) {
    super(x, y)
    this.v = V.random(Utils.randomRange(minSpeed, maxSpeed))

    this.shape = new Graphics()
    this.acc = new V(0, 0)
    this.knocked_out = false
    this.knocked_out_time = 0
  }

  move(delta: number = 1) {
    // 速度转化为位移
    // 添加0-2度的随机噪声
    if (this.knocked_out) {
      return this.dizzy(delta)
    }

    const noiseDeg = Utils.randomRange(-1, 1)
    this.v.rotate(noiseDeg * (Math.PI / 80))
    this.v.mult(0.995)
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
    const { shape, x, y, v } = this
    shape.clear()
    // shape.circle(0, 0, 16)
    // shape.fill({ color: 'red', alpha: 0.8 });
    shape.moveTo(16, 0)
    shape.lineTo(-10, -10)
    shape.lineTo(-10, 10)
    // shape.lineTo(12, 0);

    let color: number = defaultColor // 黄色

    if (this.knocked_out) {
      if (this.knocked_out_time <= KNOCKED_OUT_TIME / 2) {
        const half = KNOCKED_OUT_TIME / 2
        // 根据knocked_out_time计算颜色过渡
        const progress = 1 - this.knocked_out_time / half
        color = Utils.interpolateColor(0xff0000, defaultColor, progress) // 从红色过渡到黄色
      } else {
        color = 0xff0000
      }
    }

    shape.fill({ color })

    shape.scale.set(0.5)
    shape.x = x
    shape.y = y

    if (!v.isZero()) {
      shape.rotation = v.angle()
    }
  }
}
