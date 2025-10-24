<template>
  <div class="font-bold" v-if="!isMobile">
    <div class="float-right ml-5 mb-5">
      <div class="input-wrapper">
        <i class="fa fa-search input-icon opacity-60"></i>
        <input class="search-input" type="text" v-model="keyword" v-on:keydown.enter="addHistory()"
               placeholder="例：python django -高級">
        <button class="search-btn" @click="addHistory()"><i class="fa fa-plus"></i></button>
      </div>
      <ChangeOpenFile></ChangeOpenFile>
    </div>
    <div>
      <div class="mt-2 opacity-80 inline-block">搜尋紀錄</div>
      <button class="historyBtn opacity-60 cursor-pointer inline-block"
              v-for="history in historyKeywords"
              @click="keyword = history">
        {{ history }}
      </button>
    </div>
  </div>

  <!-- 手機版 -->
  <div v-else>
    <div class="input-wrapper">
      <i class="fa fa-search input-icon opacity-60"></i>
      <input class="search-input" type="text" v-model="keyword" v-on:keydown.enter="addHistory()"
             placeholder="例：python django -高級">
      <button class="search-btn" @click="addHistory()"><i class="fa fa-plus"></i></button>
    </div>
    <ChangeOpenFile></ChangeOpenFile>
    <div>
      <div class="mt-2 opacity-80">搜尋紀錄</div>
      <button class="historyBtn opacity-60 cursor-pointer"
              v-for="history in historyKeywords"
              @click="keyword = history">
        {{ history }}
      </button>
    </div>
  </div>
</template>

<script>
import {setCookie, getCookie} from '@/js/utils'
import ChangeOpenFile from '@/components/ChangeOpenFile.vue'
import {isMobile} from '@/js/rwd.js'

export default {
  components: {ChangeOpenFile},
  data() {
    return {
      localKeyword: '',
      historyKeywords: [],
    }
  },
  methods: {
    addHistory() {
      this.historyKeywords.push(this.localKeyword)
      this.historyKeywords = [...new Set(this.historyKeywords)]
      this.localKeyword = ''
      setCookie('historyKeywords', this.historyKeywords)
    },
  },
  computed: {
    keyword: {
      get() {
        return this.localKeyword
      },
      set(val) {
        this.localKeyword = val
        this.$emit('change', this.keyword)  // keywordJobSearch step 1
      },
    },
    isMobile() {
      return isMobile.value
    }
  },
  mounted() {
    this.historyKeywords = getCookie('historyKeywords')  // 初始化時先載入cookie
    if (!this.historyKeywords) this.historyKeywords = []
  },
}
</script>

<style scoped lang="sass">
@use "@/styles/variables.sass" as var
@use "@/styles/rwd.sass"

// input
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

.historyBtn
  border: solid 1px var.$gray
  background-color: white
  border-radius: var.$infinity
  padding: 0.5rem 1rem
  margin: 5px

  &:hover
    filter: brightness(95%)

// 手機
+rwd.mobile
  *
    border-color: #ccc !important
  .prompt
    flex-direction: column !important
  .historyBtn
    border: none
    color: black
    background-color: var.$gray
</style>