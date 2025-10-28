// 在start時才能觸發監聽isStaying
// 如果在move時就不觸發 不能三心二意
// 如果在start觸發監聽，但是move時移動好大的距離就不算
// 在isStaying===true時才能觸發位置移動
// 如果cancel就取消isStaying,isMove
// 測試：單點不能觸發、長按要觸發、長按移動不能觸發、長按移動出去又回來不能觸發
// 測試：要嘛是move->end，或是stay

import Vec2 from '@/js/vec2.js'

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
  isPanUp: () => p1.y < oldP1.y,
  isPanDown: () => p1.y > oldP1.y,
}

export function start(e) {
  if (listener) clearTimeout(listener)
  hasStopped = false

  updatePos(e)  // 開始時更新座標
  listener = setTimeout(() => {
    updatePos(e)  // 時間到時更新座標，偵測是否還在原地
    if (!isPanning()) config.onLongPress?.(p1, p2)
  }, timeoutMs)
}

export function update(e) {
  updatePos(e)
  config.onUpdate?.(p1, p2)  // 更新座標後再把座標傳給事件
  if (listener && isPanning()) clearTimeout(listener)  // 更新座標後發現移動了就停止監聽
}

export function stop() {
  if (hasStopped) return
  hasStopped = true

  if (listener) clearTimeout(listener)  // 手指一拿起當然不是長按
  config.onStop?.(p1, p2)
}

function isPanning() {
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
