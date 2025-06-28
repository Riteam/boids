import { Application, Sprite, RenderTexture, Container } from "pixi.js";
import buildGrid from "./build-grid";
import Boids from "./boids";
import Obstacle from "./obstacle";
import Path from "./grid-path";
import V from "./V2D";
import { gridSize } from "./Config.json"

(async () => {
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
  // Create a new application
  const app = new Application();

  // window.__PIXI_DEVTOOLS__ = {
  //   app
  // };

  // Initialize the application
  await app.init({
    background: "#1099bb",
    resizeTo: window,
    antialias: true,
    autoDensity: true,
    resolution: window.devicePixelRatio || 1,
  });

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  const ArrowBoids = new Boids(app, 200)

  const obstacleGroup = new Container()
  ArrowBoids.addObstacle(createLetterJ(obstacleGroup, 240, 280))
  ArrowBoids.addObstacle(createLetterR(obstacleGroup, 440, 280))
  ArrowBoids.addObstacle(createLetterC(obstacleGroup, 680, 280))


  const shadowTexture = RenderTexture.create({ width: app.screen.width, height: app.screen.height });

  const shadowSprite = new Sprite(shadowTexture);
  shadowSprite.tint = 0x000000;    // 着色为黑色
  shadowSprite.alpha = 0.2;        // 根据需要调整阴影透明度
  shadowSprite.position.set(3, 4); // 设置阴影偏移



  app.stage.addChild(obstacleGroup)
  app.stage.addChild(buildGrid(gridSize))
  app.stage.addChild(shadowSprite)
  app.stage.addChild(ArrowBoids.container)

  // Listen for animate update
  app.ticker.add((time) => {
    // Just for fun, let's rotate mr rabbit a little.
    // * Delta is 1 if running at 100% performance *
    // * Creates frame-independent transformation *
    // bunny.rotation += 0.1 * time.deltaTime;

    if (!paused) {
      ArrowBoids.update(time.deltaTime)
      app.renderer.render({ container: ArrowBoids.container, target: shadowTexture, clear: true });
    } else if (nextFrame) {
      nextFrame = false
      ArrowBoids.update(time.deltaTime)
      app.renderer.render({ container: ArrowBoids.container, target: shadowTexture, clear: true });
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