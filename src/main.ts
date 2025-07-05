import { Application, Sprite, RenderTexture, Container } from "pixi.js";
import GridLines from "./grid-lines";
import Boids from "./boids";
import Obstacle from "./obstacle";
import Path from "./grid-path";
import V from "./V2D";
import { gridSize, backgroundColor } from "./Config.json"

const noObs = import.meta.env.VITE_NO_OBS || false

let paused = false
let nextFrame = false
document.addEventListener("keydown", e => {
  if (e.key === " ") {
    paused = !paused
    e.preventDefault()
  }

  if (e.key === "." && paused) {
    nextFrame = true;
    e.preventDefault()
  }
});

(async () => {
  // Create a new application
  const app = new Application();

  // window.__PIXI_DEVTOOLS__ = {
  //   app
  // };

  // Initialize the application
  await app.init({
    background: backgroundColor,
    resizeTo: window,
    antialias: true,
    autoDensity: true,
    resolution: window.devicePixelRatio || 1,
  });

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  const ArrowBoids = new Boids(app, 200)

  const obstacleGroup = new Container()
  if (!noObs) {
    ArrowBoids.addObstacle(createLetterJ(obstacleGroup, 240, 280))
    ArrowBoids.addObstacle(createLetterR(obstacleGroup, 440, 280))
    ArrowBoids.addObstacle(createLetterC(obstacleGroup, 680, 280))
  }


  const shadowTexture = RenderTexture.create({ width: app.screen.width, height: app.screen.height });

  const shadowSprite = new Sprite(shadowTexture);
  shadowSprite.tint = 0x000000;    // 着色为黑色
  shadowSprite.alpha = 0.1;        // 根据需要调整阴影透明度
  shadowSprite.position.set(3, 4); // 设置阴影偏移


  GridLines.build(gridSize)

  app.stage.addChild(GridLines.g)
  app.stage.addChild(obstacleGroup)
  app.stage.addChild(shadowSprite)
  app.stage.addChild(ArrowBoids.container)

  const update = (delta: number) => {
    app.renderer.render({
      container: ArrowBoids.container,
      target: shadowTexture,
      clear: true
    });
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
  });
})();




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