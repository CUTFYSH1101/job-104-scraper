// 等待直到函式成立
export default async function(trueFunc) {
  let interval = null
  await new Promise(resolve => interval = setInterval(() => {
    if (trueFunc()) {
      clearInterval(interval)
      return resolve()
    }
  }, 100))
}
