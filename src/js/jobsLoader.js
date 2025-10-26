import * as utils from '@/js/utils.js'
import { setCurrentPath } from '@/js/detailPreview.js'
import { ref } from 'vue'

let _jobs = ref([])
export let jobs = () => _jobs.value

export async function loadAndSetJobs(filepath) {
  let jobsData = await utils.loadJobs(filepath, setCurrentPath)
  if (jobsData && jobsData.length > 0)
    _jobs.value = jobsData
}

export default { jobs, loadAndSetJobs }
