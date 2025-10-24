<template>
  <div class="keyword-coverage">
    <div v-if="!isKeywordEmpty">
      <div class="analysis line-block mb-5">
        <div v-for="[key, value] in Object.entries(skillRateDict)" class="analysis-cell">
          {{ key }}佔{{ toPercent(value) }}
          <HorizontalBar :width="toPercent(value)"></HorizontalBar>
        </div>
        <div class="analysis-cell">
          總共{{ toPercent(skillRateNum) }}
          <HorizontalBar :width="toPercent(skillRateNum)"></HorizontalBar>
        </div>
      </div>
      <div class="job" v-for="job in processedJobs" @mousemove="userHoverJob($event, job)" @mouseleave="userLeaveJob">
        <Bookmark :job="job"></Bookmark>
        <a class="cell" :href="job.網址" target="_blank">{{ job.工作名稱 }}</a>
        <div class="cell">
        <span class="inline-block"
              v-for="tag in getTags(job)"
              :class="{highlight: tagInKeywords(tag)}">
          {{ tag }}
        </span>
        </div>
        <div class="cell">關鍵字比例：{{ toPercent(job.skillRate) }}</div>
        <HorizontalBar :width="toPercent(job.skillRate)"></HorizontalBar>
        <div class="cell">關鍵字比重：{{ toPercent(job.skillWeight) }}</div>
        <HorizontalBar :width="toPercent(job.skillWeight)"></HorizontalBar>
      </div>
    </div>
    <div v-else>
      <div class="job" v-for="(job, i) in processedJobs" @mousemove="userHoverJob($event, job)"
           @mouseleave="userLeaveJob">
        <Bookmark :job="job"></Bookmark>
        <a class="cell" :href="job.網址" target="_blank">{{ i + 1 }}:{{ job.工作名稱 }}</a>
        <div class="cell">
          <span class="inline-block" v-for="tag in getTags(job)">{{ tag }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as utils from '@/js/utils.js'
import * as config from '@/js/config.js'
import Batcher from '@/js/batcher.js'
import {getTags} from "@/js/utils.js";
import HorizontalBar from "@/components/HorizontalBar.vue"
import {userHoverJob, userLeaveJob} from "@/js/detailPreview.js"
import Bookmark from "@/components/Bookmark.vue"

let batcher = new Batcher()
batcher.batch = 10

export default {
  name: "KeywordCoverageResult",
  components: {
    Bookmark,
    HorizontalBar,
  },
  props: ['keyword', 'jobs'],
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
    },
    userLeaveJob() {
      userLeaveJob()
    },

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
      let keyword = this.keyword.toLowerCase().trim()  // 去除前後空格
      // 假設忘記在其中一個'-'前加上' '，補' '避免後續split(' ')失敗
      if (keyword.includes('-'))
        for (let i = 1; i < keyword.length; i++)
          if (keyword.charAt(i) === '-' && keyword.charAt(i - 1) !== ' ') {
            keyword = keyword.substring(0, i) + ' ' + keyword.substring(i)
            i++
          }
      if (!keyword.includes(' '))
        this.processedKeywords = [keyword]
      else
        this.processedKeywords = keyword.split(/\s+/)

      this.mustKeywords = this.processedKeywords.filter(key => !this.isStartsWithDash(key))
      this.notKeywords = this.processedKeywords.filter(key => this.isStartsWithDash(key)).map(key => this.dumpFirst(key))
    },
    // 這個工作的技能要求中，有多少比例符合你搜尋的關鍵字，越大表示這個工作越符合你的搜尋條件
    async calcuRateForeachJob() {
      await batcher.forEach(this.processedJobs, job => {
        let total = this.processedKeywords.length
        let must = this.mustKeywords.filter(key => this.jobIncludesKeyword(job, key))
        let not = this.notKeywords.filter(key => !this.jobIncludesKeyword(job, key))  // 全都不包含算符合一次
        let count = must.length + not.length
        job.skillRate = count / total
        console.log('rate')
      })
    },
    // 對這份工作來說，關鍵字佔多重，越重表示這份工作越符合你
    async calcuWeightForeachJob() {
      await batcher.forEach(this.processedJobs, job => {
        let total = utils.getTags(job).length
        let must = this.mustKeywords.filter(key => this.jobIncludesKeyword(job, key))
        let not = this.notKeywords.filter(key => this.jobIncludesKeyword(job, key))  // 每有一個就扣分
        let score = must.length - not.length
        if (score < 0) score = 0
        if (score > total) score = total
        job.skillWeight = score / total
        job.skillWeightHint = `+${must.join('+')}-${not.join('-')}=${score} => ${score}/${total}=${job.skillWeight}`
        console.log('weight')
      })
    },
    // 按照搜尋結果排序
    sortJobs() {
      console.log('排序工作')
      this.processedJobs.sort((a, b) => {
        if (a.skillRate > b.skillRate) return -1
        else if (a.skillRate < b.skillRate) return 1
        else if (a.skillWeight > b.skillWeight) return -1
        else if (a.skillWeight < b.skillWeight) return 1
        else return 0
      })
    },
    async calcuTotalRate() {
      // python佔6成，表示個別關鍵字佔整體市場多少工作
      let total = this.processedJobs.length
      this.skillRateDict = {}
      this.mustKeywords.forEach(key => {
        let count = utils.count(this.processedJobs, job => this.jobIncludesKeyword(job, key))
        this.skillRateDict[key] = count / total
      })
      this.notKeywords.forEach(key => {
        let count = utils.count(this.processedJobs, job => !this.jobIncludesKeyword(job, key))
        this.skillRateDict['-' + key] = count / total
      })

      // 當一個工作每個關鍵字都符合，越多工作符合，表示該關鍵字可以代表很大的市場
      let count = 0
      await batcher.forEach(this.processedJobs, job => {
        if (!this.mustKeywords.every(key => this.jobIncludesKeyword(job, key)))
          return
        if (this.notKeywords.some(key => this.jobIncludesKeyword(job, key)))
          return
        count++
      })
      this.skillRateNum = count / total
    },
    jobIncludesKeyword(job, key) {
      let tags = utils.getLowerTags(job)

      // 檢查別名，當關鍵字涵蓋別名key，去查詢別名value是否出現在job
      if (config.keywordAliases[key]) {
        return config.keywordAliases[key].some(alias => tags.includes(alias))
      }

      return tags.includes(key)
    },
    tagInKeywords(tag) {
      // 檢查別名
      for (let key of this.mustKeywords)
        if (config.keywordAliases[key] &&
            config.keywordAliases[key].some(alias => tag.toLowerCase() === alias))
          return true

      return this.mustKeywords.includes(tag.toLowerCase())
    },
    toPercent(f) {
      return utils.toPercent(f)
    },
    isStartsWithDash(word) {
      return word.startsWith('-')
    },
    dumpFirst(word) {
      return word.substring(1)
    },
  },
  watch: {
    keyword() {
      this.updateResult()
    },
  },
  mounted() {
    this.updateResult()
  },
}
</script>
<style scoped lang="sass" src="@/styles/jobs.sass"></style>

<style lang="sass">
@use "@/styles/variables.sass" as var

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