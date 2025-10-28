<template>
  <div class="container" v-on="touchHandlers">  <!-- 用flexbox和order決定拉桿和內容顯示前後 -->
    <hr class="adjust-pos-bar">  <!-- 拉桿，手指拖曳上下決定要顯示多高的內容(預設位置:上) -->
    <div class="job-preview">  <!-- 不管有無工作內容都會顯示的白色背景(預設位置:下) -->
      <div v-if="detail">
        <a :href="detail['job-href']" target="_blank">{{ detail['job'] }}</a>
        <p v-html="slicedContent"></p>
      </div>
      <div class="drag-preview" ref="drag-preview"></div>
    </div>
  </div>
</template>

<script>
import { hoverJobDetail, config, updateBodyWidthHeight } from '@/js/detailPreview.js'
import { dictIncludes } from '@/js/utils.js'
import { start, update, stop, config as teConfig } from '@/js/touchEvent.js'

export default {
  data() {
    return {
      detail: {},
      keyName: 'content',
      contentLength: 50,

      dragging: false,
    }
  },
  computed: {
    slicedContent() {
      if (!dictIncludes(this.detail, this.keyName)) return ''
      let content = this.detail[this.keyName]
      if (this.contentLength >= content.length) return content
      else return content.slice(0, this.contentLength) + '...'
    },

    touchHandlers() {
      return {
        touchstart: this.start,
        touchmove: this.update,
        touchend: this.stop,
        touchcancel: this.stop,
      }
    },
  },
  methods: {
    start,
    update,
    stop,
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

    teConfig.onLongPress = (p1, p2) => {
      console.log('長按', p1.toString(), p2.toString())
      this.dragging = true
    }
    teConfig.onStop = (p1, p2) => {
      console.log('停在', p1.toString(), p2.toString())
      Object.assign(this.$refs['drag-preview'].style, {
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
      })
    }
    teConfig.onUpdate = (p1, p2) => {
      console.log('更新座標', p1.toString(), p2.toString())
      let pos = p1
      Object.assign(this.$refs['drag-preview'].style, {
        position: 'fixed',
        left: pos.x + 'px',
        top: pos.y + 'px',
        height: '50vh',  // 仿App.vue裡給.detail的高度
      })
    }
  },
}
</script>

<style scoped lang="sass">
@use "@/styles/variables.sass" as var
@use "@/styles/tailwind" as tw

.container
  +var.size(100dvw, 50vh)
  padding: 0  // 貼邊
  box-sizing: border-box

.job-preview
  +var.size(100%, 100%)
  padding: var.$px10
  background-color: white
  box-sizing: border-box
  position: relative

.drag-preview
  +var.size(100%, 100%)
  background-color: rgba(orange, 0.4)
  z-index: 1
  position: absolute
  left: 0
  top: 0
</style>