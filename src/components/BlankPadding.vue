<template>
<div :style="{height: h + 'vh'}" class="blank"></div>
</template>

<script setup>
import { ref } from 'vue'
let h = ref(50)
</script>

<style scoped lang="sass">
@use "@/styles/tailwind" as tw

div
  width: calc(100dvw - #{tw.$spacing * 4})
  box-sizing: border-box
</style>