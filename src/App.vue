<template>
  <div class="split-screen">
    <Site class="site"></Site>
    <DetailPreviewMobile
      v-if="isMobile"
      class="detail"
      :style="{order: order, flexBasis: height}">
    </DetailPreviewMobile>
    <DetailPreview v-else></DetailPreview>
    <AlertDialog></AlertDialog>
  </div>
</template>

<script>
import Site from '@/components/Site.vue'
import { isMobile } from '@/js/mobile/rwd.js'
import DetailPreviewMobile from '@/components/DetailPreviewMobile.vue'
import DetailPreview from '@/components/DetailPreview.vue'
import { config } from '@/js/mobile/changeOrder.js'
import AlertDialog from '@/components/AlertDialog.vue'

export default {
  components: {
    Site,
    DetailPreview,
    DetailPreviewMobile,
    AlertDialog,
  },
  computed: {
    isMobile,
    order() {
      return config.order
    },
    height() {
      return config.height
    },
  },
}
</script>

<style scoped lang="sass">
.split-screen
  display: flex
  flex-direction: column
  height: 100dvh
  overflow: hidden  // 隱藏原本整個畫面的滾動軸
.site
  flex: 1
  overflow-y: auto  // 只在該範圍顯示滾動軸
.detail
  flex-basis: 50dvh  // 統一把flex寫成flex-basis
  flex-grow: 0
  flex-shrink: 0
  overflow: hidden
</style>