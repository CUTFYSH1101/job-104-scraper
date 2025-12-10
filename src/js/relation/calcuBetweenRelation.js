import * as utils from '../utils.js'

const pairs = arr => {
  let result = []
  for (let i = 0; i < arr.length - 1; i++)
    for (let j = i + 1; j < arr.length; j++)
      result.push([arr[i], arr[j]])
  return result
}

const calcu = (keyword, jobs) => {
  let eachJobTags = jobs.map(job => utils.getLowerTags(job))
  let totalTags = utils.getTotalUniqueTags(jobs)

  // `http`出現在網址開頭，所以比對每個項目必中，且本身不是技能關鍵字，所以直接去除
  eachJobTags = eachJobTags.filter(list => !list.includes('http'))
  totalTags = totalTags.filter(tag => tag !== 'http')

  // nodes
  let nodes = totalTags.map(tag => ({ id: tag }))

  // links
  let countDict = {}
  eachJobTags.forEach(tags => {
    const pairs_ = pairs(tags).map(pair => pair.sort())  // 根據字母順序排列
    pairs_.forEach(pair => {
      if (countDict[pair]) countDict[pair]++
      else countDict[pair] = 1
    })
  })
  let links = countDict._items.map(item => {
    let split = item.key.split(',')
    if (split.length < 2)
      throw new Error(`It should be formatted as "keyword1,keyword2", but this noe is ${item.key}`)
    return { 'source': split[0], 'target': split[1], count: item.value }
  })

  return [nodes, links]
}

export default { calcu }
