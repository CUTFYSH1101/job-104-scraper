import { ref } from 'vue'  // reactive只能用於物件陣列, ref使用時要加上.value索取值
import { setLocalStorage, getLocalStorage } from '@/js/core/utils.js'  // 永久保存我的最愛

let bookmark = ref({})  // 變更時觸發Vue更新畫面
let colorMap = [
  'hsl(0,95%,65%)',
  'hsl(27,95%,65%)',
  'hsl(55,95%,65%)',
  'hsl(135,95%,65%)',
  'hsl(220,95%,65%)',
  'hsl(245,95%,65%)',
  'hsl(270,95%,65%)']

export function getColorMap() {
  return colorMap
}

function setBookmark(jobHref, index) {
  if (index < 0 || index >= colorMap.length) return
  bookmark.value[jobHref] = colorMap[index]
  setLocalStorage('bookmark', bookmark.value)
}

export function getBookmark(jobHref) {
  return bookmark.value[jobHref]
}

function removeBookmark(jobHref) {
  delete bookmark.value[jobHref]
  setLocalStorage('bookmark', bookmark.value)
}

let activeJob = ref(null)

function switchBookmark(e) {
  let cancelKey = 'p'
  let keyMap = ['q', 'w', 'e', 'r', 't', 'y', 'u']
  let key = e.key.toLowerCase()
  if (cancelKey === key) {
    removeBookmark(activeJob.value['網址'])
    return
  }
  if (!keyMap.includes(key)) return
  setBookmark(activeJob.value['網址'], keyMap.indexOf(key))
}

function startListening(job) {
  activeJob.value = job
  window.addEventListener('keyup', switchBookmark)
}

function stopListening() {
  window.removeEventListener('keyup', switchBookmark)
}

if (getLocalStorage('bookmark') !== null)
  bookmark.value = getLocalStorage('bookmark')

export const bookmarkListener = {
  mounted(el, binding) {
    const job = binding.value

    // 定義處理函式並掛載到 el 上以便移除
    el._handleEnter = () => {
      console.log('mouseenter')
      startListening(job)
    }
    el._handleLeave = () => {
      console.log('mouseleave')
      stopListening()
    }

    el.addEventListener('mouseenter', el._handleEnter)
    el.addEventListener('mouseleave', el._handleLeave)
    el.addEventListener('touchstart', el._handleEnter, { passive: true })
  },
  unmounted(el) {
    el.removeEventListener('mouseenter', el._handleEnter)
    el.removeEventListener('mouseleave', el._handleLeave)
    el.removeEventListener('touchstart', el._handleEnter)
  }
}

export default { getBookmark, getColorMap, bookmarkListener }
