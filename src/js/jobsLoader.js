import * as utils from '@/js/utils.js'
import { ref } from 'vue'
import { setCurrentPath as scp1 } from '@/js/detailPreview.js'
import { setCurrentPath as scp2 } from '@/js/mobile/detailPreviewMobile.js'
import { setCurrentPath as scp3 } from '@/js/isJobIncludesKeyword.js'
import { setCurrentPath as scp4 } from '@/js/detailForDownload.js'

let setCurrentPath = async val => {
  await scp1(val)
  await scp2(val)
  await scp3(val)
  await scp4(val)
}

let _jobs = ref([])
export let jobs = () => _jobs.value

export async function loadAndSetJobs(filepath) {
  let jobsData = await utils.loadJobs(filepath, setCurrentPath)
  if (jobsData && jobsData.length > 0)
    _jobs.value = jobsData
}

export default { jobs, loadAndSetJobs }
