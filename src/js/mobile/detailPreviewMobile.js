import DetailStorage from '@/js/detailStorage.js'

let detailConfig = new DetailStorage()
await detailConfig.init()

export function setCurrentJob(jobHref) {  // href
  detailConfig.setCurrentJob(jobHref)
}

export function setCurrentPath(val) {  // ../csv
  detailConfig.setCurrentPath(val)
}

export async function currentJobDetail() {
  return await detailConfig.currentJobDetail()
}
