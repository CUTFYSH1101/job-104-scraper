import DetailStorage from '@/js/detailStorage.js'

let detailConfig = new DetailStorage()
detailConfig.init()

export async function setCurrentPath(val) {
  await detailConfig.setCurrentPath(val)
}