import * as utils from '@/js/core/utils.js'
import { clientHeight, clientWidth } from '@/js/core/utils.js'
import { detailConfig } from '@/js/job/detailStorage.js'

export let config = {
  pos: [],
  onSetPos: pos => {
  },
  bodyWidth: 0,
  bodyHeight: 0,
  onHideDetail: () => {
  },
  onShowDetail: () => {
  },
  leaveTimer: null,
}

export async function userHoverJob(e, job) {
  detailConfig.setCurrentJob(job)
  await showDetail()
  await setPos(e.clientX, e.clientY)
}

export function userLeaveJob() {
  hideDetail()
}

export function hideDetail() {
  config.leaveTimer = setTimeout(() => config.onHideDetail?.(), 100)
}

export async function showDetail() {
  if (config.leaveTimer) {
    clearTimeout(config.leaveTimer)
    config.leaveTimer = null
  }
  await config.onShowDetail?.()
}

export function updateBodyWidthHeight() {
  config.bodyWidth = clientWidth()
  config.bodyHeight = clientHeight()
}

async function setPos(...args) {  // 無法阻擋undefined, null
  if (utils.isFalsy(args[0])) return
  if (utils.isArray(args[0])) config.pos = args[0]
  else config.pos = [...args]
  await config.onSetPos(config.pos)
}

export function hoverJobDetail() {
  return detailConfig.getCurrentJobDetail()
}
