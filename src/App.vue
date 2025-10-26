<template>
  <div class="split-screen">
    <Site></Site>
    <DetailPreviewMobile v-if="isMobile"></DetailPreviewMobile>
    <DetailPreview v-else></DetailPreview>
  </div>
</template>

<script>
import Site from '@/components/Site.vue'
import { isMobile } from '@/js/rwd.js'
import DetailPreviewMobile from '@/components/DetailPreviewMobile.vue'
import DetailPreview from '@/components/DetailPreview.vue'

export default {
  components: {
    Site,
    DetailPreview,
    DetailPreviewMobile,
  },
  computed: {
    isMobile,
  },
}
</script>