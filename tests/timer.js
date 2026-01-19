let startTime = 0
let endTime = 0
let duration = 0

function start() {
  startTime = Date.now()
}

function stop() {
  endTime = Date.now()
  duration = endTime - startTime
}

function message() {
  return `${duration}ms`
}

async function callbackTimer(tag, callback) {
  start()
  await callback?.()
  stop()
  console.log(tag, message())
}

async function callbacksTimer(tag, callback, count) {
  start()
  for (let i = 0; i < count; i++)
    await callback?.()
  stop()
  console.log(tag, `執行${count}次`, `一共耗時${duration}ms`)
}

export default { start, stop, message, callbackTimer }
