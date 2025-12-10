import * as d3 from 'd3'
import MyD3 from '@/js/myD3.js'
import ForceSimulation from '@/js/relation/forceSimulation.js'
import CanvasRenderer from '@/js/relation/canvasRenderer.js'
import Interaction from '@/js/relation/interaction.js'
import InteractionForHoverLine from "@/js/relation/interactionForHoverLine.js";
import GraphLoadingNodeOpacity from '@/js/relation/multithreading/graphLoadingNodeOpacity.js'

export default class GraphRelation {
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
      svgSelector: 'svg',
      svgSize: { w: 400, h: 400 },
      nodeHeight: 20,
      linkDistance: 100,
      nodes: [
        { 'id': 'A' },
        { 'id': 'B' },
        { 'id': 'C' },
        { 'id': 'D' },
      ],
      links: [
        { 'source': 'A', 'target': 'B' },
        { 'source': 'A', 'target': 'C' },
        { 'source': 'B', 'target': 'C' },
        { 'source': 'D', 'target': 'C' },
      ],
      text: d => d.id,
    }
    Object.assign(this, default_, args)
    this.simulation = new ForceSimulation()
    this.simulation.onTick = this.onTick  // 必須搭配箭頭函數，`this.texts`才不會指向錯誤
    this.canvasRenderer = new CanvasRenderer()
    this._isEnterNode = false
    this.interaction = new Interaction(this.svgSelector, {
      onEnterNode: id => {
        this._isEnterNode = true
        this.interaction.setHoverNode(id, this.links)
        this.setOpacityByHoverLine(1)
        this.setOpacity(0)
        this.canvasRenderer.draw()
      },
      onLeaveNode: () => {
        this._isEnterNode = false
        this.interaction.clearHover()
        this.setOpacity(1)
        this.canvasRenderer.draw()
      },
    })
    this.interactionForHoverLine = new InteractionForHoverLine(
      this.svgSelector,
      link => {
        if (this._isEnterNode) return
        this.interactionForHoverLine.setHover(link)
        this.setOpacityByHoverLine(0)
        this.canvasRenderer.draw()
      },
      link => {
        if (this._isEnterNode) return
        this.interactionForHoverLine.clearHover()
        this.setOpacityByHoverLine(1)
        this.canvasRenderer.draw()
      },
    )
    this.nodeOpacity = new GraphLoadingNodeOpacity()
    this.svg = d3.select(this.svgSelector)
  }

  update() {
    MyD3.setSvgSize(this.svgSelector, this.svgSize)
    this.applyDataBinding()
    this.simulation.args = { ...this }
    this.canvasRenderer.args = { ...this }
    this.nodeOpacity.update(this.texts, this.rects, this.nodes)
    this.getOpacity = this.nodeOpacity.getOpacity
    this.interactionForHoverLine.update(this.links, this.canvasRenderer.lineWidthRange)
  }

  applyDataBinding() {
    const transition = d3.transition().duration(300)

    this.gs = this.svg
      .selectAll('g')
      .data(this.nodes, d => d.id)
      .join(
        enter => {
          console.log('enter', enter.size())
          const g = enter.append('g')
          g.append('text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('pointer-events', 'none')
            .text(d => d.id)
            .each(function(d) {
              d.width = this.getBBox().width
            })

          g.append('rect')
            .attr('fill', 'white')
            .attr('width', d => d.width)
            .attr('height', this.nodeHeight)
            .lower()
            .call(
              d3.drag()
                .on('start', this.dragStart)
                .on('drag', this.dragging)
                .on('end', this.dragEnd),
            )
            .on('mouseenter', this.interaction.mouseenterNode)
            .on('mouseleave', this.interaction.mouseleaveNode)
            .attr('cursor', 'pointer')

          return g
        },
        update => {
          console.log('update', update.size())
          const g = update
          g.select('text')
            .transition(transition)
            .text(d => d.id)
            .each(function(d) {
              d.width = this.getBBox().width
            })

          g.select('rect')
            .transition(transition)
            .attr('width', d => d.width)
            .attr('height', this.nodeHeight)

          return g
        },
      )

    this.texts = this.gs.select('text')
    this.rects = this.gs.select('rect')
  }

  onTick = () => {
    this.texts.attr('transform', d => `translate(${d.x} ${d.y})`)
    this.rects.attr('transform', d => `translate(${d.x - d.width / 2} ${d.y - this.nodeHeight / 2})`)
    this.canvasRenderer.draw()
  }

  dragStart = (event, data) => {
    this.simulation.dragStart(event, data)
    this.interaction.dragStart()
  }

  dragging = (event, data) => {
    this.simulation.dragging(event, data)
  }

  dragEnd = (event, data) => {
    this.simulation.dragEnd(event, data)
    this.interaction.dragEnd()
    if (this.interaction.mouseOutsideSvg)
      this.interaction.mouseleaveNode(event, data)
  }

  setOpacity(val) {
    this.texts.filter(d => !this.interaction.relativeNodes.has(d.id)).attr('opacity', d => this.getOpacity(val, d))
    this.rects.filter(d => !this.interaction.relativeNodes.has(d.id)).attr('opacity', d => this.getOpacity(val, d))
    this.canvasRenderer.setLinkOpacity(val, this.interaction.relativeLinks)
  }

  setOpacityByHoverLine(val) {
    this.texts.filter(d => !this.interactionForHoverLine.relativeNodes.has(d.id)).attr('opacity', d => this.getOpacity(val, d))
    this.rects.filter(d => !this.interactionForHoverLine.relativeNodes.has(d.id)).attr('opacity', d => this.getOpacity(val, d))
    this.canvasRenderer.setLinkOpacity(val, this.interactionForHoverLine.relativeLink)
  }
}
