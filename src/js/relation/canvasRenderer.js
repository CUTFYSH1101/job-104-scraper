// canvasRenderer.js
import * as d3 from 'd3'

export default class CanvasRenderer {
  constructor(args) {
    this.init(args)
    this.update()
  }

  set args(args) {
    Object.keys(this).forEach(key => {
      if (key in args)
        this[key] = args[key]
    })
    this.update()
  }

  init(args) {
    let default_ = {
      canvas: document.querySelector('canvas'),
      lineColor: '#d5d5d5',
      lineWidthRange: [0.3, 6],
      links: [
        { 'source': 'A', 'target': 'B', count: 5 },
        { 'source': 'A', 'target': 'C', count: 3 },
        { 'source': 'B', 'target': 'C', count: 2 },
        { 'source': 'D', 'target': 'C', count: 2 },
      ],
      svgSize: { w: 400, h: 400 },  // 同步 canvas 和 svg 畫布大小
    }
    Object.assign(this, default_, args)
  }

  update() {
    if (!this.canvas || !(this.canvas instanceof HTMLCanvasElement))
      throw new Error('沒有線段')
    this.ctx = this.canvas.getContext('2d')
    this.applySize()
    this.applyLineWidthScale()
  }

  applySize() {
    this.canvas.setAttribute('width', this.svgSize.w)
    this.canvas.setAttribute('height', this.svgSize.h)
  }

  applyLineWidthScale() {
    if (this.links.length === 0) return
    this.lineWidthScale = d3.scaleLinear()
      .domain(d3.extent(this.links, d => d.count))
      .range(this.lineWidthRange)
  }

  // 高亮者設為`1`，反之設為`val`
  setLinkOpacity(val, highlightLinks = new Set()) {
    this.links.forEach(link => {
      link.opacity = highlightLinks.has(link) ? 1 : val
    })
  }

  resetLinkOpacity() {
    this.links.forEach(link => {
      link.opacity = 1
    })
  }

  // 由於力衰變結束後，`onTick`不再呼叫，因此即便改了透明度也不會重繪到線段上，需要在設定透明度的地方呼叫`drawPath`以重新繪製線段
  draw() {
    this.clear()
    this.ctx.strokeStyle = this.lineColor

    this.links.forEach(link => {
      this.ctx.globalAlpha = link.opacity ?? 1  // 預設皆高亮
      this.ctx.lineWidth = this.lineWidthScale(link.count)
      this.ctx.beginPath()
      this.ctx.moveTo(link.source.x, link.source.y)
      this.ctx.lineTo(link.target.x, link.target.y)
      this.ctx.stroke()
    })
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
}
