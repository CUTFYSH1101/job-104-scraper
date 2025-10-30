import { reactive } from 'vue'
import { isMobile } from '@/js/mobile/rwd.js'

let state = reactive({
  jobs: [],
  poses: [],
  diff: [],
  indexOf: -1,
  scrollPos: 0,
  currentHref: {},
})
// 等到props和dom都有值再去抓取
let setJobsAndPoses = (jobEls, jobDatas, hrefColName) => {
  if (!isMobile()) return
  let poses = els2Pos(jobEls)
  let hrefs = jobDatas.map(job => job[hrefColName])
  state.jobs = [...hrefs]
  state.poses = [...poses]
  console.log(state.poses)
}
let changeJobDetail = scrollEvent => {
  if (!isMobile()) return
  let pos = scrollPos(scrollEvent.currentTarget)
  let href = getCurrentJob(pos)
  state.scrollPos = pos
  state.currentHref = href
  console.log(state.indexOf + 1, href, pos)
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
