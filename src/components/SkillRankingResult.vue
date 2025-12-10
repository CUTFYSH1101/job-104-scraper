<template>
  <div ref="container" class="container-ranking">
    <svg ref="svgRef"></svg>
  </div>
</template>

<script>
export default {
  name: 'SkillRankingResult',
}
</script>

<script setup>
import { ref, onMounted, onActivated, onDeactivated, computed, watch } from 'vue'
import * as utils from '@/js/utils.js'
import { cleanKeyword, parseKeyword } from '@/js/highlight.js'
import { isJobIncludesKeyword } from '@/js/isJobIncludesKeyword.js'
import CalcuOneRelation from '@/js/calcuOneRelation.js'
import GraphDonut from '@/js/graphDonut.js'

let graphDonut = null

// region data
const props = defineProps(['keyword', 'jobs'])
const container = ref(null)
const svgRef = ref(null)
// endregion

// region methods
const resize = () => {
  let width = container.value.clientWidth
  let rate = 0.4
  // 最小寬度為400px，最大寬度為100% container寬度
  if (width > 400) width = width * rate > 400 ? width * rate : 400
  if (width > container.value.clientWidth) width = container.value.clientWidth
  graphDonut.updateSize({ w: width, h: width })
}
const filterJobs = (keyword, jobs) => {
  if (!jobs) return []
  if (utils.isFalsy(keyword)) return jobs

  keyword = cleanKeyword(keyword)
  let keywords = parseKeyword(keyword)
  return jobs.filter(job => {
    if (!keywords.must.every(word => isJobIncludesKeyword(job, word))) return false
    if (keywords.not.some(word => isJobIncludesKeyword(job, word))) return false
    return true
  })
}
CalcuOneRelation.setHowToFilterJobs(filterJobs)

// endregion

// region computed
const filteredJobs = computed(() => filterJobs(props.keyword, props.jobs))
// endregion

// region 生命週期
watch(
  () => props.keyword,
  (newVal, oldVal) => {
    let ones = CalcuOneRelation.calcu(utils.parse(props.keyword), utils.parse(props.jobs))
    ones = ones.filter(one => one.relative !== '不顯著')
    graphDonut.args = {
      value: d => d.x2,
      text: d => `${d.data.name} χ²=${parseInt(d.data.x2)}`,
    }
    graphDonut.updateData(ones)
  },
)
onMounted(() => {
  let data = utils.getEachTagCount(utils.parse(props.jobs))
  data = data._items.map(item => ({ name: item.key, count: item.value }))
  data.sort((a, b) => b.count - a.count)
  data = data.slice(0, 15)
  graphDonut = new GraphDonut({
    svgSelector: svgRef.value,
    svgSize: { w: 400, h: 400 },
    data: data,
    value: d => d.count,
    text: d => `${d.data.name}:${d.data.count}`,
  })
  resize()
})
onActivated(() => {
  window.addEventListener('resize', resize)
})
onDeactivated(() => {
  window.removeEventListener('resize', resize)
})
// endregion
</script>

<style scoped lang="sass">
@use "@/styles/variables.sass" as var
.container-ranking
  width: 100%
  height: 100%
  margin: 0
  +var.flexCenter
</style>
