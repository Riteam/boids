import {
  Application,
  Sprite,
  RenderTexture,
  Container,
  Graphics,
} from 'pixi.js'
import GridLines from './grid-lines'
import Boids from './boids'
import Obstacle from './obstacle'
import Path from './grid-path'
import V from './V2D'
import { gridSize, backgroundColor } from './Config.json'

const noObs = import.meta.env.VITE_NO_OBS === 'true'

let paused = false
let nextFrame = false

if (!noObs) {
  document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
      paused = !paused
      e.preventDefault()
    }

    if (e.key === '.' && paused) {
      nextFrame = true
      e.preventDefault()
    }
  })
}

;(async () => {
  // Create a new application
  const app = new Application()

  // window.__PIXI_DEVTOOLS__ = {
  //   app
  // };

  // Initialize the application
  await app.init({
    background: backgroundColor,
    resizeTo: window,
    antialias: true,
    autoDensity: true,
    resolution: Math.min(2, window.devicePixelRatio || 1),
  })

  // Append the application canvas to the document body
  document.getElementById('pixi-container')!.appendChild(app.canvas)

  const ArrowBoids = new Boids(app, 800)

  const obstacleGroup = new Container()
  if (!noObs && window.innerWidth > 2000) {
    ArrowBoids.addObstacle(createLetterJ(obstacleGroup, 240, 280))
    ArrowBoids.addObstacle(createLetterR(obstacleGroup, 440, 280))
    ArrowBoids.addObstacle(createLetterC(obstacleGroup, 680, 280))
  }

  let shadowTexture = RenderTexture.create({
    width: app.screen.width,
    height: app.screen.height,
  })

  const shadowSprite = new Sprite(shadowTexture)
  shadowSprite.tint = 0x000000 // 着色为黑色
  shadowSprite.alpha = 0.1 // 根据需要调整阴影透明度
  shadowSprite.position.set(3, 4) // 设置阴影偏移

  GridLines.build(gridSize)

  app.stage.addChild(GridLines.g)
  app.stage.addChild(obstacleGroup)
  app.stage.addChild(shadowSprite)
  app.stage.addChild(ArrowBoids.container)
  const pulseLayer = new Graphics()
  app.stage.addChild(pulseLayer)

  const pulses: { x: number; y: number; start: number; duration: number }[] = []

  // 尺寸变化时：重建网格、四叉树、阴影纹理
  const handleResize = () => {
    GridLines.build(gridSize)
    ArrowBoids.resize(app.screen.width, app.screen.height)
    shadowTexture.destroy(true)
    shadowTexture = RenderTexture.create({
      width: app.screen.width,
      height: app.screen.height,
    })
    shadowSprite.texture = shadowTexture
  }
  window.addEventListener('resize', handleResize)

  // 指针按下：让所有箭头远离点击/触摸点
  app.canvas.addEventListener('pointerdown', (e: PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return // 仅鼠标左键，其它指针类型直接通过
    const rect = app.canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (app.screen.width / rect.width)
    const y = (e.clientY - rect.top) * (app.screen.height / rect.height)
    const click = new V(x, y)
    ArrowBoids.repulseFrom(click, 6, 300)
    pulses.push({
      x: click.x,
      y: click.y,
      start: performance.now(),
      duration: 300,
    })
  })

  const update = (delta: number) => {
    app.renderer.render({
      container: ArrowBoids.container,
      target: shadowTexture,
      clear: true,
    })
    // 绘制脉冲：1s内半径线性增大、透明度线性减小
    const now = performance.now()
    pulseLayer.clear()
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i]
      const t = (now - p.start) / p.duration
      if (t >= 1) {
        pulses.splice(i, 1)
        continue
      }
      const radius = 20 + 120 * t
      const alpha = 1 - t
      pulseLayer.circle(p.x, p.y, radius)
      pulseLayer.stroke({ color: 0xffffff, width: 6, alpha })
    }
    ArrowBoids.update(delta)
  }
  // Listen for animate update
  app.ticker.add((time) => {
    if (!paused) {
      update(time.deltaTime)
    } else if (nextFrame) {
      nextFrame = false
      update(time.deltaTime)
    }
    // app.render()
  })
})()

function createLetterJ(container: Container, startX: number, startY: number) {
  const P = new Path(new V(startX, startY), gridSize)
  P.right(4)
    .bottom(1)
    .left(1)
    .bottom(3)
    .bottomLeft()
    .left()
    .topLeft()
    .right(2)
    .top(3)
    .left(1)
    .topLeft()

  return new Obstacle(container).createPolygonShape(P.path)
}

function createLetterR(container: Container, startX: number, startY: number) {
  const P = new Path(new V(startX, startY), gridSize)
    .right(3)
    .bottomRight()
    .bottom(1)
    .bottomLeft()
    .left(1)
    .bottomRight(2)
    .left(1)
    .topLeft(2)
    .bottom(2)
    .left(1)
    .top(5)

  const P2 = new Path(new V(startX + gridSize, startY + gridSize), gridSize)
    .right(2)
    .bottom()
    .left(2)
    .top()

  return new Obstacle(container).createPolygonShape(P.path, P2.path)
}

function createLetterC(container: Container, startX: number, startY: number) {
  const P = new Path(new V(startX, startY), gridSize)
    .right(2)
    .bottomLeft(1)
    .left(1)
    .bottom(3)
    .right(2)
    .bottomRight()
    .left(3)
    .topLeft()
    .top(3)
    .topRight()

  return new Obstacle(container).createPolygonShape(P.path)
}
