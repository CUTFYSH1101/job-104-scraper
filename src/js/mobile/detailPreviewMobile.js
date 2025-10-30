import DetailStorage from '@/js/detailStorage.js'
import { ref } from 'vue'

let detailConfig = new DetailStorage()
await detailConfig.init()
let detail = ref({})

export function setCurrentJob(jobHref) {  // href
  detailConfig.setCurrentJob(jobHref)
}

export function setCurrentPath(val) {  // ../csv
  detailConfig.setCurrentPath(val)
}

export async function setCurrentJobDetail() {
  detail.value = await detailConfig.currentJobDetail()
}

export function getCurrentJobDetail() {
  return detail.value
}
