<template>
  <div class="job-search-container">
    <div>
      <Download :data="filterJobs" format="job" csv-name="job-search.csv" class="float-panel"></Download>
      <div v-show="keyword" class="hint">共{{ filterJobs.length }}筆搜尋結果</div>
    </div>
    <div>
      <div class="job" v-for="(job, i) in filterJobs" @mousemove="userHoverJob($event, job)" @mouseleave="userLeaveJob">
        <Bookmark :job="job"></Bookmark>
        <a class="cell" :href="job.網址" target="_blank">{{ i + 1 }}:{{ job.工作名稱 }}</a>
        <div class="cell">{{ job.工作標籤 }}</div>
        <div class="cell" v-html="highlightText(job.關鍵字)"></div>
      </div>
    </div>
  </div>
</template>

<script>
import Download from "@/components/Download.vue"
import * as utils from "@/js/utils.js"
import {userHoverJob, userLeaveJob} from "@/js/detailPreview.js"
import Bookmark from "@/components/Bookmark.vue"

export default {
  name: "JobSearchResult",
  components: {
    Download,
    Bookmark,
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
              .filter(key => key.charAt(0) !== '-')
          let not = keyword_
              .filter(key => key.charAt(0) === '-')
              .map(key => key.substring(1))
          return this.jobs.filter(job => {
            let content = utils.getContent(job).toLowerCase()
            if (!must.every(word => content.includes(word))) return false
            if (not.some(word => content.includes(word))) return false
            return true
          })
        }

        // 全部都是正向關鍵字
        return this.jobs.filter(job => {
          let content = utils.getContent(job).toLowerCase()
          let keyword_ = keyword.toLowerCase().split(/\s+/)
          return keyword_.every(word => content.includes(word))
        })
      }

      // 只有一個負面關鍵字
      if (keyword.includes('-'))
        return this.jobs.filter(job =>
            !utils.getContent(job)
                .toLowerCase()
                .includes(keyword.toLowerCase()))

      // 只有一個正向關鍵字
      return this.jobs.filter(job =>
          utils.getContent(job)
              .toLowerCase()
              .includes(keyword.toLowerCase()))
    },
  },
  methods: {
    userHoverJob(e, job) {
      userHoverJob(e, job)
    },
    userLeaveJob() {
      userLeaveJob()
    },

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

      // 以空白切割，只強調正向關鍵字
      if (keyword.includes(' ')) {
        let keyword_ = keyword.toLowerCase().split(/\s+/)
        let must = keyword_.filter(key => key.charAt(0) !== '-')
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
}
</script>

<style scoped lang="sass" src="@/styles/jobs.sass"></style>

<style scoped lang="sass">
.float-panel
  position: absolute
  right: 2rem
</style>

<style lang="sass">
@use "@/styles/variables.sass" as var

.job-search-container .highlight
  color: var.$btnBlue
  font-weight: 600
</style>