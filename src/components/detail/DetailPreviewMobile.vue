<!-- container決定拖曳框的大小和整體的高度 -->
<template>
  <div class='container'>  <!-- 用flexbox和order決定拖曳桿和內容顯示前後 -->
    <div class='flex flex-col h-full' :class="{'flex-col-reverse': order === -1}">
      <!-- 拖曳桿，手指拖曳上下決定要顯示多高的內容(預設位置:上) -->
      <div class='resize-slider' v-on='sliderHandlers' ref='resize-slider'></div>
      <div class='job-preview' v-on='orderHandlers' @wheel.prevent='zoom' ref='jobPreview'>  <!-- 不管有無工作內容都會顯示的白色背景(預設位置:下) -->
        <div v-if='detail'>
          <a :href="detail['job-href']" target='_blank'>{{ detail['job'] }}</a>
          <p v-html='highlightText(slicedContent)' :style='contentStyle' ref='content'></p>
        </div>
        <!-- 在上方時距離底部的拖曳桿遠點避免重疊 -->
        <KeyHint :keys="['1','2','3','4','5','6']" :bottom="order === -1 ? '1.5rem' : '0.5rem'"/>
      </div>
    </div>
    <div class='drag-preview' ref='drag-preview' v-if='dragging'></div>
    <div class='drag-outline' v-if='dragging'></div>
  </div>
</template>

<script>
import { dictIncludes, setCookie, getCookie, windowHeight, dvh2px, px2dvh, isFalsy } from '@/js/utils.js'
import { useTouchEvent } from '@/js/mobile/touchEvent.js'
import Vec2 from '@/js/mobile/vec2.js'
import { config as coConfig } from '@/js/mobile/changeOrder.js'
import { getCurrentJobDetail } from '@/js/mobile/detailPreviewMobile.js'
import KeyHint from '@/components/KeyHint.vue'
import { highlightText } from '@/js/highlight.js'
import { getKeyword } from '@/js/keyword.js'

let orderTouch = useTouchEvent()
let sliderTouch = useTouchEvent()
let resizeTouch = useTouchEvent()

