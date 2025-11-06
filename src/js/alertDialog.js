import { ref } from 'vue'

/**
 * @param {string} msg
 * @param {number} second
 */
export function showAlertDialog(msg, second = 3) {
  if (timer) clearTimeout(timer)
  setMessage(msg)
  setHidden(false)
  timer = setTimeout(() => {
    setHidden(true)
    setMessage('')
  }, Math.floor(second * 1000))
}

let timer = null
let hidden = ref(true)
let message = ref('')
export const setHidden = val => hidden.value = val
export const getHidden = () => hidden.value
export const setMessage = val => message.value = val
export const getMessage = () => message.value
export default { showAlertDialog, getHidden, getMessage }
