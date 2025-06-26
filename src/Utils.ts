const randomStore: number[] = []
const maxRandomStoreSize = 10e4
let randomStoreIndex = 0

window.randomStore = randomStore
// 声明全局类型以修复 TypeScript 错误
declare global {
  interface Window {
    randomStore: number[]
  }
}

export default {
  random() {
    randomStoreIndex %= maxRandomStoreSize

    if (randomStore.length < maxRandomStoreSize) {
      randomStore.push(Math.random())
    }

    return randomStore[randomStoreIndex++]
  }
}