<!-- 父物件需要設定 position 為 非 static，例如 position: relative -->
<template>
  <hr style='border: none;'
      class='absolute left-0 w-full z-50'
      :style='{top: posY + "px", borderBottom: `solid 3px ${color}`}'>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps(['posY', 'color'])
</script>