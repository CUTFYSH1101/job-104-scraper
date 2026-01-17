<template>
  <div class='keyword-coverage'>
    <!-- 有關鍵字並且載入完畢再顯示 -->
    <div v-if='!isKeywordEmpty && loadingStep === "4/4"' class='analysis line-block mb-5'>
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
           @mouseleave='userLeaveJob'
           v-bookmark-listener='job'>
        <BookmarksView :job='job'/>
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
    <div v-if='loading' class='absolute left-0 top-0 z-10 w-full bg-white opacity-70 animate-pulse pl-5 pt-5'
         :style='{height: relativeMainHeight + "px"}'>
      <span style='font-family: 源石黑體, monospace'>解析中... {{ loadingStep }}</span>
    </div>
  </div>
</template>

<script>
import * as utils from '@/js/core/utils.js'
import Batcher from '@/js/batcher.js'
import { getTags, prefixEach } from '@/js/core/utils.js'
import HorizontalBar from '@/components/utils/HorizontalBar.vue'
import { userHoverJob, userLeaveJob } from '@/js/job/detailPreview.js'
import BookmarksView from '@/components/BookmarksView.vue'
import KeyHint from '@/components/KeyHint.vue'
import useKeyHintOnJob from '@/js/keyHintOnJob.js'
import SetJobsAndPoses from '@/js/mobile/setJobsAndPoses.js'
import { parseKeyword, isJobTagsMatchKeyword, isTagsMatchKeyword } from '@/js/job/isJobIncludesKeyword.js'

let batcher = new Batcher()
batcher.batch = 10

let { isHovering, setJobOnHover } = useKeyHintOnJob()

export default {
  name: 'KeywordCoverageResult',
  components: {
    BookmarksView,
    HorizontalBar,
    KeyHint,
  },
  props: ['jobs', 'keyword', 'relativeMainHeight'],
  data() {
    return {
      processedJobs: [],
      isKeywordEmpty: true,
      processedKeywords: [],
      mustKeywords: [],
      notKeywords: [],
      skillRateDict: {},
      skillRateNum: 1.00,
      loading: false,
      loadingStep: '',
      highlightTagsSet: new Set(),
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
      if (!this.jobs) {
        this.processedJobs = []
        return
      }

      // 處理好關鍵字和jobs
      this.processedJobs = this.jobs
      this.isKeywordEmpty = false
      if (!this.isValidKeyword()) {
        this.isKeywordEmpty = true
        return
      }
      this.processKeywords()
      let inputs = (this.mustKeywords ?? []).concat(this.notKeywords)
      let uniqueTags = utils.getTotalUniqueTags(this.jobs)
      let tagsIncludesInputs = inputs.some(keyword => isTagsMatchKeyword(uniqueTags, keyword))
      if (!tagsIncludesInputs) return

      this.loading = true
      this.loadingStep = '1/4'
      await this.preCalcuMatches()
      this.loadingStep = '2/4'
      this.calcuTotalRate()
      this.loadingStep = '3/4'
      this.calcuRateForeachJob()
      this.calcuWeightForeachJob()
      this.loadingStep = '4/4'
      this.sortJobs()
      this.loading = false
    },
    isValidKeyword() {
      return this.keyword && typeof this.keyword !== 'object'
    },
    processKeywords() {
      let keywords = parseKeyword(this.keyword)
      this.processedKeywords = keywords.all
      this.mustKeywords = keywords.must
      this.notKeywords = keywords.not
      this.buildHighlightTagsSet()
    },
    buildHighlightTagsSet() {
      this.highlightTagsSet = new Set()
      if (!this.mustKeywords?.length) return
      let uniqueTags = utils.getTotalUniqueTags(this.jobs)
      for (let tag of uniqueTags) {
        if (this.mustKeywords.some(key => isTagsMatchKeyword([tag], key))) {
          this.highlightTagsSet.add(tag)
        }
      }
    },
    async preCalcuMatches() {
      await batcher.forEach(this.processedJobs, job => {
        job.mustMatches = this.mustKeywords.filter(key => isJobTagsMatchKeyword(job, key))
        job.notMatches = this.notKeywords.filter(key => isJobTagsMatchKeyword(job, key))
      })
    },
    // 這個工作的技能要求中，有多少比例符合你搜尋的關鍵字，越大表示這個工作越符合你的搜尋條件
    calcuRateForeachJob() {
      this.processedJobs.forEach(job => {
        let total = this.processedKeywords.length
        let notMisses = this.notKeywords.length - job.notMatches.length  // notMisses: 每少一個負面就加分
        let count = job.mustMatches.length + notMisses
        job.skillRate = count / total
      })
      console.log('rate')
    },
    // 對這份工作來說，關鍵字佔多重，越重表示這份工作越符合你
    calcuWeightForeachJob() {
      this.processedJobs.forEach(job => {
        let total = getTags(job).length
        let score = job.mustMatches.length - job.notMatches.length  // notMatches: 每有一個負面就扣分
        if (score < 0) score = 0
        if (score > total) score = total
        job.skillWeight = score / total
        job.skillWeightHint = `${prefixEach(job.mustMatches, '+')}${prefixEach(job.notMatches, '-')}共${score}項符合（${job.mustMatches.length}-${job.notMatches.length}），${score}/${total} = ${job.skillWeight}`
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
    calcuTotalRate() {
      // python佔6成，表示個別關鍵字佔整體市場多少工作
      let total = this.processedJobs.length
      this.skillRateDict = {}
      this.mustKeywords.forEach(key => {
        let count = utils.count(this.processedJobs, job => job.mustMatches.includes(key))
        this.skillRateDict[key] = count / total
      })
      this.notKeywords.forEach(key => {
        let count = utils.count(this.processedJobs, job => !job.notMatches.includes(key))
        this.skillRateDict['-' + key] = count / total
      })

      // 當一個工作每個關鍵字都符合，越多工作符合，表示該關鍵字可以代表很大的市場
      let count = 0
      this.processedJobs.forEach(job => {
        if (this.mustKeywords.length !== job.mustMatches.length)  // every
          return
        if (job.notMatches.length > 0)  // some
          return
        count++
      })
      this.skillRateNum = count / total
    },
    tagInKeywords(tag) {
      return this.highlightTagsSet.has(tag.toLowerCase())
    },
    toPercent(f) {
      return utils.toPercent(f)
    },
  },
  watch: {
    async keyword() {
      await this.updateResult()
    },
  },
  updated() {
    SetJobsAndPoses.updated(this.$refs.jobsView)
  },
  async activated() {
    await this.updateResult()
    SetJobsAndPoses.activated(this.$refs.jobsView)
    if (!this.keyword) this.loading = false
  },
  deactivated() {
    SetJobsAndPoses.deactivated()
  },
}
</script>

<style scoped lang='sass' src='@/styles/jobs.sass'></style>

<style lang='sass'>
@use '@/styles/variables.sass' as var
@use '@/styles/fonts.sass'

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