import { Graphics, Application } from "pixi.js";
import V from "./V2D";
import _ from "lodash";
import Utils from "./Utils";
import { minSpeed, maxSpeed } from "./Config.json"

export default class Arrow extends V {
  v: V;
  shape: Graphics;
  desired: V;

  constructor(public app: Application, public x: number, public y: number) {
    super(x, y)
    this.v = V.random(minSpeed + Utils.random() * (maxSpeed - minSpeed))

    this.shape = new Graphics()
    this.desired = new V(0, 0)
  }

  move(delta: number = 1) {
    // 速度转化为位移
    // 添加0-2度的随机噪声
    const noiseDeg = -2 + Utils.random() * 4; // -2到2度
    const noiseRad = noiseDeg * Math.PI / 180;
    this.v.rotate(noiseRad);

    this.v.sclAdd(this.desired, delta)
    this.v.min(minSpeed)
    this.v.max(maxSpeed)
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
    shape.fill({ color: 'yellow' });

    shape.scale.set(0.6)
    shape.x = x
    shape.y = y
    shape.rotation = v.angle();

  }
}