export default {
  components: { KeyHint },
  data() {
    return {
      keyName: 'content',
      originLength: 500,
      contentLength: 0,
      fontSize: 1,
      step: 50,

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
    detail() {
      return getCurrentJobDetail()
    },

    order() {
      return coConfig.order
    },
    orderHandlers() {
      return {
        touchstart: e => {
          orderTouch.start(e)
          resizeTouch.start(e)
        },
        touchmove: e => {
          orderTouch.update(e)
          resizeTouch.update(e)
        },
        touchend: () => {
          orderTouch.stop()
          resizeTouch.stop()
        },
        touchcancel: orderTouch.stop,
        mousedown: e => orderTouch.mousedown(e),
      }
    },
    sliderHandlers() {
      return {
        touchstart: sliderTouch.start,
        touchmove: sliderTouch.update,
        touchend: sliderTouch.stop,
        touchcancel: sliderTouch.stop,
        mousedown: e => sliderTouch.mousedown(e),
      }
    },
    contentStyle() {
      return {
        fontSize: this.fontSize + 'rem',
        lineHeight: this.fontSize * 1.2 + 'rem',
        letterSpacing: this.fontSize + 'px',
      }
    },
  },
  methods: {
    switchMode(e) {
      let mode = parseInt(e.key)
      if (mode <= 0) return
      if (!this.detail || !Object.keys(this.detail)[mode - 1]) return

      this.modeHidden = false
      this.keyName = Object.keys(this.detail)[mode - 1]
    },
    zoom(e) {
      if (!dictIncludes(this.detail, 'content')) return

      let y = e.deltaY  // 正表示範圍變大，負表示字變大
      let unit = f => f / 111  // 最小單位
      this.fontSize -= unit(y) * 0.1
      if (this.fontSize < 0.54) this.fontSize = 0.54
      if (this.fontSize > 1.27) this.fontSize = 1.27
      this.calcuContentTextLength()
    },
    highlightText(text) {
      if (isFalsy(getKeyword())) return text
      return highlightText(text, getKeyword())
    },
    async calcuContentTextLength() {
      this.contentLength = this.originLength
      let outerH = this.$refs.jobPreview.offsetHeight
      let innerH = this.$refs.content.offsetHeight
      for (let i = 0; i < this.originLength; i += this.step) {
        await this.$nextTick()
        outerH = this.$refs.jobPreview.offsetHeight
        innerH = this.$refs.content.offsetHeight
        if (this.order !== -1 && innerH * 1.2 <= outerH) break
        if (this.order === -1 && innerH * 1.3 <= outerH) break  // 在上方時要多抓一段距離
        this.contentLength -= this.step
      }
    },
  },
  mounted() {
    this.contentLength = this.originLength

    if (getCookie('startsAtBottom') !== undefined) {
      coConfig.startsAtBottom = getCookie('startsAtBottom')
      coConfig.order = coConfig.startsAtBottom ? 'initial' : -1
    }

    let pressPos = new Vec2(0, 0)
    orderTouch.config.onLongPress = (p1, p2) => {
      if (resizing) return  // 如果正在拖曳字體大小
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
        coConfig.endsAtBottom = false
      }
      else if (p1.y >= halfWindowHeight * 1.2) {
        pos.set(0, halfWindowHeight * 2 - h)
        coConfig.endsAtBottom = true
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
      this.calcuContentTextLength()  // 拖曳後容納的字數也會改變
      coConfig.order = coConfig.endsAtBottom ? 'initial' : -1
      coConfig.startsAtBottom = coConfig.endsAtBottom
      setCookie('startsAtBottom', coConfig.startsAtBottom)
    }

    if (getCookie('detailHeight') !== undefined)
      coConfig.height = getCookie('detailHeight')

    let startHeight = coConfig.height
    let pressSliderPos = new Vec2(0, 0)
    sliderTouch.config.onLongPress = (p1, p2) => {
      this.draggingSlider = true
      pressSliderPos.set(p1.x, p1.y)
      startHeight = coConfig.height
      this.$refs['resize-slider'].classList.add('dragging')
    }
    sliderTouch.config.onUpdate = async (p1, p2) => {
      if (!this.draggingSlider) return
      let displaceY = p1.y - pressSliderPos.y
      let minDvh = px2dvh(20)  // 從上到下：m5 p5 bt5 p5，共20px
      let px = dvh2px(startHeight)
      if (coConfig.startsAtBottom) px -= displaceY
      else px += displaceY
      let dvh = px2dvh(px)
      if (dvh < minDvh) dvh = minDvh
      if (dvh > 100) dvh = 100
      coConfig.height = dvh + 'dvh'
      await this.calcuContentTextLength()
    }
    sliderTouch.config.onStop = (p1, p2) => {
      if (!this.draggingSlider) return
      this.draggingSlider = false
      this.$refs['resize-slider'].classList.remove('dragging')
      setCookie('detailHeight', coConfig.height)
    }

    window.addEventListener('mouseup', orderTouch.mouseup)
    window.addEventListener('mouseup', sliderTouch.mouseup)
    window.addEventListener('keyup', this.switchMode)

    let d0 = 0
    let resizing = false
    resizeTouch.config.timeoutMs = 0
    resizeTouch.config.onLongPress = (p1, p2) => {
      if (resizeTouch.config.length < 2) return
      resizing = true
      d0 = Vec2.distance(p1, p2)
    }
    resizeTouch.config.onUpdate = async (p1, p2) => {
      if (!resizing) return
      let d = Vec2.distance(p1, p2)
      let move = 0
      if (Math.abs(d - d0) > 0.01) move = d - d0
      this.fontSize += move * 0.0005
      if (this.fontSize < 0.54) {
        d0 = d  // 重設，這樣才能馬上縮小
        this.fontSize = 0.54
      }
      if (this.fontSize > 1.27) {
        d0 = d  // 才能馬上放大
        this.fontSize = 1.27
      }
      await this.calcuContentTextLength()
    }
    resizeTouch.config.onStop = (p1, p2) => {
      if (!resizing) return
      resizing = false
    }
  },
  unmounted() {
    window.removeEventListener('mouseup', orderTouch.mouseup)
    window.removeEventListener('mouseup', sliderTouch.mouseup)
    window.removeEventListener('keyup', this.switchMode)
  },
}
</script>

<style scoped lang='sass'>
@use '@/styles/variables.sass' as var
@use '@/styles/tailwind.sass' as tw
@use '@/styles/jobDetail.sass'
@use 'sass:math'

// 引用a樣式
+jobDetail.aStyle
.job-preview a
  display: block
  width: fit-content
  +tw.mb(1)

.container
  width: 100%
  padding: 0  // 貼邊
  position: relative

.job-preview
  width: 100%
  flex: 1  // 填充拖曳桿剩餘的高度
  padding: var.$px10
  background-color: white
  +jobDetail.content104Style
  white-space: pre-wrap

.drag-preview
  +var.absCover
  background-color: var(--drag-orange)
  z-index: 1
  cursor: grabbing

.drag-outline
  +var.absCover
  border: solid 5px var(--drag-orange)
  box-sizing: border-box

// 觸控的區域比顯示的區域大，比較不會按空
// 離上下空白多一點才不會誤觸其他功能
// 從上到下：m5 p5 bt5 p5，共20px
.resize-slider
  margin: 5px 0
  padding: 5px #{math.div(100 - 20, 2)}dvw  // 長度為20dvw
  transition: 0.5s

  &:before
    display: block
    content: ''
    border-bottom: 5px solid #cfcfcf
    border-radius: 10px

  &.dragging
    padding: 5px #{math.div(100 - 15, 2)}dvw
    background-color: var.$dragOrange
    cursor: row-resize
</style>

<style lang='sass'>
@use '@/styles/highlight.sass'

p.highlight, p .highlight
  +highlight.defaultStyle
  font-weight: initial

.hidden
  display: none
</style>