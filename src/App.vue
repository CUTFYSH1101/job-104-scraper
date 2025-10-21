<template>
  <div class="site">
    <header class="page-header pl-5 pr-5 pt-3 pb-3">
      <SearchPanel @change="changeKeyword"></SearchPanel>
    </header>
    <main class="page-content mt-3 p-3">
      <div class="tabs">
        <button class="tab"
                :class="{active: activeTab==='jobSearch'}"
                @click="activeTab='jobSearch'">
          <i class="fas fa-search h-4 w-4"></i> 職缺搜尋結果
        </button>
        <button class="tab"
                :class="{active: activeTab==='keywordCoverage'}"
                @click="activeTab='keywordCoverage'">
          <i class="fas fa-bar-chart h-4 w-4"></i> 關鍵字覆蓋率分析
        </button>
        <button class="tab"
                :class="{active: activeTab==='skillRecommend'}"
                @click="activeTab='skillRecommend'">
          <i class="fas fa-pie-chart h-4 w-4"></i> 相關技能(1+1/1+2/1+3)
        </button>
      </div>
      <hr>
      <div class="block">
        <keep-alive>
          <component :is="activeTab + 'Result'" :keyword="keyword" :jobs="jobs"></component>
        </keep-alive>
      </div>
      <DetailPreview></DetailPreview>
    </main>
    <footer class="page-footer bg-stone-300 text-stone-700">© Elico.org - 版權所有</footer>

  </div>
</template>

<script>
import SearchPanel from "@/components/SearchPanel.vue"
import JobSearchResult from "@/components/JobSearchResult.vue"
import KeywordCoverageResult from "@/components/KeywordCoverageResult.vue"
import SkillRecommendResult from "@/components/SkillRecommendResult.vue"
import DetailPreview from "@/components/DetailPreview.vue"

export default {
  components: {
    SearchPanel,
    JobSearchResult,
    KeywordCoverageResult,
    SkillRecommendResult,
    DetailPreview,
  },
  data() {
    return {
      jobs: [],
      keyword: '',
      tabs: ['jobSearch', 'keywordCoverage', 'skillRecommend'],
      activeTab: 'jobSearch',
    }
  },
  methods: {
    changeKeyword(val) {
      this.keyword = val  // keywordJobSearch step 2
    },
  },
}
</script>

<style src="@/styles/common.sass" lang="sass"></style>
<style scoped lang="sass">
@use "@/styles/variables" as var
// 讓頁腳footer固定在底部，無論main高度如何
.site
  min-height: 100dvh
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

hr
  border: solid 2px var.$gray
  opacity: 100%
</style>
