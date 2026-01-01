import { isFalsy } from '@/js/core/utils.js'
import * as d3 from 'd3'

export default class InteractionForHoverLine {
  constructor(svgDom, onMouseenter = link => {}, onMouseleave) {
    this._cursorDefault = svgDom.style.cursor
    this.createPathClickListener(svgDom)
    svgDom.addEventListener('mousemove', e => {
      e.preventDefault()
      if (isFalsy(this.links)) return
      const rect = svgDom.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // 偵測線段
      let hovered = this.links.find(d => {
        const path = new Path2D()
        path.moveTo(d.source.x, d.source.y)
        path.lineTo(d.target.x, d.target.y)
        this.ctx.lineWidth = this.lineWidthScale(d.count)
        return this.ctx.isPointInStroke(path, x, y)
      })

      // 移出/不同就觸發mouseleave
      if (this.oldHovered) {
        if (
          this.oldHovered?.source?.id !== hovered?.source?.id ||
          this.oldHovered?.target?.id !== hovered?.target?.id
        ) {
          onMouseleave?.(this.oldHovered)
          svgDom.style.cursor = this._cursorDefault
        }
      }

      // 移入/移動中就觸發mouseenter
      if (hovered?.source?.id) {
        onMouseenter?.(hovered)
        svgDom.style.cursor = 'pointer'
      }

      // 更新舊資料
      this.oldHovered = hovered
    })

    // 初始化以避免`this.relativeNodes.has`不存在、避免`this.relativeNodes.clear`不存在
    this.relativeNodes = new Set()
    this.relativeLink = new Set()
  }

  update(links, lineWidthRange = [0.3, 6]) {
    this.updateListenerSize()
    this.links = links
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

  setHover(link) {
    this.relativeLink = new Set([link])
    this.relativeNodes = new Set([link.source.id, link.target.id])
  }

  clearHover() {
    this.relativeLink.clear()
    this.relativeNodes.clear()
  }
}
