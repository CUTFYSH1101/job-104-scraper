<template>
  <div class='font-bold top-panel'>
    <div class='tool-panel'>  <!-- 工具區 -->
      <div class='input-wrapper'>  <!-- 搜尋框 -->
        <i class='fa fa-search input-icon opacity-60'></i>
        <!-- 使用.stop阻止鍵盤事件向外冒泡，避免被 window 鍵盤事件監聽捕獲到 -->
        <input class='search-input' type='text' v-model='keyword' @keydown.stop='handleKeydown' @keyup.stop=''
               placeholder='例：python django -高級'>
        <button class='search-btn' @click='addHistory()'><i class='fa fa-plus'></i></button>
      </div>
      <ChangeOpenFile/>
    </div>
    <div class='history-panel'>  <!-- 搜尋紀錄 -->
      <div class='m-2 opacity-80 inline-block'>搜尋紀錄</div>
      <button class='m-1 history-btn opacity-60 cursor-pointer inline-block'
              v-for='history in historyKeywords'
              @click='keyword = history'>
        {{ history }}
      </button>
    </div>
  </div>
</template>

<script>
import { setCookie, getCookie, insert, debounce } from '@/js/core/utils.js'
import ChangeOpenFile from '@/components/ChangeOpenFile.vue'
import {isMobile} from '@/js/mobile/rwd.js'

export default {
  components: { ChangeOpenFile },
  data() {
    return {
      localKeyword: '',
      historyKeywords: [],
      emitChange: debounce(val => this.$emit('keyword-change', val), 150)
    }
  },
  methods: {
    handleKeydown(e) {
      if (e.key === 'Enter')
        this.addHistory()
    },
    addHistory() {
      this.historyKeywords = insert(this.historyKeywords, 0, this.localKeyword)  // pushFirst
      this.historyKeywords = [...new Set(this.historyKeywords)]
      this.historyKeywords = this.historyKeywords.slice(0, 20)  // 限制在20筆以內
      this.localKeyword = ''
      setCookie('historyKeywords', this.historyKeywords)
    }
  },
  computed: {
    keyword: {
      get() {
        return this.localKeyword
      },
      set(val) {
        this.localKeyword = val
        this.emitChange(val)  // keywordJobSearch step 1 (debounced)
      }
    },
    isMobile,
  },
  mounted() {
    this.historyKeywords = getCookie('historyKeywords')  // 初始化時先載入cookie
    if (!this.historyKeywords) this.historyKeywords = []
  }
}
</script>

<style scoped lang='sass'>
@use '@/styles/variables.sass' as var
@use '@/styles/rwd.sass'
@use '@/styles/tailwind.sass' as tw

.tool-panel
  float: right
  +tw.ml(5)
  +tw.mb(5)

// <editor-fold desc='搜尋框'>
.input-wrapper
  position: relative

.input-wrapper, .search-input
  width: 100%
  min-width: 300px
  max-width: 400px

.input-icon
  +var.absVerticalCenter()
  left: 0.75rem
  font-size: 1rem

.search-btn
  +var.absVerticalCenter()
  right: 0.75rem
  +var.size(2rem)
  font-size: 0.8rem
  background-color: var.$blue
  color: white
  border-radius: var.$infinity

  &:hover
    filter: brightness(105%)

  &:active
    transform: scale(90%) translateY(-50%)

.search-input
  outline: var.$gray
  border: solid 1px var.$gray
  padding: 0.75rem 2.5rem
  border-radius: var.$infinity
  margin-right: 5px

  &:focus, &:active
    border: solid 1px var.$dark
// </editor-fold>

// <editor-fold desc='歷史紀錄'>
.history-btn
  border: solid 1px var.$gray
  background-color: white
  border-radius: var.$infinity
  padding: 0.5rem 1rem

  &:hover
    filter: brightness(95%)
// </editor-fold>

// 手機
+rwd.mobile
  *
    border-color: #ccc !important
  .top-panel
    display: flex
    flex-direction: column
  .tool-panel
    float: left
    margin-left: initial
  .history-panel
    display: none
  .search-btn
    display: none
</style>