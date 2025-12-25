<template>
  <div class='site'>
    <header class='pl-5 pr-5 pt-3 sticky top-0 bg-white z-40'>
      <SearchPanel @change='changeKeyword'/>
      <hr width='100%'>
    </header>
    <!-- 只在該範圍顯示滾動條，上級須設定為overflow-hidden/overflow-y-hidden -->
    <main class='mt-3 p-3 overflow-y-auto relative' @scroll='changeJobDetail'>
      <div class='tabs'>
        <button class='tab'
                :class="{active: activeTab==='jobSearch'}"
                @click="activeTab='jobSearch'">
          <i class='fas fa-search h-4 w-4'></i> 職缺搜尋結果
        </button>
        <button class='tab'
                :class="{active: activeTab==='keywordCoverage'}"
                @click="activeTab='keywordCoverage'">
          <i class='fas fa-bar-chart h-4 w-4'></i> 關鍵字覆蓋率分析
        </button>
        <button class='tab'
                :class="{active: activeTab==='skillRecommend'}"
                @click="activeTab='skillRecommend'">
          <i class='fas fa-pie-chart h-4 w-4'></i> 相關技能(1+1/1+2/1+3)
        </button>
        <button class='tab'
                :class="{active: activeTab==='bookmark'}"
                @click="activeTab='bookmark'">
          <i class='fas fa-star h-4 w-4'></i> 書籤清單
        </button>
      </div>
      <hr class='border-b-4 border-gray-100'>
      <div class='block'>
        <keep-alive>
          <component :is="activeTab + 'Result'" :jobs='jobs' :keyword='keyword'></component>
        </keep-alive>
      </div>
      <DrawRay :posY="rayPosY.top" color='orangered'/>
      <DrawRay :posY="rayPosY.center" color='fuchsia'/>
      <DrawRay :posY="rayPosY.bottom" color='aqua'/>
    </main>
    <footer class='bg-stone-300 text-stone-700'>© Elico.org - 版權所有</footer>
  </div>
</template>

<script>
import SearchPanel from '@/components/SearchPanel.vue'
import JobSearchResult from '@/components/results/JobSearchResult.vue'
import KeywordCoverageResult from '@/components/results/KeywordCoverageResult.vue'
import SkillRecommendResult from '@/components/results/SkillRecommendResult.vue'
import BookmarkResult from '@/components/results/BookmarkResult.vue'
import { jobs } from '@/js/jobsLoader.js'
import JobAtSiteCenter from '@/js/mobile/jobAtSiteCenter.js'
import { setCurrentJobDetail } from '@/js/mobile/detailPreviewMobile.js'
import { setKeyword } from '@/js/keyword.js'
import DrawRay from '@/components/utils/DrawRay.vue'

export default {
  components: {
    DrawRay,
    SearchPanel,
    JobSearchResult,
    KeywordCoverageResult,
    SkillRecommendResult,
    BookmarkResult,
  },
  data() {
    return {
      keyword: '',
      tabs: ['jobSearch', 'keywordCoverage', 'skillRecommend', 'bookmark'],
      activeTab: 'jobSearch',
      rayPosY: { top: 0, center: 0, bottom: 0 },
    }
  },
  methods: {
    changeKeyword(val) {
      this.keyword = val  // keywordJobSearch step 2
      setKeyword(val)
    },
    changeJobDetail(e) {
      JobAtSiteCenter.changeJobDetail(e)
      setCurrentJobDetail()
      let el = e.currentTarget
      this.rayPosY.top = el.scrollTop
      this.rayPosY.bottom = el.scrollTop + el.clientHeight
      this.rayPosY.center = el.scrollTop + (el.clientHeight * 0.5)
    },
  },
  computed: {
    jobs,
  },
}
</script>

<style src='@/styles/common.sass' lang='sass'></style>

<style scoped lang='sass'>
@use '@/styles/variables.sass' as var
// 讓頁腳footer固定在底部，無論main高度如何
.site
  display: grid
  grid-template-rows: auto 1fr auto
  grid-template-columns: minmax(0, 1fr)

.tab
  padding: 10px 20px
  outline: none
  border: none
  border-bottom: solid 2px transparent

  &.active
    border-bottom: solid 2px var.$blue
    color: var.$blue
</style>