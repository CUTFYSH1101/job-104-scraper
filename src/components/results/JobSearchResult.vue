<template>
  <div class='job-search-container'>
    <div class='main-tool'>
      <Download :data='filterJobs' text-content='匯出工作(提取關鍵字)' format='job' csv-name='job-search.csv' class='float-panel'/>
      <Download :data='filterJobsDetail' text-content='匯出工作(原文)' format='detail' csv-name='job-search-detail.csv' class='float-panel'/>
      <div v-show='keyword' class='hint'>共{{ filterJobs.length }}筆搜尋結果</div>
    </div>
    <div ref='jobsView'>
      <div class='job' v-for='(job, i) in filterJobs' @mousemove='userHoverJob($event, job)' @mouseleave='userLeaveJob'>
        <keep-alive>
          <Bookmark :job='job'/>
        </keep-alive>
        <a class='cell' :href='job.網址' target='_blank'>
          {{ i + 1 }}:<span v-html='highlightText(job.工作名稱)'></span>
        </a>
        <div class='cell' v-html='highlightText(job.工作標籤)'></div>
        <div class='cell' v-html='highlightText(job.關鍵字)'></div>
        <KeyHint :keys="['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'P']" v-if='isHovering(job)'/>
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
import { highlightText, isTimeout } from '@/js/highlight.js'
import filterJobs from '@/js/filterJobs.js'
import { getDetailsContent } from '@/js/detailForDownload.js'
import { isFalsy, joinDictValues } from '@/js/utils.js'

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
      if (isFalsy(this.keyword) || this.firstTextTimeout) return text
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
  data() {
    return {
      firstTextTimeout: false,
    }
  },
  watch: {
    async keyword() {
      if (!this.jobs) await this.$nextTick()  // 多等一次讓 jobs 載入
      let firstJob = joinDictValues(this.jobs[0], ',')
      this.firstTextTimeout = isTimeout(firstJob, this.keyword)
      if (this.firstTextTimeout)
        console.warn('超時保護')
    },
  },
}
</script>

<style scoped lang='sass' src='@/styles/jobs.sass'></style>

<!-- Download.vue 專用 -->
<style scoped lang='sass' src='@/styles/download.sass'></style>

<style lang='sass'>
@use '@/styles/highlight.sass'

.job-search-container .highlight
  +highlight.defaultStyle
</style>