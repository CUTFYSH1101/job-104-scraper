import * as config from '@/js/core/config.js'

function matchKeyword(text, keyword) {
  if (!text || !keyword) return false
  keyword = keyword.toLowerCase()
  text = text.toLowerCase()

  let aliases = config.keywordAliases[keyword]
  if (aliases) return aliases.some(alias => text.includes(alias))

  return text.includes(keyword)
}

self.onmessage = function(e) {
  const { nodes, jobsData } = e.data

  let nodes_ = nodes.map(row => ({
    id: row.id,
    count: jobsData.filter(jobData => matchKeyword(jobData.detail, row.id)).length,
  }))

  self.postMessage(nodes_)
}
