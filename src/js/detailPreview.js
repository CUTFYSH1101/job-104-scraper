import * as utils from '@/js/utils.js'

export let config = {
    hoverJob: {},
    thePathsHavingDetail: [],
    currentPath: '',
    oldTarget: '',
    oldDetailPath: '',
    oldDetails: [],
    pos: [],
    onSetPos: pos => {},
    bodyWidth: 0,
    bodyHeight: 0,
    onHideDetail: () => {},
    onShowDetail: () => {},
    leaveTimer: null,
}

export function userHoverJob(e, job) {
    setHoverJob(job)
    setPos(e.clientX, e.clientY)
    showDetail()
}

export function userLeaveJob() {
    hideDetail()
}

export function hideDetail() {
    config.leaveTimer = setTimeout(() => config.onHideDetail?.(), 100)
}

export function showDetail() {
    if (config.leaveTimer) {
        clearTimeout(config.leaveTimer)
        config.leaveTimer = null
    }
    config.onShowDetail?.()
}

export function updateBodyWidthHeight() {
    config.bodyWidth = document.documentElement.clientWidth
    config.bodyHeight = document.documentElement.clientHeight
}

function setPos(...args) {  // 無法阻擋undefined, null
    if (utils.isFalsy(args[0])) return
    if (utils.isArray(args[0])) config.pos = args[0]
    else config.pos = [...args]
    config.onSetPos(config.pos)
}

export function currentDetailPath() {
    let target = utils.shortPath(config.currentPath)
    if (target && target === config.oldTarget) return config.oldDetailPath

    let path = config.thePathsHavingDetail.filter(path => path.replace(/\\/g, '/').includes(target))
    config.oldTarget = target
    config.oldDetailPath = path
    return path
}

export async function openDetails() {
    if (config.oldDetailPath && config.oldDetailPath === currentDetailPath())
        return config.oldDetails

    let details = await utils.loadDetails(currentDetailPath())
    config.oldDetails = details
    return details
}

export async function hoverJobDetail() {
    let target = config.hoverJob['網址']
    let details = await openDetails()
    if (!details || !details.length) return undefined
    return details.filter(row => row['job-href'] === target)[0]
}

function setHoverJob(val) {
    config.hoverJob = val
}

export function setCurrentPath(val) {
    if (utils.isFalsy(val)) console.warn('所設定的新路徑為空')
    config.currentPath = val
}

let paths = await utils.loadText('./data/paths.txt')
paths = paths.split(/\r?\n/)
config.thePathsHavingDetail = paths.filter(path => path.includes('processing'))
