import * as d3 from 'd3'

export default class ForceSimulation {
  constructor(args) {
    // 「節點」指的是`links`和`nodes`
    let default_ = {
      nodes: [
        { 'id': 'A' },
        { 'id': 'B' },
        { 'id': 'C' },
        { 'id': 'D' },
      ],
      links: [
        { 'source': 'A', 'target': 'B', count: 5 },
        { 'source': 'A', 'target': 'C', count: 3 },
        { 'source': 'B', 'target': 'C', count: 2 },
        { 'source': 'D', 'target': 'C', count: 2 },
      ],
      intermolecularForce: -500,    // 多個節點時不要擠在一起，用粒子間作用力推開彼此
      linkDistance: 100,            // 使節點盡量保持距離為一定值，保持美觀
      svgSize: { w: 400, h: 400 },  // 一個往中心拉的力，使節點聚集在中心點
      text: d => d.id,              // 透過`id` 與 `source`, `target` 連接
      onTick: () => {},             // 更新節點的位置，涉及繪製依賴，所以用依賴注入
    }
    Object.assign(this, default_, args)
  }

  /**
   * 只更新現有屬性。
   * 重新傳入`args`更新。
   * 由於`links`, `nodes`都是物件所以指向同一個位址修改。
   * 修改`this.nodes`等於修改`graphRelation.nodes`。
   * `graphRelation.onTick`方法會抓取`graphRelation.nodes`和`graphRelation.links`。
   * ※注意每當重新賦值給`graphRelation.nodes`或`graphRelation.links`時要執行該函式重新傳入以綁定。
   */
  set args(args) {
    Object.keys(this).forEach(key => {
      if (key in args)
        this[key] = args[key]
    })
    this.applySimulation()
  }

  applySimulation() {
    // 資料更新後，統一清除舊的位置避免影響新位置
    this.nodes.forEach(node => {
      delete node.x
      delete node.y
      delete node.vx
      delete node.vy
      delete node.fx
      delete node.fy
    })
    // 資料更新後，統一把 source/target 轉回字串，再調用`d3.forceSimulation`重新綁定和生成位置
    if (this.links?.length > 0 && this.links[0].source.id)
      this.links.forEach(link => {
        link.source = link.source.id
        link.target = link.target.id
      })
    this.simulation =
      d3.forceSimulation(this.nodes)
        .nodes(this.nodes)
        .force('link', d3.forceLink(this.links).id(this.text).distance(this.linkDistance))
        .force('center', d3.forceCenter(this.svgSize.w / 2, this.svgSize.h / 2))
        .force('charge', d3.forceManyBody().strength(this.intermolecularForce).distanceMax(200))
        .on('tick', () => this.onTick())
        .alpha(1)
        .alphaDecay(0.02)
        .restart()
  }

  dragStart(event, data) {
    // console.log('dragStart', data.id)
    if (!event.active) this.simulation.alphaTarget(0.3).restart()
    event.subject.fx = event.x
    event.subject.fy = event.y
  }

  dragging(event, data) {
    // console.log('dragging', data.id)
    event.subject.fx = event.x
    event.subject.fy = event.y
  }

  dragEnd(event, data) {
    // console.log('dragEnd', data.id)
    if (!event.active) this.simulation.alphaTarget(0)
    event.subject.fx = null
    event.subject.fy = null
  }
}