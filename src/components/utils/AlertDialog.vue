<template>
  <div class="event-root">  <!-- 用來保持這個程序不關閉 -->
    <transition name="fade" mode="out-in">
      <div class="alert-dialog" v-if="!hidden">  <!-- 顯示幾秒後關閉，每次呼叫時會再顯示 -->
        {{ message }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AlertDialog from '@/js/alertDialog.js'

let message = computed(() => AlertDialog.getMessage())
let hidden = computed(() => AlertDialog.getHidden())
</script>

<style scoped lang="sass">
@use '@/styles/variables.sass' as var

.event-root
  +var.hiddenButChildrenVisible

.alert-dialog
  +var.fixTop
  top: 5dvh
  width: fit-content
  max-width: 90dvw
  white-space: pre-wrap
  padding: 5px 10px
  border-radius: 10px
  background-color: #edeef0
  font-family: "JetBrains Mono", monospace

.fade-enter-active, .fade-leave-active
  transition: opacity 0.1s ease

.fade-enter-from, .fade-leave-to
  opacity: 0

.fade-enter-to, .fade-leave-from
  opacity: 1
</style>