import { ref } from 'vue'

let keyword = ref('')
export const setKeyword = val => keyword.value = val
export const getKeyword = () => keyword.value
