import { reactive } from 'vue'
import { isMobile } from '@/js/mobile/rwd.js'
import { setCurrentJob } from '@/js/mobile/detailPreviewMobile.js'

let state = reactive({
  jobs: [],
  poses: [],
  diff: [],
  indexOf: -1,
  scrollPos: 0,
  currentHref: {},
})
// 等到props和dom都有值再去抓取
let setJobsAndPoses = (jobEls, hrefs) => {
  if (!isMobile()) return
  let poses = els2Pos(jobEls)
  state.jobs = [...hrefs]
  state.poses = [...poses]
}
let changeJobDetail = scrollEvent => {
  if (!isMobile()) return
  let pos = scrollPos(scrollEvent.currentTarget)
  let href = getCurrentJob(pos)
  state.scrollPos = pos
  state.currentHref = href
  setCurrentJob(href)
}
let getCurrentJob = top => {
  state.diff = state.poses.map(y => Math.abs(y - top))
  state.indexOf = state.diff.indexOf(Math.min(...state.diff))
  return state.jobs[state.indexOf]
}
let scrollPos = el => el.scrollTop + (el.clientHeight * 0.5)
let jobPos = el => el.offsetTop + (el.offsetHeight * 0.5)
let els2Pos = els => [...els].map(jobPos)
export default { state, setJobsAndPoses, changeJobDetail }
