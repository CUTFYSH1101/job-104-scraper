import MyD3 from '@/js/core/myD3.js'
import * as utils from '@/js/core/utils.js'
import * as d3 from 'd3'

export default class GraphDonut {
  set svgSize(val) {
    let sideLength = Math.min(...Object.values(val))
    this._svgSize = { w: sideLength, h: sideLength }
    MyD3.setSvgSize(this.svgSelector, val)
  }

  get svgSize() {
    return this._svgSize
  }

  set args(val) {
    Object.assign(this, val)
  }

  // 依賴 sideLength
  moveDonut2Center() {
    let half = this.derived.sideLength / 2
    this.g.attr('transform', `translate(${half}, ${half})`)
  }

  // 依賴 svg, data, value, pie, text
  validate() {
    if (!this.svg) throw new Error('SVG graph doesn\'t exist')
    if (utils.isFalsy(this.data)) throw new Error('Data doesn\'t exist')
    if (utils.isFalsy(this.value(this.data[0]))) throw new Error('`value` not match')
    if (utils.isFalsy(this.text(this.derived.pie(this.data)[0]))) throw new Error('`text` not match')
  }

  computeDerived() {
    const size = this.svgSize
    const side = Math.min(size.w, size.h)
    const radius = side / 2.4

    this.derived = {
      sideLength: side,
      radius,
      fontSize: side * 0.03 + 'px',
      pie: d3.pie().padAngle(0.01).value(this.value),
      arc: d3.arc().innerRadius(radius / 2).outerRadius(radius).cornerRadius(2),
    }
  }

  applyDataBinding(data) {
    if (this.colors.length < data.length)
      data = [...data]
        .sort((a, b) => this.value(b) - this.value(a))
        .slice(0, this.colors.length)
    let totalValue = d3.sum(data, this.value)
    data = data.filter(d => this.value(d) / totalValue > 0.01)  // 過濾小於整體資料 1% 的
    this.data = data  // 方便外部log

    let pieData = this.derived.pie(data)
    this.gs = this.g.selectAll('g')
      .data(pieData)
      .join(enter => {
        const g = enter.append('g')
        g.append('path')
        g.append('text')
          .attr('text-anchor', 'middle')        // 左右置中
          .attr('dominant-baseline', 'middle')  // 上下置中
          .attr('fill', 'white')
        g.insert('rect', 'text')  // 放在<text>底下，讓甜甜圈文字顯示得更清楚
        return g
      })
  }

  // 依賴 gs
  setEvents() {
    this.gs.attr('cursor', 'pointer')
    this.gs.on('mouseenter', (event, data) => {
      let transition = d3.transition('hover').duration(100)
      d3.select(event.currentTarget)
        .transition(transition)
        .attr('transform', 'scale(1.1)')
      this.g  // 讓甜甜圈文字顯示得更清楚
        .selectAll('text.big-text')
        .data([data])
        .join('text')
        .text(this.text)
        .attr('class', 'big-text')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-family', 'monospace')
        .attr('font-size', '1rem')
        .attr('font-weight', '600')
        .attr('letter-spacing', '0.1rem')
        .attr('pointer-events', 'none')
        .lower()
        .transition(transition)
        .attr('opacity', 0.8)
    })
    this.gs.on('mouseleave', (event, data) => {
      let transition = d3.transition('hover').duration(100)
      d3.select(event.currentTarget)
        .transition(transition)
        .attr('transform', 'scale(1)')
      this.g
        .selectAll('text.big-text')
        .transition(transition)
        .attr('opacity', 0)
    })
  }

  animate(durationMs = 500) {
    let transition = d3.transition('hover').duration(durationMs)
    this.gs.select('path')
      .transition(transition)
      .attr('d', this.derived.arc)
      .attr('fill', (d, i) => this.colorScale(i))
    this.gs.select('text')
      .text(this.text)  // 先算出寬高給背景<rect>使用
      .attr('font-size', this.derived.fontSize)
      .each(function(d) {
        d.width = this.getBBox().width
        d.height = this.getBBox().height
      })
      .transition(transition)
      .attr('transform', d => `translate(${this.derived.arc.centroid(d)})`)
    this.gs.select('rect')
      .transition(transition)
      .attr('transform', d => {
        let [centerX, centerY] = this.derived.arc.centroid(d)
        return `translate(${centerX - d.width / 2}, ${centerY - d.height / 2})`
      })
      .attr('width', d => d.width)
      .attr('height', d => d.height)
      .attr('fill', (d, i) => this.colorScale(i))
  }

  updateSize(svgSize) {
    this.svgSize = svgSize
    this.computeDerived()
    this.moveDonut2Center()
    this.animate(0)
  }

  updateData(data) {
    this.computeDerived()
    this.applyDataBinding(data)
    this.animate()
    this.setEvents()
  }

  constructor(args) {
    let default_ = {
      svgSelector: 'svg',
      svgSize: { w: 400, h: 400 },
      data: [{ name: 'A', count: 1 }, { name: 'B', count: 2 }, { name: 'C', count: 3 }],
      value: d => d.count,
      text: d => `${d.data.name}: ${d.data.count}`,
    }
    Object.assign(this, default_, args)

    this.svg = d3.select(this.svgSelector)
    this.g = this.svg.append('g')
    this.colors = d3.schemeSet2.concat(d3.schemeSet3)
    this.colorScale = MyD3.scaleOrdinal(this.colors)

    this.computeDerived()
    this.validate()
    this.moveDonut2Center()
    this.applyDataBinding(this.data)
    this.animate(0)
    this.setEvents()
  }
}
