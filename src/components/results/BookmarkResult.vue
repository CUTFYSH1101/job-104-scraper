<template>
  <div>
    <div class='main-tool'>
      <Download :data='filterJobs' text-content='匯出工作(提取關鍵字)' format='job' csv-name='job-bookmark.csv' class='float-panel'/>
    </div>
    <div>
      <button v-for='color in getColorMap'
              :style='{backgroundColor: color}'
              class='w-5 aspect-square rounded-full
               m-1 mb-4 duration-300
               hover:scale-125 active:scale-100'
              :class="{'scale-125': activeColor === color}"
              @click='activeColor = color'>
      </button>
    </div>
    <div ref='jobsView'>
      <div class='job' v-for='(job, i) in filterJobs'
           @mousemove='userHoverJob($event, job)'
           @mouseleave='userLeaveJob'>
        <keep-alive>
          <Bookmark :job='job'/>
        </keep-alive>
        <a class='cell' :href='job.網址' target='_blank'>{{ i + 1 }}:{{ job.工作名稱 }}</a>
        <div class='cell'>{{ job.工作標籤 }}</div>
        <div class='cell'>{{ job.關鍵字 }}</div>
        <KeyHint :keys="['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'P']" v-if='isHovering(job)'/>
      </div>
    </div>
  </div>
</template>

<script>
import Bookmark from '@/components/Bookmark.vue'
import { getColorMap, getBookmark } from '@/js/bookmark.js'
import KeyHint from '@/components/KeyHint.vue'
import useKeyHintOnJob from '@/js/keyHintOnJob.js'
import { userHoverJob, userLeaveJob } from '@/js/detailPreview.js'
import JobAtSiteCenter from '@/js/mobile/jobAtSiteCenter.js'
import SetJobsAndPoses from '@/js/mobile/setJobsAndPoses.js'
import Download from '@/components/Download.vue'

let { isHovering, setJobOnHover } = useKeyHintOnJob()

export default {
  name: 'BookmarkResult',
  components: { Bookmark, KeyHint, JobAtSiteCenter, Download },
  props: ['jobs'],
  data() {
    return {
      activeColor: null,
    }
  },
  computed: {
    getColorMap,
    filterJobs() {
      if (this.activeColor === null) return this.jobs.filter(job => getBookmark(job['網址']))
      return this.jobs.filter(job => getBookmark(job['網址']) && getBookmark(job['網址']) === this.activeColor)
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

<!-- Download.vue 專用 -->
<style scoped lang='sass' src='@/styles/download.sass'></style>