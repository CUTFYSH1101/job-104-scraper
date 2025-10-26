<template>
  <div class="container">  <!-- 用flexbox和order決定拉桿和內容顯示前後 -->
    <hr class="adjust-pos-bar">  <!-- 拉桿，手指拖曳上下決定要顯示多高的內容(預設位置:上) -->
    <div class="job-preview">  <!-- 不管有無工作內容都會顯示的白色背景(預設位置:下) -->
      <div v-if="detail">
        <a :href="detail['job-href']" target="_blank">{{ detail['job'] }}</a>
        <p v-html="slicedContent"></p>
      </div>
    </div>
  </div>
</template>

<script>
import { hoverJobDetail, config, updateBodyWidthHeight } from '@/js/detailPreview.js'
import { dictIncludes } from '@/js/utils.js'

export default {
  data() {
    return {
      detail: {},
      keyName: 'content',
      contentLength: 50,
    }
  },
  computed: {
    slicedContent() {
      if (!dictIncludes(this.detail, this.keyName)) return ''
      let content = this.detail[this.keyName]
      if (this.contentLength >= content.length) return content
      else return content.slice(0, this.contentLength) + '...'
    }
  },
  mounted() {
    this.detail = {
      'job-href': 'https://www.google.com/',
      'job': 'google工程師',
      'content': '舉杯邀明月，對影成三人。\n' +
        '月既不解飲，影徒隨我身。\n' +
        '暫伴月將影，行樂須及春。\n' +
        '我歌月徘徊，我舞影零亂。\n' +
        '醒時同交歡，醉後各分散。\n' +
        '永結無情遊，相期邈雲漢。'
    }
  },
}
</script>

<style scoped lang="sass">
@use "@/styles/variables.sass" as var
@use "@/styles/tailwind" as tw

.container
  +var.size(calc(100dvw - #{tw.$spacing * 4}), 50vh)
  padding: 0  // 貼邊
  box-sizing: border-box

.job-preview
  +var.size(100%, 100%)
  background-color: white
  box-sizing: border-box
</style>