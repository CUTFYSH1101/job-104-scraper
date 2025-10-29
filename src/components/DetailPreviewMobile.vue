<!-- container決定拖曳框的大小和整體的高度 -->
<template>
  <div class="container">  <!-- 用flexbox和order決定拉桿和內容顯示前後 -->
    <div class="flex flex-col h-100">
      <div class="resize-slider" v-on="sliderHandlers"></div>  <!-- 拉桿，手指拖曳上下決定要顯示多高的內容(預設位置:上) -->
      <div class="job-preview" v-on="orderHandlers" :style="{order: order}">  <!-- 不管有無工作內容都會顯示的白色背景(預設位置:下) -->
        <div v-if="detail">
          <a :href="detail['job-href']" target="_blank">{{ detail['job'] }}</a>
          <p v-html="slicedContent"></p>
        </div>
      </div>
    </div>
    <div class="drag-preview" ref="drag-preview" v-if="dragging"></div>
    <div class="drag-outline" v-if="dragging"></div>
  </div>
</template>

<script>
import { hoverJobDetail, config, updateBodyWidthHeight } from '@/js/detailPreview.js'
import { dictIncludes, setCookie, getCookie, windowHeight } from '@/js/utils.js'
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
      draggingSlider: false,
    }
  },
  computed: {
    slicedContent() {
      if (!dictIncludes(this.detail, this.keyName)) return ''
      let content = this.detail[this.keyName]
      if (this.contentLength >= content.length) return content
      else return content.slice(0, this.contentLength) + '...'
    },

    order() {
      return coConfig.order
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
      let top = this.$el.offsetTop
      let h = this.$refs['drag-preview'].offsetHeight
      let halfWindowHeight = windowHeight() / 2
      // 「從原本被按住的地方」跟著手指拖曳
      pos.x -= pressPos.x
      pos.y -= (pressPos.y - top)
      // 中線正負20%內產生吸附的感覺
      let scale = 1
      if (p1.y <= halfWindowHeight * 0.8) {
        pos.set(0, 0)
        coConfig.endsAtBottom = p1.y >= h
      }
      else if (p1.y >= halfWindowHeight * 1.2) {
        pos.set(0, halfWindowHeight * 2 - h)
        coConfig.endsAtBottom = p1.y >= h
      }
      else scale = 0.9
      Object.assign(this.$refs['drag-preview'].style, {
        position: 'fixed',
        left: pos.x + 'px',
        top: pos.y + 'px',
        height: coConfig.height,  // 仿App.vue裡給.detail的高度
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

    let startHeight = coConfig.height
    let pressSliderPos = new Vec2(0, 0)
    sliderTouch.config.onLongPress = (p1, p2) => {
      this.draggingSlider = true
      pressSliderPos.set(p1.x, p1.y)
      startHeight = coConfig.height
    }
    sliderTouch.config.onUpdate = (p1, p2) => {
      if (!this.draggingSlider) return
      let displaceY = p1.y - pressSliderPos.y
      let vh2px = parseFloat(startHeight) * 0.01 * windowHeight()
      if (coConfig.startsAtBottom) vh2px -= displaceY
      else vh2px += displaceY
      let px2vh = vh2px / windowHeight() * 100
      if (px2vh < 0) px2vh = 0
      if (px2vh > 100) px2vh = 100
      coConfig.height = px2vh + 'vh'
    }
    sliderTouch.config.onStop = (p1, p2) => {
      if (!this.draggingSlider) return
      this.draggingSlider = false
    }
  },
}
</script>

<style scoped lang="sass">
@use "@/styles/variables.sass" as var
@use "@/styles/tailwind" as tw

.container
  width: 100%
  padding: 0  // 貼邊
  position: relative

.job-preview
  width: 100%
  flex: 1  // 填充調整桿剩餘的高度
  padding: var.$px10
  background-color: white

.drag-preview
  +var.absCover
  background-color: rgba(orange, 0.4)
  z-index: 1

.drag-outline
  +var.absCover
  border: solid 5px rgba(orange, 0.4)
  box-sizing: border-box

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