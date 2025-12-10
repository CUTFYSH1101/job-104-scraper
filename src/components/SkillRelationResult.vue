<template>
  <div ref="container" class="container-relation">
    <div>
      <svg ref="svgRef"></svg>
      <canvas ref="canvasRef"></canvas>
    </div>
    <div class="jobs">
      <h3>{{ concatKeyword }}</h3>
      <div class="job" v-for="(job, i) in slice(filteredJobs, 10)">
        <a class="cell" :href="job.網址" target="_blank">
          {{ i + 1 }}:{{ slice(job.工作名稱, 15) }}
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SkillRelationResult',
}
</script>

<script setup>
import { ref, onActivated, onDeactivated, defineProps, watch, computed } from 'vue'
import GraphRelation from '@/js/relation/graphRelation.js'
import CalcuBetweenRelation from '@/js/relation/calcuBetweenRelation.js'
import CalcuLoading from '@/js/relation/multithreading/calcuLoading.js'
import InteractionForClick from '@/js/relation/interactionForClick.js'
import * as utils from '@/js/utils.js'
import { parse, parseValue } from '@/js/utils.js'
import { cleanKeyword, parseKeyword } from '@/js/highlight.js'
import { isJobIncludesKeyword } from '@/js/isJobIncludesKeyword.js'

let graph = null
let clickInteraction = null
let init = false

const props = defineProps(['keyword', 'jobs'])

// region data
let svgRef = ref(null)
let canvasRef = ref(null)
let container = ref(null)
let clickedNodeOrLine = ref('')

// endregion

// region methods
let resize = () => {
  let width = container.value.clientWidth
  let height = container.value.clientHeight
  if (height < 500) height = 500
  if (height > 600) height = 600
  graph.args = {
    svgSize: { w: width * 0.7, h: height },
  }
}
let slice = utils.slice

// endregion

// region computed
const filteredJobs = computed(() => {
  if (!props.jobs) return []
  // 用`且`邏輯連接關鍵字，要都符合才會顯示
  let keyword = concatKeyword.value
  if (utils.isFalsy(keyword)) return props.jobs

  keyword = cleanKeyword(keyword)
  let keywords = parseKeyword(keyword)
  return props.jobs.filter(job => {
    if (!keywords.must.every(word => isJobIncludesKeyword(job, word))) return false
    if (keywords.not.some(word => isJobIncludesKeyword(job, word))) return false
    return true
  })
})
let concatKeyword = computed(() => {
  if (typeof parse(props.keyword) === 'object') return parseValue(clickedNodeOrLine)
  return `${parse(props.keyword)} ${parseValue(clickedNodeOrLine)}`
})

// endregion

// 直到`isJobIncludesKeyword.setCurrentPath`觸發，`calcuLoading.jobsData.getDetail`才不為`undefined`
// @param {Number}delay
async function loadingAfterSettingDetailCsvPath(nodes, delay = 100) {
  return await new Promise(resolve => {
    let interval = setInterval(async () => {
      let result = await CalcuLoading.loading(null, utils.parse(props.jobs), nodes)
      if (!result[0].count) return
      clearInterval(interval)
      resolve(result)
    }, delay)
  })
}

// region 生命週期
// 同時載入無論是否要等待的項目
watch(
    () => props.jobs,
    async newVal => {
      let [nodes, links] = CalcuBetweenRelation.calcu(null, utils.parse(props.jobs))
      let loadingNodesCount = await loadingAfterSettingDetailCsvPath(nodes)
      graph.args = {
        links: links,
        nodes: loadingNodesCount,
      }
      clickInteraction.update(loadingNodesCount, links)
    },
)

// 快點載入，再載入要等待的項目
onActivated(async () => {
  window.addEventListener('resize', resize)
  if (init) return
  init = true
  let [nodes, links] = CalcuBetweenRelation.calcu(null, utils.parse(props.jobs))
  graph = new GraphRelation({
    svgSelector: svgRef.value,
    canvas: canvasRef.value,
    nodes: nodes,
    links: links,
  })
  clickInteraction = new InteractionForClick(svgRef.value, str => clickedNodeOrLine.value = str)
  clickInteraction.update(nodes, links)
  resize()

  let loadingNodesCount = await loadingAfterSettingDetailCsvPath(nodes)
  graph.args = {
    nodes: loadingNodesCount,
  }
  clickInteraction.update(loadingNodesCount, links)
})

onDeactivated(() => window.removeEventListener('resize', resize))

// endregion
</script>

<style scoped lang="sass">
@use "@/styles/variables.sass" as var

=fillWindow()
  width: 100%
  height: 100%
  margin: 0

=alignLeftTop()
  left: 0
  top: 0

.container-relation
  +fillWindow
  position: relative
  display: flex
  flex-direction: row
  gap: 20px
  align-items: center

svg
  position: relative
  z-index: 2

canvas
  +alignLeftTop
  position: absolute
  z-index: 1

.jobs
  flex: 1
  display: flex
  flex-direction: column
  padding: 12px
  border-radius: 5px
  border: solid 1px var.$gray
  font-size: 14px
  height: fit-content

  h3
    font-size: 1.2rem
    margin-bottom: 10px

  .job
    margin-bottom: 5px
</style>