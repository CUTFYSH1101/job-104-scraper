import * as utils from '@/js/utils.js'
import { dictIncludes } from '@/js/utils.js'

export default class DetailStorage {
  constructor() {
    this.config = {
      currentJob: {},
      details: {},
      detailPaths: [],
      currentPath: '',
      oldTarget: '',
      oldDetailPath: '',
    }
  }

  async init() {
    let paths = await utils.loadText('./data/paths.txt')
    paths = paths.split(/\r?\n/)
    this.detailPaths = paths.filter(path => path.includes('processing'))
  }

  get(key) {
    return this.config[key]
  }

  set(key, value) {
    this.config[key] = value
  }

  getAll() {
    return this.config
  }

  setMultiple(dict) {
    Object.assign(this.config, dict)
  }

  async setCurrentPath(val) {
    if (utils.isFalsy(val)) console.warn('The new path you set is empty.')
    this.currentPath = val
    let details_ = await utils.loadDetails(this.currentDetailsPath())
    this.config.details = new Map()
    details_.forEach(row => this.config.details.set(row['job-href'], row))
  }

  currentDetailsPath() {
    let target = utils.shortPath(this.currentPath)

    if (!this.detailPaths) throw new Error('Not initialized yet, please load the path information first.')

    if (!target) return undefined

    if (target === this.oldTarget) return this.oldDetailPath

    let path = this.detailPaths.filter(path => path.replace(/\\/g, '/').includes(target))
    this.oldTarget = target
    this.oldDetailPath = path
    return path
  }

  setCurrentJob(val) {
    if (dictIncludes(val, '網址')) this.currentJob = val['網址']
    else this.currentJob = val
  }

  // details->detail
  getCurrentJobDetail() {
    let target = this.currentJob
    let details = this.config.details
    if (!details || !details.size) return undefined
    return details.get(target)
  }
}
