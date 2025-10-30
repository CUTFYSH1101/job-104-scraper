import * as utils from '@/js/utils.js'

export default class DetailStorage {
  constructor() {
    this.config = {
      currentJob: {},
      detailPaths: [],
      currentPath: '',
      oldTarget: '',
      oldDetailPath: '',
      oldDetails: [],
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

  setCurrentPath(val) {
    if (utils.isFalsy(val)) console.warn('所設定的新路徑為空')
    this.currentPath = val
  }

  currentDetailsPath() {
    let target = utils.shortPath(this.currentPath)

    if (!target) return undefined

    if (target === this.oldTarget) return this.oldDetailPath

    let path = this.detailPaths.filter(path => path.replace(/\\/g, '/').includes(target))
    this.oldTarget = target
    this.oldDetailPath = path
    return path
  }

  // path->file
  async getOrOpenDetails() {
    if (this.oldDetailPath && this.oldDetailPath === this.currentDetailsPath())
      return this.oldDetails

    let details = await utils.loadDetails(this.currentDetailsPath())
    this.oldDetails = details
    return details
  }

  setCurrentJob(val) {
    this.currentJob = val['網址']
  }

  // details->detail
  async currentJobDetail() {
    let target = this.currentJob
    let details = await this.getOrOpenDetails()
    if (!details || !details.length) return undefined
    return details.filter(row => row['job-href'] === target)[0]
  }
}
