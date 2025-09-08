const randomStore: number[] = []
const maxRandomStoreSize = 10e4
let randomStoreIndex = 0

function random() {
  randomStoreIndex %= maxRandomStoreSize

  if (randomStore.length < maxRandomStoreSize) {
    randomStore.push(Math.random())
  }

  return randomStore[randomStoreIndex++]
}
export default {
  random,
  swap(arr: [], a: number, b: number) {
    const temp = arr[a]
    arr[a] = arr[b]
    arr[b] = temp
    return arr
  },

  randomRange(min: number, max: number) {
    return min + random() * (max - min)
  },

  interpolateColor(colorA: number, colorB: number, progress: number): number {
    // 提取RGB分量
    const rA = (colorA >> 16) & 0xff
    const gA = (colorA >> 8) & 0xff
    const bA = colorA & 0xff

    const rB = (colorB >> 16) & 0xff
    const gB = (colorB >> 8) & 0xff
    const bB = colorB & 0xff

    // 线性插值
    const r = 0 | (rA + (rB - rA) * progress)
    const g = 0 | (gA + (gB - gA) * progress)
    const b = 0 | (bA + (bB - bA) * progress)

    return (r << 16) | (g << 8) | b
  },
}
