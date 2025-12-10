import { ref } from 'vue'

let isGraphPage = ref('')
export const setIsGraphPage = val => isGraphPage.value = val
export const getIsGraphPage = () => isGraphPage.value
