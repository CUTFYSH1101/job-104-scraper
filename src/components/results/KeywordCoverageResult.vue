<template>
  <div class='keyword-coverage'>
    <div v-if='!isKeywordEmpty' class='analysis line-block mb-5'>
      <div v-for='[key, value] in Object.entries(skillRateDict)' class='analysis-cell'>
        {{ key }}佔{{ toPercent(value) }}
        <HorizontalBar :width='toPercent(value)'/>
      </div>
      <div class='analysis-cell'>
        總共{{ toPercent(skillRateNum) }}
        <HorizontalBar :width='toPercent(skillRateNum)'/>
      </div>
    </div>
    <div ref='jobsView'>
      <div class='job' v-for='(job, i) in processedJobs'
           @mousemove='userHoverJob($event, job)'
           @mouseleave='userLeaveJob'>
        <Bookmark :job='job'/>
        <a class='cell' :href='job.網址' target='_blank'>{{ i + 1 }}:{{ job.工作名稱 }}</a>
        <div class='cell'>
          <span class='inline-block' v-for='tag in getTags(job)'
                :class='{ highlight: !isKeywordEmpty && tagInKeywords(tag) }'>
            {{ tag }}
          </span>
        </div>
        <!-- skillRate 或 skillWeight 任一有值時顯示，避免undefined顯示NaN -->
        <div v-if='!isKeywordEmpty && (job.skillRate || job.skillWeight)'>
          <div v-if='job.skillRate' class='cell'>
            <div>關鍵字比例：{{ toPercent(job.skillRate) }}</div>
            <HorizontalBar :width='toPercent(job.skillRate)'/>
          </div>
          <div v-if='job.skillWeight' class='cell hint--bottom' :aria-label='job.skillWeightHint'>
            <div>關鍵字比重：{{ toPercent(job.skillWeight) }}</div>
            <HorizontalBar :width='toPercent(job.skillWeight)'/>
          </div>
        </div>
        <KeyHint :keys="['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'P']" v-if='isHovering(job)'/>
      </div>
    </div>
  </div>
</template>

<script>
import * as utils from '@/js/utils.js'
import Batcher from '@/js/batcher.js'
import { getTags, prefixEach } from '@/js/utils.js'
import HorizontalBar from '@/components/utils/HorizontalBar.vue'
import { userHoverJob, userLeaveJob } from '@/js/detailPreview.js'
import Bookmark from '@/components/Bookmark.vue'
import KeyHint from '@/components/KeyHint.vue'
import useKeyHintOnJob from '@/js/keyHintOnJob.js'
import SetJobsAndPoses from '@/js/mobile/setJobsAndPoses.js'
import { isJobIncludesKeyword, matchKeyword } from '@/js/isJobIncludesKeyword.js'
import { parseKeyword } from '@/js/highlight.js'

let batcher = new Batcher()
batcher.batch = 10

let { isHovering, setJobOnHover } = useKeyHintOnJob()

