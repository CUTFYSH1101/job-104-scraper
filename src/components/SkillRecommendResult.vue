<template>
  <div ref="container" style="width: 100%; height: 100%; margin: 0">
    <svg ref="svgRef" :width="width" :height="height"></svg>
  </div>
</template>

<script>
export default {
  name: "SkillRecommendResult",
  props: ['jobs', 'keywords'],
}
</script>

<script setup>
import {ref, onActivated, onDeactivated} from 'vue'
import * as d3 from 'd3'

let svgRef = ref(null)

// <自適應大小相關參數
let container = ref(null)
let width = ref(600)
let height = ref(400)
let graph = null
let resize = () => {
  width.value = container.value.clientWidth
  height.value = container.value.clientHeight
  graph.drawChart()
}
// />

class Graph {
  nodes = [
    {id: 'A'},
    {id: 'B'},
    {id: 'C'}
  ]
  links = [
    {source: 'A', target: 'B', count: 3},
    {source: 'B', target: 'C', count: 2},
    {source: 'C', target: 'A', count: 2}
  ]

  constructor(svgElement) {
    this.svg = d3.select(svgElement)
  }

  drawChart() {
    this.svg.selectAll('*').remove()  // 清除舊的圖表

    // 力導向模擬
    const simulation = d3.forceSimulation(this.nodes)
        .force('link', d3.forceLink(this.links).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(300, 200))

    const nodeHeight = 20

    // 節點文字
    const text = this.svg.append('g')
        .selectAll('text')
        .data(this.nodes)
        .enter()
        .append('text')
        .text(d => d.id)
        .attr('text-anchor', 'middle')
        .attr('dy', 5)
        .style('fill', '#999')
        .style('pointer-events', 'none')
        .each(function(d) {  // 不能用箭頭函數，否則this為undefined
          d.width = this.getBBox().width
        })

    // 節點背景
    const node = this.svg.insert('g', ':first-child')
        .selectAll('rect')
        .data(this.nodes)
        .enter()
        .append('rect')
        .attr('width', d => d.width)
        .attr('height', nodeHeight)
        .attr('fill', 'white')
        .call(d3.drag()
            .on('start', dragStart)
            .on('drag', dragging)
            .on('end', dragEnd))

    // 繪製連線
    const link = this.svg.insert('g', ':first-child')
        .selectAll('line')
        .data(this.links)
        .enter()
        .append('line')
        .attr('stroke', '#999')
        .attr('stroke-width', d => d.count)

    // 更新位置
    simulation.on('tick', () => {
      link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y)

      node
          .attr('x', d => d.x - d.width / 2)
          .attr('y', d => d.y - nodeHeight / 2)

      text
          .attr('x', d => d.x)
          .attr('y', d => d.y)
    })

    // 拖曳功能
    function dragStart(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    }

    function dragging(event) {
      event.subject.fx = event.x
      event.subject.fy = event.y
    }

    function dragEnd(event) {
      if (!event.active) simulation.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    }
  }
}

onActivated(() => {
  graph = new Graph(svgRef.value)
  graph.drawChart()
  window.addEventListener('resize', resize)
})

onDeactivated(() => window.removeEventListener('resize', resize))
</script>