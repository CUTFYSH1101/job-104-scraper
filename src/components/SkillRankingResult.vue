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
const props = defineProps(['jobs', 'keyword'])
const container = ref(null)
const svgRef = ref(null)
// endregion

// region methods
const resize = () => {
  let width = container.value.clientWidth
  let rate = 0.4
  if (width > 400) width = width * rate > 400 ? width * rate : 400
  graphDonut.updateSize({ w: width, h: width })
}
const filterJobs = (jobs, keyword) => {
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

function defaultDataWithoutKeyword() {
  let data = utils.getEachTagCount(utils.parse(props.jobs))
  data = data._items.map(item => ({ name: item.key, count: item.value }))
  data.sort((a, b) => b.count - a.count)
  return data.slice(0, 15)
}

function dataWithKeyword() {
  let ones = CalcuOneRelation.calcu(utils.parse(props.jobs), utils.parse(props.keyword))
  return ones.filter(one => one.relative !== '不顯著')
}

function updateJobsOrKeyword() {
  if (!utils.isFalsy(props.keyword)) {
    graphDonut.args = {
      value: d => d.x2,
      text: d => `${d.data.name} χ²=${parseInt(d.data.x2)}`,
    }
    graphDonut.updateData(dataWithKeyword())
  } else {
    graphDonut.args = {
      value: d => d.count,
      text: d => `${d.data.name}:${d.data.count}`,
    }
    graphDonut.updateData(defaultDataWithoutKeyword())
  }
}

// endregion

// region computed
const filteredJobs = computed(() => filterJobs(props.jobs, props.keyword))
// endregion


// region 生命週期
watch(
    () => [props.jobs, props.keyword],
    updateJobsOrKeyword,
)
onMounted(() => {
  graphDonut = new GraphDonut({
    svgSelector: svgRef.value,
    svgSize: { w: 400, h: 400 },
    data: defaultDataWithoutKeyword(),
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
