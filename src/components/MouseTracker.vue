<template>
  <div class="cursor" :style="{left: x + 'px', top: y + 'px' }">
    <span class="point"></span>
    <span class="text">({{ x }}, {{ y }})</span>
  </div>
</template>

<script>
export default {
  data() {
    return {
      x: 0,
      y: 0,
    }
  },
  mounted() {
    document.body.addEventListener('mousemove', e => {
      this.x = e.clientX
      this.y = e.clientY
    })
  }
}
</script>

<style scoped lang="sass">
@use "@/styles/variables" as var
.cursor, .cursor *
  position: fixed
  pointer-events: none
  z-index: 9999

.cursor .point
  width: 8px
  height: 8px
  transform: translate(-50%, -50%)
  border-radius: 50%
  background: red

.cursor .text
  font-family: monospace
  color: red
</style>