export default class Vec2 {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  static get ZERO() {
    return new Vec2(0, 0)
  }

  static get UP() {
    return new Vec2(0, -1)
  }

  static get DOWN() {
    return new Vec2(0, 1)
  }

  static get LEFT() {
    return new Vec2(-1, 0)
  }

  static get RIGHT() {
    return new Vec2(1, 0)
  }

  static distance(vec1, vec2) {
    return Math.sqrt((vec1.x - vec2.x) ** 2 + (vec1.y - vec2.y) ** 2)
  }

  static displacement(from, to) {
    return new Vec2(to.x - from.x, to.y - from.y)
  }

  static direction(from, to) {
    let d = this.displacement(from, to)
    let len = d.length
    if (len <= 0) return new Vec2(0, 0)
    return d.mul(1 / len)
  }

  clone() {
    return new Vec2(this.x, this.y)
  }

  set(x, y) {
    this.x = x
    this.y = y
  }

  mul(scalar) {
    return new Vec2(this.x * scalar, this.y * scalar)
  }

  get length() {
    return Math.sqrt(this.x ** 2 + this.y ** 2)  // es6支援**運算子
  }

  set length(length) {
    this.set(this.mul(length / this.length))
  }

  toString() {
    return `(${parseInt(this.x)}, ${parseInt(this.y)})`
  }
}
