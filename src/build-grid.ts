import { Graphics } from 'pixi.js'

const g = new Graphics()
export default (size: number) => {
  const width = window.outerWidth
  const height = window.outerHeight
  const row = height / size
  const col = width / size
  g.clear()
  // Draw 10 vertical lines spaced 10 pixels apart
  for (let i = 0; i < col; i++) {
    // Move to top of each line (x = i*10, y = 0)
    g
      .moveTo(i * size, 0)
      // Draw down to bottom (x = i*10, y = 100)
      .lineTo(i * size, height);
  }

  // Draw 10 horizontal lines spaced 10 pixels apart
  for (let i = 0; i < row; i++) {
    // Move to start of each line (x = 0, y = i*10)
    g
      .moveTo(0, i * size)
      // Draw across to end (x = 100, y = i*10)
      .lineTo(width, i * size);
  }
  g.stroke({ color: 0xffffff, pixelLine: true, width: 4 })
  g.alpha = 0.4

  return g;
}