let config = {
    startX: 0,
    limitX: 0,
    onStartTimer: e => {
        config.startX = e.clientX
        config.limitX = e.target.offsetWidth * 0.7  // 滑鼠在空白區域內滑過超過70%水平距離
    },
    condition: e => Math.abs(e.clientX - config.startX) > config.limitX
}
let timer = 1000  // 毫秒
let startTime = null
let satisfied = false
let isTiming = false

function getSatisfied() {
    return satisfied
}

function update(e) {
    let now = Date.now()
    if (!isTiming) {  // 開始
        isTiming = true
        config.onStartTimer(e)
        startTime = now
        satisfied = false  // 一開始當然條件不滿足
        return
    }

    if (now > startTime + timer) {  // 超時
        isTiming = false
        satisfied = false  // 超時也不滿足
        return
    }

    if (config.condition(e)) {  // 時限內條件滿足
        satisfied = true
        isTiming = false  // 重新計時
    }
}

export default {update, getSatisfied}
