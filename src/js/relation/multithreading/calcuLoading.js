import * as utils from '@/js/core/utils.js'
import { getDetailWithoutUrl } from '@/js/job/isJobIncludesKeyword.js'

export const loading = async (jobs, nodes) => {
  // 點 抓取符合該Tag的所有工作
  // 線段 抓取符合兩個關鍵字的工作

  // 預先在主線程獲取所有 job 的 detail 和 tags
  const jobsData = jobs.map(job => ({
    tags: utils.getLowerTags(job),
    detail: getDetailWithoutUrl(job) ?? '',
  }))

  const worker = new Worker(
    new URL('./countWorker.js', import.meta.url),
    { type: 'module' },
  )

  return new Promise((resolve, reject) => {
    worker.onmessage = (e) => {
      // console.log(e.data)
      worker.terminate()
      resolve(e.data)
    }

    worker.onerror = (error) => {
      worker.terminate()
      reject(error)
    }

    worker.postMessage({ nodes, jobsData })
  })
}

export default { loading }
