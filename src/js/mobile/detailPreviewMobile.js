import { detailConfig } from '@/js/job/detailStorage.js'
import { ref } from 'vue'

let detail = ref({})

export function setCurrentJob(jobHref) {  // href
  detailConfig.setCurrentJob(jobHref)
}

export function setCurrentJobDetail() {
  detail.value = detailConfig.getCurrentJobDetail()
}

export function getCurrentJobDetail() {
  return detail.value
}
