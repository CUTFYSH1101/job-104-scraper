import {ref} from 'vue'  // reactive只能用於物件陣列, ref使用時要加上.value索取值
import {setLocalStorage, getLocalStorage} from "@/js/utils.js"  // 永久保存我的最愛

let bookmark = ref({})  // 變更時觸發Vue更新畫面

function setBookmark(jobHref, index) {
    let colorMap = ['purple', 'blue', 'green', 'orange']
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

export function startListening(job) {
    activeJob.value = job
    window.addEventListener('keyup', switchBookmark)
}

export function stopListening() {
    window.removeEventListener('keyup', switchBookmark)
}

if (getLocalStorage('bookmark') !== null)
    bookmark.value = getLocalStorage('bookmark')

export default {getBookmark, startListening, stopListening}
