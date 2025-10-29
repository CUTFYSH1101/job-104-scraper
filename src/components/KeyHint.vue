<template>
  <div class="keys" :style="{flexDirection: flexDirection}">
    <button class="key" v-for="keyName in keys" @click="dispatchEvent('keyup', keyName)">{{ keyName }}</button>
  </div>
</template>

<script>
export default {
  props: {
    'keys': {},
    'flexDirection': { default: 'row' },
  },
  methods: {
    dispatchEvent(type, keyName) {
      window.dispatchEvent(new KeyboardEvent(type, { key: keyName }))
    },
  },
}
</script>

<style scoped lang="sass">
$unit: 0.25rem
$unitL: 0.75rem

.keys
  display: flex
  width: fit-content
  height: fit-content
  position: absolute
  right: $unit
  bottom: $unit

.key
  box-shadow: 0 $unit 0 rgba(black, 0.05)
  border: 1px solid rgba(black, 0.1)
  border-radius: $unit
  padding: $unit $unitL
  font-size: $unitL
  line-height: $unitL
  margin: 0 $unit $unit 0
  cursor: pointer
  transition: 0.1s

  &:hover
    transform: scale(1.1)

  &:focus
    transform: scale(0.9)
</style>