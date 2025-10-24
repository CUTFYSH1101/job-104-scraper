import { ref } from 'vue'

export let isMobile = ref(window.innerWidth <= 430)
window.addEventListener('resize', () => isMobile.value = window.innerWidth <= 430)
export default { isMobile }
