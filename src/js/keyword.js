import { ref } from 'vue'

let keyword_ = ref('')
export const setKeyword = val => keyword_.value = val
export const getKeyword = () => keyword_.value
