import * as d3 from 'd3'

export default class GraphLoadingNodeOpacity {
  constructor(args) {
    let default_ = {
      textOpacityRange: [0.1, 1],
      nodes: [
        { 'id': 'A' },
        { 'id': 'B' },
        { 'id': 'C' },
        { 'id': 'D' },
      ],
    }
    Object.assign(this, default_, args)
  }

  update = (texts, rects, nodes) => {
    this.nodes = nodes
    this._applyNodeOpacityScale()
    this._applyOpacity(texts, rects)
  }

  get _isNodeIncludesCountKey() {
    return this.nodes && this.nodes[0].count
  }

  _applyNodeOpacityScale() {
    if (!this._isNodeIncludesCountKey) return
    this.nodeOpacityScale = d3.scaleLinear()
      .domain(d3.extent(this.nodes, d => d.count))
      .range(this.textOpacityRange)
  }

  _applyOpacity(texts, rects) {
    if (!this._isNodeIncludesCountKey) return
    texts.attr('opacity', d => this.nodeOpacityScale(d.count))
    rects.attr('opacity', d => this.nodeOpacityScale(d.count))
  }

  // 無`count`屬性就套用`0`或`1`，有`count`屬性就套用`0`或`d => this.nodeOpacityScale(d.count)`
  getOpacity = (defaultOpacity, data) => {
    if (!this._isNodeIncludesCountKey) return defaultOpacity
    return Math.min(this.nodeOpacityScale(data.count), defaultOpacity)
  }
}
