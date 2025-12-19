<template>
  <div class='job-search-container'>
    <div class='main-tool'>
      <Download :data='filterJobs' text-content='匯出工作(提取關鍵字)' format='job' csv-name='job-search.csv' class='float-panel'/>
      <Download :data='filterJobsDetail' text-content='匯出工作(原文)' format='detail' csv-name='job-search-detail.csv' class='float-panel'/>
      <div v-show='keyword' class='hint'>共{{ filterJobs.length }}筆搜尋結果</div>
    </div>
    <div ref='jobsView'>
      <div class='job' v-for='(job, i) in filterJobs' @mousemove='userHoverJob($event, job)' @mouseleave='userLeaveJob'>
        <Bookmark :job='job'/>
        <a class='cell' :href='job.網址' target='_blank'>
          {{ i + 1 }}:<span v-html='highlightText(job.工作名稱)'></span>
        </a>
        <div class='cell' v-html='highlightText(job.工作標籤)'></div>
        <div class='cell' v-html='highlightText(job.關鍵字)'></div>
        <KeyHint :keys="['Q','W','E','R','T','Y','U','P']" v-if='isHovering(job)'/>
      </div>
    </div>
  </div>
</template>

<script>
import Download from '@/components/Download.vue'
import { userHoverJob, userLeaveJob } from '@/js/detailPreview.js'
import Bookmark from '@/components/Bookmark.vue'
import KeyHint from '@/components/KeyHint.vue'
import useKeyHintOnJob from '@/js/keyHintOnJob.js'
import SetJobsAndPoses from '@/js/mobile/setJobsAndPoses.js'
import { highlightText } from '@/js/highlight.js'
import filterJobs from '@/js/filterJobs.js'
import { getDetailsContent } from '@/js/detailForDownload.js'

let { isHovering, setJobOnHover } = useKeyHintOnJob()

export default {
  name: 'JobSearchResult',
  components: {
    Download,
    Bookmark,
    KeyHint,
  },
  props: ['jobs', 'keyword'],
  computed: {
    filterJobs() {
      return filterJobs(this.jobs, this.keyword)
    },
    filterJobsDetail() {
      let filterHrefs = new Set(this.filterJobs.map(job => job['網址']))
      return getDetailsContent() ? getDetailsContent().filter(detail => filterHrefs.has(detail['job-href'])) : []
    },
  },
  methods: {
    userHoverJob(e, job) {
      userHoverJob(e, job)
      setJobOnHover(job)
    },
    userLeaveJob() {
      userLeaveJob()
      setJobOnHover({})
    },
    isHovering,

    highlightText(text) {
      return highlightText(text, this.keyword)
    },
  },
  updated() {
    SetJobsAndPoses.updated(this.$refs.jobsView)
  },
  activated() {
    SetJobsAndPoses.activated(this.$refs.jobsView)
  },
  deactivated() {
    SetJobsAndPoses.deactivated()
  },
}
</script>

<style scoped lang='sass' src='@/styles/jobs.sass'></style>

<style scoped lang='sass'>
@use '@/styles/rwd.sass'

.float-panel
  float: right
  margin-right: 2rem
  margin-bottom: 1rem
  +rwd.mobile
    float: left

+rwd.mobile
  .main-tool
    display: flex
    flex-direction: column
</style>

<style lang='sass'>
@use '@/styles/highlight.sass'

.job-search-container .highlight
  +highlight.defaultStyle
</style>