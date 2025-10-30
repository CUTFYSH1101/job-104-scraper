import JobAtSiteCenter from '@/js/mobile/jobAtSiteCenter.js'
import { jobs as jobDatas } from '@/js/jobsLoader.js'

let listener = null

function setJobsAndPoses(jobsView) {
  let jobViews = jobsView.querySelectorAll('.job')
  JobAtSiteCenter.setJobsAndPoses(jobViews, jobDatas(), '網址')
}

export function updated(jobsView) {  // 等到props和dom都有值再去抓取
  setJobsAndPoses(jobsView)
}

export function activated(jobsView) {  // 切換頁面的時候
  setJobsAndPoses(jobsView)
  if (listener) return
  listener = () => setJobsAndPoses(jobsView)
  window.addEventListener('resize', listener)
}

export function deactivated() {
  if (!listener) return
  window.removeEventListener('resize', listener)
}

export default { updated, activated, deactivated }
