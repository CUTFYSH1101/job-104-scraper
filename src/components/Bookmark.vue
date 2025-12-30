<template>
  <div class='event-listener' ref='eventListener'>
    <div class='bookmark' v-if='getBookmark()' :style='{backgroundColor: getBookmark()}'></div>
  </div>
</template>

<script>
import { getBookmark, startListening, stopListening } from '@/js/bookmark.js'

export default {
  props: ['job'],
  methods: {
    userHoverJob() {
      startListening(this.job)
    },
    userLeaveJob() {
      stopListening()
    },
    getBookmark() {
      return getBookmark(this.job['網址'])
    },
    touchstart(e) {
      const touch = e.touches[0]
      const element = this.$refs.eventListener
      const rect = element.getBoundingClientRect()

      const isInside = (
          touch.clientX >= rect.left &&
          touch.clientX <= rect.right &&
          touch.clientY >= rect.top &&
          touch.clientY <= rect.bottom
      )

      if (isInside) this.userHoverJob()
    },
    mousemove(e) {
      const element = this.$refs.eventListener
      const rect = element.getBoundingClientRect()

      const isInside = (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
      )

      if (isInside) this.userHoverJob()
    },
  },
  activated() {
    window.addEventListener('touchstart', this.touchstart)
    window.addEventListener('mousemove', this.mousemove)
  },
  deactivated() {
    window.removeEventListener('touchstart', this.touchstart)
    window.removeEventListener('mousemove', this.mousemove)
  }
}
</script>

<style scoped lang='sass'>
.event-listener
  position: absolute
  inset: 0
  margin: 0
  box-sizing: border-box
  z-index: -1  // 避免遮擋原來的<a>標籤造成無法click
  pointer-events: none

  // 跟job圓角一致
  border-radius: 5px
  overflow: hidden

  .bookmark
    position: relative
    right: 0
    top: 50%
    transform: translateY(-50%)
    width: 5px
    height: 10%
    min-height: 10px
    max-height: 30px
    border-radius: 0 5px 5px 0
</style>