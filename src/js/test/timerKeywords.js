import Timer from './timer.js'
import * as utils from '@/js/core/utils.js'

async function readFile() {
  await Timer.callbackTimer('readFile', async () => {
    try {
      let paths = await utils.loadText('./data/paths.txt')
      paths = paths.split(/\r?\n/)
      paths = paths.filter(path => path.includes('keywords'))
      let target = '7.5公里內 所有工程師/2025-04-11'
      let path = paths.filter(path => path.replace(/\\/g, '/').includes(target))[0]
      let keywords = await utils.loadText(path)
      keywords = keywords.split(/\r?\n/)
      if (keywords.includes('')) keywords.remove('')
      console.log(keywords)
    } catch {}
  })
}

async function keyword2Set(jobs) {
  await Timer.callbackTimer('keyword2Set', () => {
    let keywords = utils.getTotalUniqueTags(jobs)
    console.log(keywords)
  })
}

export default { readFile, keyword2Set }
