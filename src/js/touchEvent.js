// 在start時才能觸發監聽isStaying
// 如果在move時就不觸發 不能三心二意
// 如果在start觸發監聽，但是move時移動好大的距離就不算
// 在isStaying===true時才能觸發位置移動
// 如果cancel就取消isStaying,isMove
// 測試：單點不能觸發、長按要觸發、長按移動不能觸發、長按移動出去又回來不能觸發
// 測試：要嘛是move->end，或是stay

class Vec2 {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  static get ZERO() {
    return new Vec2(0, 0)
  }

  static get UP() {
    return new Vec2(0, -1)
  }

  static get DOWN() {
    return new Vec2(0, 1)
  }

  static get LEFT() {
    return new Vec2(-1, 0)
  }

  static get RIGHT() {
    return new Vec2(1, 0)
  }

  static distance(vec1, vec2) {
    return Math.sqrt((vec1.x - vec2.x) ** 2 + (vec1.y - vec2.y) ** 2)
  }

  static displacement(from, to) {
    return new Vec2(to.x - from.x, to.y - from.y)
  }

  static direction(from, to) {
    let d = this.displacement(from, to)
    let len = d.length
    if (len <= 0) return new Vec2(0, 0)
    return d.mul(1 / len)
  }

  clone() {
    return new Vec2(this.x, this.y)
  }

  set(x, y) {
    this.x = x
    this.y = y
  }

  mul(scalar) {
    return new Vec2(this.x * scalar, this.y * scalar)
  }

  get length() {
    return Math.sqrt(this.x ** 2 + this.y ** 2)  // es6支援**運算子
  }

  set length(length) {
    this.set(this.mul(length / this.length))
  }

  toString() {
    return `(${parseInt(this.x)}, ${parseInt(this.y)})`
  }
}

let p1 = new Vec2(0, 0)
let p2 = new Vec2(0, 0)
let oldP1 = new Vec2(0, 0)
let oldP2 = new Vec2(0, 0)
let length = 0
let touch = null
let moveThresholdPx = 15  // px像素
let timeoutMs = 1500  // ms毫秒
let touches = []
let listener = null
let hasStopped = false

export let config = {
  onLongPress: (p1, p2) => {
  },
  onStop: (p1, p2) => {
  },
  onUpdate: (p1, p2) => {
  },
}

export function start(e) {
  if (listener) clearTimeout(listener)
  hasStopped = false

  updatePos(e)  // 開始時更新座標
  listener = setTimeout(() => {
    updatePos(e)  // 時間到時更新座標，偵測是否還在原地
    if (!isMoving()) config.onLongPress?.(p1, p2)
  }, timeoutMs)
}

export function update(e) {
  updatePos(e)
  config.onUpdate?.(p1, p2)  // 更新座標後再把座標傳給事件
  if (listener && isMoving()) clearTimeout(listener)  // 更新座標後發現移動了就停止監聽
}

export function stop() {
  if (hasStopped) return
  hasStopped = true

  if (listener) clearTimeout(listener)  // 手指一拿起當然不是長按
  config.onStop?.(p1, p2)
}

function isMoving() {
  return Vec2.distance(oldP1, p1) >= moveThresholdPx
}

function updatePos(e) {
  oldP1 = p1.clone()
  oldP2 = p2.clone()

  length = e.touches.length
  if (length === 0) {
    p1 = Vec2.ZERO
    p2 = Vec2.ZERO
    return
  }

  touches = e.touches
  if (length === 1) {
    touch = touches[0]
    p1.set(touch.clientX, touch.clientY)
    p2 = Vec2.ZERO
    return
  }

  touch = touches[0]
  p1.set(touch.clientX, touch.clientY)
  touch = touches[1]
  p2.set(touch.clientX, touch.clientY)
}
