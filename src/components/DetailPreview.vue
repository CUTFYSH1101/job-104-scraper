<template>
  <transition name="fade" mode="out-in">  <!-- 套用動畫 -->
    <div class="job-preview"
         @wheel.prevent="zoom"
         v-if="!hidden && !modeHidden"
         @mousemove="showDetail"
         @mouseleave="hideDetail">  <!-- 移動和縮放 -->
      <div v-if="includesDetail">  <!-- 內容用一個div裝著 -->
        <a :href="detail['job-href']" target="_blank">{{ detail['job'] }}</a>
        <p v-if="keyName === 'content'" class="salary">{{ detail['salary'] }}</p>
        <p v-html="slicedContent"></p>
      </div>
      <div class="empty" @mousemove="hideOnHoverBlackSpace($event)"></div>
    </div>
  </transition>
</template>
<script>
import {hoverJobDetail, config, updateBodyWidthHeight, showDetail, hideDetail} from '@/js/detailPreview.js'
import {dictIncludes} from '@/js/utils.js'
import Satisfied from "@/js/satisfied.js"
import {setCookie, getCookie} from "@/js/utils.js"

export default {
  data() {
    return {
      detail: {},
      fontSize: 1,
      originLength: 500,
      contentLength: this.originLength,
      includesDetail: false,
      domElement: null,
      contentDomElement: null,
      hidden: false,
      modeHidden: false,
      init: true,
      keyName: 'content',
    }
  },
  methods: {
    showDetail() {
      showDetail()
    },
    hideDetail() {
      hideDetail()
    },

    hideOnHoverBlackSpace(e) {
      Satisfied.update(e)
      if (Satisfied.getSatisfied()) {
        this.hidden = true
        console.log('隱藏')
      }
    },

    async loadDetail() {
      this.detail = await hoverJobDetail()
      if (!this.detail) {
        this.includesDetail = false
        return
      }
      this.includesDetail = true
      this.assignStyle()
    },
    zoom(e) {
      if (!dictIncludes(this.detail, 'content')) return

      let y = e.deltaY  // 正表示範圍變大，負表示字變大
      let unit = f => f / 111  // 最小單位
      this.fontSize -= unit(y) * 0.1
      if (this.fontSize < 0.54) this.fontSize = 0.54
      if (this.fontSize > 1.27) this.fontSize = 1.27
      this.assignStyle()
    },
    assignStyle() {
      if (this.hidden || this.modeHidden) return
      this.contentDomElement = this.$el.querySelector('p:not(.salary)')
      if (!this.contentDomElement) return

      // 文字為1/2倍時，可容納4倍文字，文字為1/3倍時，可容納9倍文字
      this.contentLength = Math.floor(this.originLength / (this.fontSize ** 2))
      Object.assign(this.contentDomElement.style, {
        fontSize: this.fontSize + 'rem',
        lineHeight: this.fontSize * 1.2 + 'rem',
        letterSpacing: this.fontSize + 'px',
        whiteSpace: 'pre-wrap',
      })

      let salaryDom = this.$el.querySelector('p.salary')
      let scale = 0.8
      if (!salaryDom) return
      Object.assign(salaryDom.style, {
        fontSize: this.fontSize * scale + 'rem',
        lineHeight: this.fontSize * 1.2 * scale + 'rem',
        letterSpacing: this.fontSize * scale + 'px',
        opacity: scale,
      })
    },

    async switchMode(e) {  // 0:關閉,其他:不動,切換模式:索引=e.key-1
      if (e.key === '0' && !this.modeHidden) {
        this.modeHidden = true
        window.addEventListener('keyup', this.switchMode)
        return
      }

      let mode = parseInt(e.key)
      if (mode <= 0) return
      if (!Object.keys(this.detail)[mode - 1]) return

      this.modeHidden = false
      this.keyName = Object.keys(this.detail)[mode - 1]
      await this.$nextTick()
      this.assignStyle()  // Vue 因為 keyName 改變而重新渲染 DOM，之前套用的樣式會消失，所以要重新套用
    },
  },
  computed: {
    slicedContent() {
      if (!dictIncludes(this.detail, this.keyName)) return ''
      let content = this.detail[this.keyName]
      if (this.contentLength >= content.length) return content
      else return content.slice(0, this.contentLength) + '...'
    },
  },
  watch: {
    domElement(newVal) {
      if (!newVal) config.onSetPos(_ => {
      })
      else {
        let assignPos = (x, y) =>
            Object.assign(this.domElement.style, {
              left: x + 'px',
              top: y + 'px',
            })
        config.onSetPos = async pos => {
          if (this.init && this.modeHidden) {
            await this.$nextTick()
            await this.loadDetail()
            if (this.includesDetail) this.init = false
          }

          if (this.hidden || this.modeHidden) return
          await this.$nextTick()  // 等 Vue 同步完變數與畫面，否則 this.domElement 可能還是上一幀已被替換的 DOM
          await this.loadDetail()  // 更換懸浮視窗的內容
          updateBodyWidthHeight()  // 即便畫面縮放也ok
          let x = pos[0], y = pos[1]
          let w = this.domElement.offsetWidth, h = this.domElement.offsetHeight
          // 超出右側
          let overRight = pos[0] + w - config.bodyWidth
          if (overRight > 0) {
            x = pos[0] - w  // 放到滑鼠左側
            if (x < 0) {  // 如果又超出左側，表示左右都放不下
              let overLeft = -x
              if (overRight < overLeft)  // 比較放哪邊顯示範圍比較大
                x = pos[0]  // 放回來
            }
          }
          // 超出下側
          let overBottom = pos[1] + h - config.bodyHeight
          if (overBottom > 0) {
            y = pos[1] - h
            if (y < 0) {
              let overTop = -y
              if (overBottom < overTop)
                y = pos[1]
            }
          }
          assignPos(x, y)
        }
      }
    },
    hidden(newVal) {
      if (newVal)
        window.removeEventListener('keyup', this.switchMode)
      else
        window.addEventListener('keyup', this.switchMode)
    },
    modeHidden(newVal) {
      setCookie('modeHidden', newVal)
    },
    keyName(newVal) {
      setCookie('keyName', newVal)
    },
  },
  mounted() {
    config.onHideDetail = () => this.hidden = true
    config.onShowDetail = async () => {
      this.hidden = false
      await this.$nextTick()  // 等待vue元素載入完成，才不會undefined
      this.domElement = this.$el
    }
    window.addEventListener('keyup', this.switchMode)
    if (getCookie('modeHidden'))
      this.modeHidden = getCookie('modeHidden')
    if (getCookie('keyName'))
      this.keyName = getCookie('keyName')
  },
}
</script>

<style scoped lang="sass">
@use "@/styles/variables.sass" as var

// 引用a樣式
@use "@/styles/jobs.sass"

=fillRemainingSpace()
  display: flex
  flex-direction: column
  .empty
    flex: 1

.job-preview
  position: fixed
  width: 40vw
  height: 400px
  z-index: 999
  border: solid 1px var.$gray
  border-bottom: solid 2px var.$gray
  background-color: white
  left: 0
  top: 0
  overflow: hidden
  padding: var.$px10
  +fillRemainingSpace

  // 仿104
  border-radius: 4px
  box-shadow: 0 2px 6px rgba(black, .1)
  font-family: Arial, MsJhengHeiBold, 微軟正黑體, Microsoft JhengHei, Roboto, PingFangTC, sans-serif

// fade-enter 表示 fade in, fade-leave 表示 fade out
.fade-enter-active, .fade-leave-active
  transition: opacity 0.3s ease

.fade-enter-from, .fade-leave-to
  opacity: 0

.fade-enter-to, .fade-leave-from
  opacity: 1
</style>