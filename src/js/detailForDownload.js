import DetailStorage from '@/js/detailStorage.js'

let detailConfig = new DetailStorage()
await detailConfig.init()

export async function setCurrentPath(val) {
  await detailConfig.setCurrentPath(val)
}

export  function getDetailsContent() {
  return detailConfig.config.details._values
}
