<template>
  <div class="container">  <!-- 用flexbox和order決定拉桿和內容顯示前後 -->
    <div class="resize-slider" v-on="sliderHandlers"></div>  <!-- 拉桿，手指拖曳上下決定要顯示多高的內容(預設位置:上) -->
    <div class="job-preview" v-on="orderHandlers">  <!-- 不管有無工作內容都會顯示的白色背景(預設位置:下) -->
      <div v-if="detail">
        <a :href="detail['job-href']" target="_blank">{{ detail['job'] }}</a>
        <p v-html="slicedContent"></p>
      </div>
      <div class="drag-preview" ref="drag-preview" v-if="dragging"></div>
      <div class="drag-outline" v-if="dragging"></div>
    </div>
  </div>
</template>

<script>
import { hoverJobDetail, config, updateBodyWidthHeight } from '@/js/detailPreview.js'
import { dictIncludes, setCookie, getCookie } from '@/js/utils.js'
import { useTouchEvent } from '@/js/touchEvent.js'
import Vec2 from '@/js/vec2.js'
import { config as coConfig } from '@/js/changeOrder.js'

let orderTouch = useTouchEvent()
let sliderTouch = useTouchEvent()

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

    orderHandlers() {
      return {
        touchstart: orderTouch.start,
        touchmove: orderTouch.update,
        touchend: orderTouch.stop,
        touchcancel: orderTouch.stop,
      }
    },
    sliderHandlers() {
      return {
        touchstart: sliderTouch.start,
        touchmove: sliderTouch.update,
        touchend: sliderTouch.stop,
        touchcancel: sliderTouch.stop,
      }
    },
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

    if (getCookie('startsAtBottom') !== undefined) {
      coConfig.startsAtBottom = getCookie('startsAtBottom')
      coConfig.order = coConfig.startsAtBottom ? 'initial' : -1
    }

    let pressPos = new Vec2(0, 0)
    orderTouch.config.onLongPress = (p1, p2) => {
      this.dragging = true
      pressPos.set(p1.x, p1.y)
    }
    orderTouch.config.onUpdate = (p1, p2) => {
      if (!this.dragging) return
      let pos = p1.clone()
      let h = this.$refs['drag-preview'].offsetHeight
      // 「從原本被按住的地方」跟著手指拖曳
      pos.x -= pressPos.x
      pos.y -= coConfig.startsAtBottom ? (pressPos.y - h) : (pressPos.y)
      // 正負20%內產生吸附的感覺
      let scale = 1
      if (p1.y <= h * 0.8) {
        pos.set(0, 0)
        coConfig.endsAtBottom = p1.y >= h
      }
      else if (p1.y >= h * 1.2) {
        pos.set(0, h)
        coConfig.endsAtBottom = p1.y >= h
      }
      else scale = 0.9
      Object.assign(this.$refs['drag-preview'].style, {
        position: 'fixed',
        left: pos.x + 'px',
        top: pos.y + 'px',
        height: '50vh',  // 仿App.vue裡給.detail的高度
        transform: `scale(${scale})`,
      })
    }
    orderTouch.config.onStop = (p1, p2) => {
      if (!this.dragging) return
      this.dragging = false
      Object.assign(this.$refs['drag-preview'].style, {
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        transform: 'initial',
      })
      coConfig.order = coConfig.endsAtBottom ? 'initial' : -1
      coConfig.startsAtBottom = coConfig.endsAtBottom
      setCookie('startsAtBottom', coConfig.startsAtBottom)
    }

    sliderTouch.config.onLongPress = (p1, p2) => {
      console.log('移動桿')
    }
    sliderTouch.config.onUpdate = (p1, p2) => {
      console.log('更新')
    }
    sliderTouch.config.onStop = (p1, p2) => {
      console.log('停止')
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
  position: relative

.drag-preview
  +var.size(100%, 100%)  // 不含margin、padding的部分
  background-color: rgba(orange, 0.4)
  z-index: 1
  position: absolute
  left: 0  // 設置到左上角無視padding
  top: 0

.drag-outline
  +var.size(100%, 100%)
  box-sizing: border-box
  border: solid 5px rgba(orange, 0.4)
  position: absolute
  left: 0
  top: 0

// 觸控的區域比顯示的區域大，比較不會按空
// 離上下空白多一點才不會誤觸其他功能
.resize-slider
  margin: 5px 0
  padding: var.$px10

  &:before
    display: block
    content: ''
    border-bottom: 5px solid #cfcfcf
</style>