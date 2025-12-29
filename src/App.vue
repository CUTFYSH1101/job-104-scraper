<template>
  <div class='split-screen'>
    <Site class='site'/>
    <DetailPreviewMobile
      v-if='isMobile && !getIsGraphPage'
      class='detail z-50'
      :style='{order: order, flexBasis: height}'/>
    <DetailPreview v-else/>
  </div>
</template>

<script>
import Site from '@/components/Site.vue'
import { isMobile } from '@/js/mobile/rwd.js'
import { getIsGraphPage } from '@/js/graphPage.js'
import DetailPreviewMobile from '@/components/detail/DetailPreviewMobile.vue'
import DetailPreview from '@/components/detail/DetailPreview.vue'
import { config } from '@/js/mobile/changeOrder.js'

export default {
  components: {
    Site,
    DetailPreview,
    DetailPreviewMobile,
  },
  computed: {
    isMobile,
    getIsGraphPage,
    order() {
      return config.order
    },
    height() {
      return config.height
    },
  },
}
</script>

<style scoped lang='sass'>
.split-screen
  display: flex
  flex-direction: column
  height: 100dvh
  overflow: hidden  // 隱藏原本整個畫面的滾動軸

.detail
  flex-basis: 50dvh  // 統一把flex寫成flex-basis
  flex-grow: 0
  flex-shrink: 0
  overflow: hidden
</style>