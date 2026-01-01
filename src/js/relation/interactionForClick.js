import { isFalsy } from '@/js/core/utils.js'
import * as d3 from 'd3'

export default class InteractionForClick {
  constructor(svgDom, onClick = clickedName => {}) {
    this.createPathClickListener(svgDom)
    svgDom.addEventListener('click', e => {
      e.preventDefault()
      if (isFalsy(this.nodes) || isFalsy(this.links)) return
      const rect = svgDom.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // 偵測方形
      let clicked = this.nodes.find(
        d =>
          x >= d.x - d.width / 2 &&
          x <= d.x + d.width / 2 &&
          y >= d.y - this.nodeHeight / 2 &&
          y <= d.y + this.nodeHeight / 2,
      )

      // 偵測線段
      if (!clicked)
        clicked = this.links.find(d => {
          const path = new Path2D()
          path.moveTo(d.source.x, d.source.y)
          path.lineTo(d.target.x, d.target.y)
          this.ctx.lineWidth = this.lineWidthScale(d.count)
          return this.ctx.isPointInStroke(path, x, y)
        })

      if (clicked?.id) onClick?.(clicked.id)
      if (clicked?.source?.id) onClick?.(`${clicked.source.id} ${clicked.target.id}`)
    })
  }

  update(nodes, links, nodeHeight = 20, lineWidthRange = [0.3, 6]) {
    this.updateListenerSize()
    this.nodes = nodes
    this.links = links
    this.nodeHeight = nodeHeight
    this.lineWidthRange = lineWidthRange
    this.lineWidthScale = d3
      .scaleLinear()
      .domain(d3.extent(this.links, d => d.count))
      .range(this.lineWidthRange)
  }

  createPathClickListener(svgDom) {
    this.svgDom = svgDom
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')
  }

  updateListenerSize() {
    const rect = this.svgDom.getBoundingClientRect()
    this.canvas.width = rect.width
    this.canvas.height = rect.height
  }
}
