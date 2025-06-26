import Arrow from "./arrow";
import { Application, Container, Graphics } from "pixi.js";
import _ from "lodash";
import V from "./V2D";
import Obstacle from "./obstacle";
import QuadTree from "./quadtree";

const seprationRadius = 20
const alignmentRadius = 60
const cohesionRadius = 60

const seprationFactor = 1.5
const alignmentFactor = 1
const cohesionFactor = 1.4

// 避障力权重
const avoidanceThreshold = 80
const avoidanceThreshold2 = 10
const avoidanceFactor = 1.2
const avoidanceFactor2 = 5

const accelerationLimit = 0.1

export default class Boids {
  container: Container
  #arrows: Arrow[]
  shape: Graphics
  obstacle: Obstacle | null
  quadTree: QuadTree

  constructor(public app: Application, public count: number) {
    this.container = new Container()
    this.#arrows = []
    this.shape = new Graphics()
    this.obstacle = null

    // 初始化四叉树，覆盖整个屏幕
    this.quadTree = new QuadTree({
      x: 0,
      y: 0,
      width: app.screen.width,
      height: app.screen.height
    }, 10, 4)

    // for (let i = 0; i < Math.min(count, 10); i++) {
    //   const arrow = new Arrow(app, _.random(0, app.screen.width), _.random(0, app.screen.height))
    //   this.#arrows.push(arrow)
    //   this.container.addChild(arrow.shape)
    // }

    const timer = setInterval(() => {
      if (this.#arrows.length >= count) {
        clearInterval(timer)
        return
      }
      // const arrow = new Arrow(app, app.screen.width / 2, app.screen.height / 2)
      const arrow = new Arrow(app, 100, 100)
      this.#arrows.push(arrow)
      this.container.addChild(arrow.shape)
    }, 10)

    app.stage.addChild(this.shape)
    this.shape.zIndex = 10
  }

  setObstacle(obstacle: Obstacle) {
    this.obstacle = obstacle
  }

  // 检查两个向量之间的角度差是否在180度范围内
  private isInFrontView(currentArrow: Arrow, otherArrow: V): boolean {
    // 计算从当前箭头到其他箭头的方向向量
    const toOther = new V(otherArrow.x - currentArrow.x, otherArrow.y - currentArrow.y)

    // 获取当前箭头的速度方向（视角方向）
    const currentDirection = currentArrow.v.clone().normalize()

    // 计算方向向量到其他箭头的角度
    const toOtherAngle = toOther.angle()
    const currentAngle = currentDirection.angle()

    // 计算角度差（考虑角度环绕）
    let angleDiff = Math.abs(toOtherAngle - currentAngle)
    if (angleDiff > Math.PI) {
      angleDiff = 2 * Math.PI - angleDiff
    }

    // 检查是否在前方180度范围内（π弧度）
    return angleDiff <= Math.PI * 0.75
  }

  drawDebug(arrow: Arrow) {
    const { desired, x, y } = arrow
    const { shape } = this
    const angle = desired.angle()
    if (desired.x !== 0 || desired.y !== 0) {
      shape.moveTo(x, y);
      shape.lineTo(x + 20 * Math.cos(angle), y + 20 * Math.sin(angle));
      shape.stroke({ color: 'brown', width: 2 });
    }

    this.shape.circle(x, y, seprationRadius)
    this.shape.circle(x, y, cohesionRadius)
    this.shape.stroke({ color: 'pink', width: 2, alpha: 0.5 })

  }

  drawLineToNeibours(arrow: Arrow, neibours: Arrow[]) {
    const { shape } = this
    for (const neibour of neibours) {
      shape.moveTo(arrow.x, arrow.y)
      shape.lineTo(neibour.x, neibour.y)
    }
    shape.stroke({ color: 'red', width: 2 })
  }

  getNeibours(curr: Arrow) {
    const sqrDistance = alignmentRadius * alignmentRadius
    const neibours = []

    // 使用四叉树查询范围内的邻居
    const candidates = this.quadTree.retrieve(curr, alignmentRadius)

    // 过滤出视野内的邻居
    for (const arrow of candidates) {
      const d = curr.sqrDist(arrow)
      if (curr !== arrow && d < sqrDistance && this.isInFrontView(curr, arrow)) {
        neibours.push(arrow)
      }
    }

    return neibours
  }

  update(delta: number) {
    this.shape.clear()

    // 更新四叉树
    this.quadTree.update(this.#arrows)

    this.#arrows.forEach((curr, index) => {
      const neibours = this.getNeibours(curr)


      // 分离
      const separationSteering = new V(0, 0)
      if (neibours.length > 0) {
        const sqrSeprationRadius = seprationRadius * seprationRadius
        let count = 0
        for (let i = 0; i < neibours.length; i++) {
          const n = neibours[i]
          const d = curr.sqrDist(n)
          if (d < sqrSeprationRadius) {
            count++
            separationSteering.add(
              curr.clone()
                .sub(n)
                .normalize()
                .div(d || 0.00001)
            )
          }
        }

        if (count) {
          separationSteering
            .div(count)
            .normalize()
            .max(accelerationLimit)
        }
      }

      // 对齐
      const alignmentSteering = new V(0, 0)
      if (neibours.length > 0) {
        for (let i = 0; i < neibours.length; i++) {
          alignmentSteering.add(neibours[i].v)
        }
        alignmentSteering
          .div(neibours.length)
          .normalize()
          .sub(curr.v)
          .max(accelerationLimit)
      }

      // 聚集
      const cohesionSteering = new V(0, 0)
      if (neibours.length > 0) {
        for (let i = 0; i < neibours.length; i++) {
          cohesionSteering.add(neibours[i])
        }
        cohesionSteering
          .div(neibours.length)
          .sub(curr)
          .normalize()
          .sub(curr.v)
          .max(accelerationLimit)
      }

      // 避障
      const avoidanceSteering = new V(0, 0)
      if (this.obstacle) {

        if (this.obstacle.isPointInsidePolygon(curr)) {
          const newPos = this.obstacle.pushPointToNearestEdge(curr)
          curr.v = V.sub(newPos, curr)
          curr.copy(newPos)
          console.log(curr.v);
        }

        let sqrThreshold2 = avoidanceThreshold2 * avoidanceThreshold2
        const nearestPoints = this.obstacle.getNearestPoints(curr, avoidanceThreshold)
        let count = 0
        let minDis = Infinity
        for (const point of nearestPoints) {

          if (this.isInFrontView(curr, point)) {
            count++
            const avoid = V.sub(curr, point)
            const d = avoid.sqrMag()

            minDis = Math.min(minDis, d)

            const t = avoid.normalize().div(d || 0.00001)


            this.shape.moveTo(curr.x, curr.y);
            this.shape.lineTo(point.x, point.y)
            this.shape.stroke({ color: 'green', width: 1 })

            avoidanceSteering.add(t)
          }
        }

        if (count) {
          avoidanceSteering
            .div(count)
            .normalize()
            .max(accelerationLimit)
            .mult(avoidanceFactor)

          if (minDis < sqrThreshold2) {
            avoidanceSteering.mult(avoidanceFactor2)
          }
        }
      }

      const acc = new V(0, 0)
      acc.add(separationSteering.mult(seprationFactor))
      acc.add(alignmentSteering.mult(alignmentFactor))
      acc.add(cohesionSteering.mult(cohesionFactor))
      acc.add(avoidanceSteering)

      curr.desired = acc
      curr.move(delta)
      curr.draw()

      // this.drawDebug(curr)
    })
  }
}