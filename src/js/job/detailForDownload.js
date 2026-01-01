import DetailStorage from '@/js/job/detailStorage.js'

let detailConfig = new DetailStorage()
await detailConfig.init()

export async function setCurrentPath(val) {
  await detailConfig.setCurrentPath(val)
}

/**
 * @returns {string[]}
 */
export function getDetailsContent() {
  return detailConfig.config.details._values
}
