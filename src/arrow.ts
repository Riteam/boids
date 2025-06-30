import { Graphics, Application } from "pixi.js";
import V from "./V2D";
import Utils from "./Utils";
import { minSpeed, maxSpeed } from "./Config.json"

export default class Arrow extends V {
  v: V;
  shape: Graphics;
  desired: V;
  knocked_out: boolean
  knocked_out_time: number

  constructor(public app: Application, public x: number, public y: number) {
    super(x, y)
    this.v = V.random(minSpeed + Utils.random() * (maxSpeed - minSpeed))

    this.shape = new Graphics()
    this.desired = new V(0, 0)
    this.knocked_out = false
    this.knocked_out_time = 0
  }

  move(delta: number = 1) {
    // 速度转化为位移
    // 添加0-2度的随机噪声

    const noiseDeg = -2 + Utils.random() * 4; // -2到2度
    const noiseRad = noiseDeg * Math.PI / 180;
    this.v.rotate(noiseRad);

    this.v.sclAdd(this.desired, delta)
    this.v.min(this.knocked_out ? minSpeed : minSpeed)
    this.v.max(maxSpeed)

    if (this.knocked_out) {
      this.v.mult(0.5)
      this.knocked_out_time -= delta
      if (this.knocked_out_time <= 10) {
        this.v.zero()
      }
      if (this.knocked_out_time <= 1) {
        this.knocked_out = false
      }
    }

    this.sclAdd(this.v, delta);
    this.checkBounds()



  }

  checkBounds() {
    // 边界检测
    const { width, height } = this.app.screen
    if (this.x < 0) this.x = width;
    if (this.x > width) this.x = 0;
    if (this.y < 0) this.y = height;
    if (this.y > height) this.y = 0;
  }

  draw() {
    const { shape, x, y, v } = this
    shape.clear()
    // shape.circle(0, 0, 16)
    // shape.fill({ color: 'red', alpha: 0.8 });
    shape.moveTo(16, 0);
    shape.lineTo(-10, -10);
    shape.lineTo(-10, 10);
    // shape.lineTo(12, 0);
    shape.fill({ color: this.knocked_out ? 'red' : 'yellow' });


    shape.scale.set(0.6)
    shape.x = x
    shape.y = y

    if (!v.isZero()) {
      shape.rotation = v.angle();
    }

  }
}