export default {
  name: 'KeywordCoverageResult',
  components: {
    Bookmark,
    HorizontalBar,
    KeyHint,
  },
  props: ['jobs', 'keyword'],
  data() {
    return {
      processedJobs: [],
      isKeywordEmpty: true,
      processedKeywords: [],
      mustKeywords: [],
      notKeywords: [],
      skillRateDict: {},
      skillRateNum: 1.00,
    }
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

    getTags,
    async updateResult() {
      if (!this.jobs) this.processedJobs = []

      // 處理好關鍵字和jobs
      this.processedJobs = this.jobs
      this.isKeywordEmpty = false
      if (!this.isValidKeyword()) {
        this.isKeywordEmpty = true
        return
      }
      this.processKeywords()

      await this.calcuTotalRate()
      await this.calcuRateForeachJob()
      await this.calcuWeightForeachJob()
      this.sortJobs()
    },
    isValidKeyword() {
      return this.keyword && typeof this.keyword !== 'object'
    },
    processKeywords() {
      let keywords = parseKeyword(this.keyword)
      this.processedKeywords = keywords.all
      this.mustKeywords = keywords.must
      this.notKeywords = keywords.not
    },
    // 這個工作的技能要求中，有多少比例符合你搜尋的關鍵字，越大表示這個工作越符合你的搜尋條件
    async calcuRateForeachJob() {
      await batcher.forEach(this.processedJobs, job => {
        let total = this.processedKeywords.length
        let must = this.mustKeywords.filter(key => isJobIncludesKeyword(job, key))
        let not = this.notKeywords.filter(key => !isJobIncludesKeyword(job, key))  // 全都不包含算符合一次
        let count = must.length + not.length
        job.skillRate = count / total
      })
      console.log('rate')
    },
    // 對這份工作來說，關鍵字佔多重，越重表示這份工作越符合你
    async calcuWeightForeachJob() {
      await batcher.forEach(this.processedJobs, job => {
        let total = getTags(job).length
        let must = this.mustKeywords.filter(key => isJobIncludesKeyword(job, key))
        let not = this.notKeywords.filter(key => isJobIncludesKeyword(job, key))  // 每有一個就扣分
        let score = must.length - not.length
        if (score < 0) score = 0
        if (score > total) score = total
        job.skillWeight = score / total
        job.skillWeightHint = `${prefixEach(must, '+')}${prefixEach(not, '-')}共${score}項符合（${must.length}-${not.length}），${score}/${total} = ${job.skillWeight}`
      })
      console.log('weight')
    },
    // 按照搜尋結果排序
    sortJobs() {
      this.processedJobs.sort((a, b) => {
        if (a.skillRate > b.skillRate) return -1
        else if (a.skillRate < b.skillRate) return 1
        else if (a.skillWeight > b.skillWeight) return -1
        else if (a.skillWeight < b.skillWeight) return 1
        else return 0
      })
      console.log('排序工作')
    },
    async calcuTotalRate() {
      // python佔6成，表示個別關鍵字佔整體市場多少工作
      let total = this.processedJobs.length
      this.skillRateDict = {}
      this.mustKeywords.forEach(key => {
        let count = utils.count(this.processedJobs, job => isJobIncludesKeyword(job, key))
        this.skillRateDict[key] = count / total
      })
      this.notKeywords.forEach(key => {
        let count = utils.count(this.processedJobs, job => !isJobIncludesKeyword(job, key))
        this.skillRateDict['-' + key] = count / total
      })

      // 當一個工作每個關鍵字都符合，越多工作符合，表示該關鍵字可以代表很大的市場
      let count = 0
      await batcher.forEach(this.processedJobs, job => {
        if (!this.mustKeywords.every(key => isJobIncludesKeyword(job, key)))
          return
        if (this.notKeywords.some(key => isJobIncludesKeyword(job, key)))
          return
        count++
      })
      this.skillRateNum = count / total
    },
    tagInKeywords(tag) {
      // 檢查別名
      for (let key of this.mustKeywords)
        if (matchKeyword(tag, key))
          return true

      return false
    },
    toPercent(f) {
      return utils.toPercent(f)
    },
  },
  watch: {
    keyword() {
      this.updateResult()
    },
  },
  updated() {
    SetJobsAndPoses.updated(this.$refs.jobsView)
  },
  activated() {
    this.updateResult()
    SetJobsAndPoses.activated(this.$refs.jobsView)
  },
  deactivated() {
    SetJobsAndPoses.deactivated()
  },
}
</script>

<style scoped lang='sass' src='@/styles/jobs.sass'></style>

<style lang='sass'>
@use '@/styles/variables.sass' as var

.keyword-coverage .inline-block
  display: inline-block
  padding: 5px 10px
  margin: 5px
  overflow: hidden  // 配合var.ripple的ofh對齊

.keyword-coverage .highlight
  color: var.$btnBlue
  background-color: var.$btnWhite
  outline: none
  border: none
  border-radius: var.$infinity
  padding: 5px 10px
  margin: 5px
  cursor: pointer
  +var.ripple(rgba(black, 0.1))
</style>