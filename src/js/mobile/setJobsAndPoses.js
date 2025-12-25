import JobAtSiteCenter from '@/js/mobile/jobAtSiteCenter.js'
import { jobs as jobDatas } from '@/js/jobsLoader.js'

let listener = null

// 預設`jobHrefs`為全部資料、如果`jobEls`非空會從中抓取`<a>`的`href`屬性
function setJobsAndPoses(jobsView) {
  let jobEls = jobsView.querySelectorAll('.job')
  let jobHrefs = jobEls
    ? jobEls.map(el => el.querySelector('a').getAttribute('href'))
    : jobDatas().map(job => job['網址'])
  if (!jobEls) console.warn('Jobs not found')
  JobAtSiteCenter.setJobsAndPoses(jobEls, jobHrefs)
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
