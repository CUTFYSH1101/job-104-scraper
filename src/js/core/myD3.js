import * as d3 from 'd3'

// 長條圖豎直版本
export function createBarV(parent, data, x, y, width, innerHeight) {
  parent.selectAll('rect')
    .data(data)
    .join('rect')
    .attr('x', x)
    .attr('y', d => innerHeight - y(d))
    .attr('width', width)  // 沒有 xScale.bandwidth()
    .attr('height', y)
}

// 長條圖水平版本
export function createBarH(parent, data, x, y, height) {
  return parent.selectAll('rect')
    .data(data)
    .join('rect')
    .attr('x', 0)
    .attr('y', y)
    .attr('width', x)
    .attr('height', height)
}

// 散佈圖
export function createScatter(parent, data, x, y, r) {
  return parent.selectAll('circle')
    .data(data)
    .join('circle')
    .attr('cx', x)
    .attr('cy', y)
    .attr('r', r)
}

// 折線圖
export function createLine(parent, data, x, y, r, strokeWidth, strokeColor) {
  let g2 = parent.append('g').attr('fill', 'none').attr('stroke-width', strokeWidth).attr('stroke', strokeColor)
  let line = d3.line().x(x).y(y)
  g2.append('path').datum(data).attr('d', line)
  g2.selectAll('circle').data(data).join('circle').attr('cx', x).attr('cy', y).attr('r', r)
  return g2
}

// 十字線
export function createCrosshair(parent, data, x, y, half, strokeWidth, strokeColor) {
  let points = parent.selectAll('g').data(data).join('g')
    .attr('transform', d => `translate(${x(d)}, ${y(d)})`)
    .attr('stroke', strokeColor).attr('stroke-width', strokeWidth)
  points.append('line').attr('x1', -half).attr('x2', half)
  points.append('line').attr('y1', -half).attr('y2', half)
  return points
}

/**
 * @param svgSize
 * @param margin 留空間給軸線、刻度文字與標題，避免圖形貼邊
 * @returns {({w: number, h: number}|string)[]}
 */
export function moveCoordinate(
  svgSize = { w: 400, h: 600 },
  margin = { top: 60, right: 60, bottom: 60, left: 60 }) {
  let innerSize = { w: svgSize.w - margin.left - margin.right, h: svgSize.h - margin.top - margin.bottom }
  let translateXAxis = `translate(${margin.left}, ${innerSize.h + margin.top})`
  let translateYAxis = `translate(${margin.left}, ${margin.top})`
  return [innerSize, translateXAxis, translateYAxis]
}

export function appendSvg(parentSelector, svgSize) {
  return d3.select(parentSelector)
    .append('svg')
    .attr('width', svgSize.w)
    .attr('height', svgSize.h)
}

export function setSvgSize(svgSelector, svgSize) {
  return d3.select(svgSelector)
    .attr('width', svgSize.w)
    .attr('height', svgSize.h)
}

/**
 * @param {Array} colorArray
 * @returns {Function}
 */
export function scaleOrdinal(colorArray) {
  return d3.scaleOrdinal().domain([0, colorArray.length - 1]).range(colorArray)
}

export default {
  createBarV,
  createBarH,
  createScatter,
  createLine,
  createCrosshair,
  moveCoordinate,
  appendSvg,
  setSvgSize,
  scaleOrdinal,
}
