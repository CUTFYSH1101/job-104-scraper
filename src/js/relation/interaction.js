// `mouseenterSvg`在這裡註冊事件、`mouseenterNode`外面註冊
export default class Interaction {
  constructor(svgDom, args) {
    this.isDragging = false
    this.mouseOutsideSvg = true
    this.relativeLinks = new Set()
    this.relativeNodes = new Set()
    this.onEnterNode = id => {}
    this.onLeaveNode = id => {}
    Object.assign(this, args)
    if (!svgDom || !(svgDom instanceof SVGElement))
      throw new Error('SVG元素為空')
    svgDom.addEventListener('mouseenter', this.mouseenterSvg)
    svgDom.addEventListener('mouseleave', this.mouseleaveSvg)
  }

  dragStart() {
    this.isDragging = true
  }

  dragEnd() {
    this.isDragging = false
  }

  setHoverNode(nodeId, links) {
    this.relativeLinks = new Set(
      links.filter(d => d.source.id === nodeId || d.target.id === nodeId),
    )
    // set->list，才有`flat`和`map`方法可用
    this.relativeNodes = new Set(
      [...this.relativeLinks].flatMap(d => [d.source.id, d.target.id]),
    )
  }

  clearHover() {
    this.relativeLinks.clear()
    this.relativeNodes.clear()
  }

  mouseenterSvg() {
    this.mouseOutsideSvg = false
  }

  mouseleaveSvg() {
    this.mouseOutsideSvg = true
  }

  mouseenterNode = (event, data) => {
    if (this.isDragging) return
    // console.log('mouseenter', data.id)
    this.onEnterNode?.(data.id)
  }

  mouseleaveNode = (event, data) => {
    if (this.isDragging) return
    // console.log('mouseleave', data.id)
    this.onLeaveNode?.(data.id)
  }
}
