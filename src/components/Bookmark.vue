<template>
  <div class="event-listener" @mousemove="userHoverJob" @mouseover="userLeaveJob">
    <div class="bookmark" v-if="getBookmark()" :style="{backgroundColor:getBookmark()}"></div>
  </div>
</template>

<script>
import {getBookmark, startListening, stopListening} from '@/js/bookmark.js'

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
  },
}
</script>

<style scoped lang="sass">
.event-listener
  position: absolute
  inset: 0
  margin: 0
  box-sizing: border-box

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