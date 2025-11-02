import DetailStorage from '@/js/detailStorage.js'
import { ref } from 'vue'

let detailConfig = new DetailStorage()
detailConfig.init()
let detail = ref({})

export function setCurrentJob(jobHref) {  // href
  detailConfig.setCurrentJob(jobHref)
}

export async function setCurrentPath(val) {
  await detailConfig.setCurrentPath(val)
}

export function setCurrentJobDetail() {
  detail.value = detailConfig.currentJobDetail()
}

export function getCurrentJobDetail() {
  return detail.value
}
