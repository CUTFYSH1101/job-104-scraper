import * as utils from '@/js/utils.js'
import { ref } from 'vue'
import { setCurrentPath as scp1 } from '@/js/detailPreview.js'
import { setCurrentPath as scp2 } from '@/js/mobile/detailPreviewMobile.js'

let setCurrentPath = val => {
  scp1(val)
  scp2(val)
}

let _jobs = ref([])
export let jobs = () => _jobs.value

export async function loadAndSetJobs(filepath) {
  let jobsData = await utils.loadJobs(filepath, setCurrentPath)
  if (jobsData && jobsData.length > 0)
    _jobs.value = jobsData
}

export default { jobs, loadAndSetJobs }
