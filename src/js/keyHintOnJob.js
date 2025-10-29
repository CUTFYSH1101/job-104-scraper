import { ref } from 'vue'

export default function() {
  let jobOnHover = ref({})

  let setJobOnHover = job => jobOnHover.value = job

  let isHovering = job => jobOnHover.value === job

  return {
    setJobOnHover,
    isHovering,
  }
}
