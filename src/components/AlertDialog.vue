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
import AlertDialog from '@/js/AlertDialog.js'

let message = computed(() => AlertDialog.getMessage())
let hidden = computed(() => AlertDialog.getHidden())
</script>

<style scoped lang="sass">
@use '@/styles/variables' as var

.event-root
  position: fixed
  left: 0
  top: 0
  width: 0
  height: 0
  pointer-events: none

.alert-dialog
  +var.fixCenter
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