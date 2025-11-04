<template>
  <div class="job-search-container">
    <div class="main-tool">
      <Download :data="filterJobs" format="job" csv-name="job-search.csv" class="float-panel"></Download>
      <div v-show="keyword" class="hint">共{{ filterJobs.length }}筆搜尋結果</div>
    </div>
    <div ref="jobsView">
      <div class="job" v-for="(job, i) in filterJobs" @mousemove="userHoverJob($event, job)" @mouseleave="userLeaveJob">
        <Bookmark :job="job"></Bookmark>
        <a class="cell" :href="job.網址" target="_blank">
          {{ i + 1 }}:<span v-html="highlightText(job.工作名稱)"></span>
        </a>
        <div class="cell" v-html="highlightText(job.工作標籤)"></div>
        <div class="cell" v-html="highlightText(job.關鍵字)"></div>
        <KeyHint :keys="['Q','W','E','R','T','Y','U','P']" v-if="isHovering(job)"></KeyHint>
      </div>
    </div>
  </div>
</template>

<script>
import Download from '@/components/Download.vue'
import * as utils from '@/js/utils.js'
import { userHoverJob, userLeaveJob } from '@/js/detailPreview.js'
import Bookmark from '@/components/Bookmark.vue'
import KeyHint from '@/components/KeyHint.vue'
import useKeyHintOnJob from '@/js/keyHintOnJob.js'
import SetJobsAndPoses from '@/js/mobile/setJobsAndPoses.js'
import { isJobIncludesKeyword } from '@/js/isJobIncludesKeyword.js'
import { keywordAliases } from '@/js/config.js'

let { isHovering, setJobOnHover } = useKeyHintOnJob()

export default {
  name: 'JobSearchResult',
  components: {
    Download,
    Bookmark,
    KeyHint,
  },
  props: ['keyword', 'jobs'],
  computed: {
    filterJobs() {
      if (!this.jobs) return []
      if (!this.keyword) return this.jobs
      if (typeof this.keyword === 'object') return this.jobs

      let keyword = this.checkAndReturnKeyword()

      // 以空白切割
      if (keyword.includes(' ')) {
        // 正向與負面混雜
        if (keyword.includes('-')) {
          let keyword_ = keyword.toLowerCase().split(/\s+/)
          let must = keyword_
            .filter(utils.notStartsWithDash)
          let not = keyword_
            .filter(utils.isStartsWithDash)
            .map(utils.dumpFirst)
          return this.jobs.filter(job => {
            if (!must.every(word => isJobIncludesKeyword(job, word))) return false
            if (not.some(word => isJobIncludesKeyword(job, word))) return false
            return true
          })
        }

        // 全部都是正向關鍵字
        return this.jobs.filter(job => {
          let keyword_ = keyword.toLowerCase().split(/\s+/)
          return keyword_.every(word => isJobIncludesKeyword(job, word))
        })
      }

      // 只有一個負面關鍵字
      if (keyword.includes('-'))
        return this.jobs.filter(job =>
          !isJobIncludesKeyword(job, keyword.toLowerCase().dumpFirst()))

      // 只有一個正向關鍵字
      return this.jobs.filter(job =>
        isJobIncludesKeyword(job, keyword.toLowerCase()))
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

    checkAndReturnKeyword() {
      let keyword = this.keyword.trim()  // 去除前後空格
      // 假設忘記在其中一個'-'前加上' '，補' '避免後續split(' ')失敗
      if (keyword.includes('-'))
        for (let i = 1; i < keyword.length; i++)
          if (keyword.charAt(i) === '-' && keyword.charAt(i - 1) !== ' ') {
            keyword = keyword.substring(0, i) + ' ' + keyword.substring(i)
            i++
          }
      return keyword
    },
    highlightText(text) {
      if (!this.keyword || !text || typeof this.keyword === 'object') return text

      let keyword = this.checkAndReturnKeyword()

      // 把別名加入要高亮的清單
      let keyword_ = keyword.toLowerCase().split(/\s+/)
      let must = keyword_.filter(utils.notStartsWithDash)
      let includes = must.intersection(keywordAliases._keys)
      let replace = includes.map(keyword => keywordAliases[keyword]).flat().join(' ')
      includes.forEach(key => keyword = keyword.replace(key, ''))
      keyword += ' ' + replace
      keyword = keyword.trim()

      // 以空白切割，只強調正向關鍵字
      if (keyword.includes(' ')) {
        let keyword_ = keyword.toLowerCase().split(/\s+/)
        let must = keyword_.filter(utils.notStartsWithDash)
        must.forEach(keyword => text = utils.replace(text, keyword, '<span class="highlight">$1</span>'))
        return text
      }

      // 負面關鍵字表示不用強調
      if (keyword.includes('-'))
        return text

      // 只有一個正向關鍵字
      return utils.replace(text, keyword, '<span class="highlight">$1</span>')
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

<style scoped lang="sass" src="@/styles/jobs.sass"></style>

<style scoped lang="sass">
@use "@/styles/rwd"

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

<style lang="sass">
@use "@/styles/variables.sass" as var

.job-search-container .highlight
  color: var.$btnBlue
  background-color: var.$dragOrange
  font-weight: 600
</style>