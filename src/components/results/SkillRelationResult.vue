<template>
  <div ref='container' class='container-relation'>
    <div>
      <svg ref='svgRef'></svg>
      <canvas ref='canvasRef'></canvas>
    </div>
    <div class='jobs'>
      <h3>{{ concatKeyword }}</h3>
      <div class='job' v-for='(job, i) in slice(filteredJobs, 10)'>
        <a class='cell' :href='job.網址' target='_blank'>
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
import * as utils from '@/js/core/utils.js'
import { parse, parseValue } from '@/js/core/utils.js'
import filterJobs from '@/js/job/filterJobs.js'

let graph = null
let clickInteraction = null
let init = false

const props = defineProps(['jobs', 'keyword'])

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

// 只顯示前16名
let maxSize = (nodes, links, size = 16) => {
  nodes = utils.slice(nodes.sort((a, b) => b.count - a.count), size)
  let ids = new Set(nodes.map(node => node.id))
  links = links.filter(link =>
      (ids.has(link.source.id) && ids.has(link.target.id))
      || ids.has(link.source) && ids.has(link.target))
  return { nodes, links }
}

// endregion

// region computed
// 用`且`邏輯連接關鍵字，要都符合才會顯示
const filteredJobs = computed(() => filterJobs(props.jobs, concatKeyword.value))
let concatKeyword = computed(() => {
  if (typeof parse(props.keyword) === 'object') return parseValue(clickedNodeOrLine)
  return `${parse(props.keyword)} ${parseValue(clickedNodeOrLine)}`
})

// endregion

// 直到`isJobIncludesKeyword.setCurrentPath`觸發，`calcuLoading.jobsData.getDetail`才不為`undefined`
// @param {Number} delay
async function loadingAfterSettingDetailCsvPath(nodes) {
  return await CalcuLoading.loading(utils.parse(props.jobs), nodes)
}

// region 生命週期
// 同時載入無論是否要等待的項目
watch(
    () => props.jobs,
    async newVal => {
      let [nodes, links] = CalcuBetweenRelation.calcu(utils.parse(props.jobs))
      let loadingNodesCount = await loadingAfterSettingDetailCsvPath(nodes)
      const _ = maxSize(loadingNodesCount, links)
      loadingNodesCount = _.nodes
      links = _.links
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
  let [nodes, links] = CalcuBetweenRelation.calcu(utils.parse(props.jobs))
  let _ = maxSize(nodes, links)
  nodes = _.nodes
  links = _.links
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
  _ = maxSize(loadingNodesCount, links)
  loadingNodesCount = _.nodes
  links = _.links
  graph.args = {
    nodes: loadingNodesCount,
    links: links,
  }
  clickInteraction.update(loadingNodesCount, links)
})

onDeactivated(() => window.removeEventListener('resize', resize))

// endregion
</script>

<style scoped lang='sass'>
@use '@/styles/variables.sass' as var

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