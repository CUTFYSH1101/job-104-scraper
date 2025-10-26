<template>
  <Site></Site>
</template>

<script>
import Site from '@/components/Site.vue'
import { isMobile } from '@/js/rwd.js'

export default {
  components: {
    Site,
  },
  computed: {
    isMobile,
  },
}
</script>