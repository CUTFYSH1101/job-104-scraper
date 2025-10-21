<template>
  <div class="bar">
    <div class="value" :style="{width: width}"></div>
  </div>
</template>

<script>
export default {
  props: ['width'],
}
</script>

<style lang="sass">
@use "@/styles/variables.sass" as var

.bar
  background-color: var.$btnWhite
  width: 100%
  height: 5px
  border-radius: 50px
  overflow: hidden
  transform-origin: left
  animation: growUp 1s ease-out

  .value
    background-color: var.$btnBlue
    height: 100%

@keyframes growUp
  from
    transform: scaleX(0)
  to
    transform: scaleX(1)
</style>