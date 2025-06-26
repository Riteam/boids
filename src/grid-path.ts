import V from "./V2D"

export default class Path {
  path: V[]
  #curr: V
  #stepSize: number

  constructor(public start: V, stepSize: number) {
    this.path = []
    this.#stepSize = stepSize

    this.#curr = start.clone()
    this.path.push(this.#curr.clone())
  }

  top(step: number = 1) {
    this.#curr.y -= step * this.#stepSize
    this.path.push(this.#curr.clone())
    return this
  }

  topRight(step: number = 1) {
    this.#curr.y -= step * this.#stepSize
    this.#curr.x += step * this.#stepSize
    this.path.push(this.#curr.clone())
    return this
  }

  right(step: number = 1) {
    this.#curr.x += step * this.#stepSize
    this.path.push(this.#curr.clone())
    return this
  }
  bottomRight(step: number = 1) {
    this.#curr.y += step * this.#stepSize
    this.#curr.x += step * this.#stepSize
    this.path.push(this.#curr.clone())
    return this
  }
  bottom(step: number = 1) {
    this.#curr.y += step * this.#stepSize
    this.path.push(this.#curr.clone())
    return this
  }
  bottomLeft(step: number = 1) {
    this.#curr.y += step * this.#stepSize
    this.#curr.x -= step * this.#stepSize
    this.path.push(this.#curr.clone())
    return this
  }
  left(step: number = 1) {
    this.#curr.x -= step * this.#stepSize
    this.path.push(this.#curr.clone())
    return this
  }

  topLeft(step: number = 1) {
    this.#curr.y -= step * this.#stepSize
    this.#curr.x -= step * this.#stepSize
    this.path.push(this.#curr.clone())
    return this
  }
}