<template>
  <div class="split-screen">
    <Site class="site"></Site>
    <DetailPreviewMobile v-if="isMobile" class="detail"
                         @touchstart="start($event)"
                         @touchmove="update($event)"
                         @touchend="stop($event)"
                         @touchcancel="stop($event)">
    </DetailPreviewMobile>
    <DetailPreview v-else></DetailPreview>
  </div>
</template>

<script>
import Site from '@/components/Site.vue'
import { isMobile } from '@/js/rwd.js'
import DetailPreviewMobile from '@/components/DetailPreviewMobile.vue'
import DetailPreview from '@/components/DetailPreview.vue'
import { start, update, stop, config } from '@/js/touchEvent.js'

export default {
  components: {
    Site,
    DetailPreview,
    DetailPreviewMobile,
  },
  computed: {
    isMobile,
  },
  methods: {
    start,
    update,
    stop,
  },
  mounted() {
    config.onLongPress = (p1, p2) => {
      console.log('長按', p1.toString(), p2.toString())
    }
    config.onStop = (p1, p2) => {
      console.log('停在', p1.toString(), p2.toString())
    }
    config.onUpdate = (p1, p2) => {
      console.log('更新座標', p1.toString(), p2.toString())
    }
  },
}
</script>

<style scoped lang="sass">
.split-screen
  display: flex
  flex-direction: column
  height: 100vh
  overflow: hidden  // 隱藏原本整個畫面的滾動軸
.site
  flex: 1
  overflow-y: auto  // 只在該範圍顯示滾動軸
.detail
  flex: 50vh
  flex-grow: 0
  flex-shrink: 0
</style>