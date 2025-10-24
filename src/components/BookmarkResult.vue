<template>
  <div>
    <div>
      <button
        v-for="color in getColorMap"
        :style="{backgroundColor: color}"
        class="w-5 aspect-square rounded-full
         m-1 mb-4 duration-300
         hover:scale-125 active:scale-100"
        :class="{'scale-125': activeColor === color}"
        @click="activeColor = color"
      >
      </button>
    </div>
    <div>
      <div class="job" v-for="(job, i) in filterJobs">
        <Bookmark :job="job"></Bookmark>
        <a class="cell" :href="job.網址" target="_blank">{{ i + 1 }}:{{ job.工作名稱 }}</a>
        <div class="cell">{{ job.工作標籤 }}</div>
        <div class="cell">{{ job.關鍵字 }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import Bookmark from '@/components/Bookmark.vue'
import { getColorMap, getBookmark } from '@/js/bookmark.js'

export default {
  name: 'BookmarkResult',
  components: { Bookmark },
  props: ['jobs'],
  data() {
    return {
      activeColor: null,
    }
  },
  computed: {
    getColorMap,
    filterJobs() {
      if (this.activeColor === null) return this.jobs.filter(job => getBookmark(job['網址']))
      return this.jobs.filter(job => getBookmark(job['網址']) && getBookmark(job['網址']) === this.activeColor)
    },
  },
}
</script>

<style scoped lang="sass" src="@/styles/jobs.sass"></style>