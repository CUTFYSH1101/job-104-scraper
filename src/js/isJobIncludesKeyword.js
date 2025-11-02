import DetailStorage from '@/js/detailStorage.js'
import * as utils from '@/js/utils.js'
import * as config from '@/js/config.js'

let detailConfig = new DetailStorage()
detailConfig.init()

export async function setCurrentPath(val) {
  await detailConfig.setCurrentPath(val)
}

function getDetail(job) {
  // jobsLoader.setCurrentPath -> setCurrentJob -> getCurrentDetail
  // 路徑設定：由 jobsLoader 指定 details.csv 的所在路徑
  // job 作用：使用 job['網址'] 搜尋相同網址的 detail 資料
  // 兩者合併：開啟 details.csv 後，依網址搜尋對應的 detail 內容
  detailConfig.setCurrentJob(job)
  let detail = detailConfig.getCurrentJobDetail()
  return detail ? utils.joinDictValues(detail) : ''
}

export function isJobIncludesKeyword(job, keyword) {
  keyword = keyword.toLowerCase()
  let tags = utils.getLowerTags(job)

  // 檢查別名，當關鍵字涵蓋別名key，去查詢別名value是否出現在job
  if (config.keywordAliases[keyword]) {
    return config.keywordAliases[keyword].some(alias => tags.includes(alias))
  }

  let detail = getDetail(job)
  return detail ? detail.toLowerCase().includes(keyword) : false
}
