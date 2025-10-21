<template>
  <select class="select" v-model="currentPath">
    <option disabled selected>開啟新的檔案</option>
    <option v-for="path in thePathsHavingKeyword" :value="path">{{ shortPath(path) }}</option>
  </select>
</template>

<script>
import * as utils from "@/js/utils.js"
import {setCurrentPath} from "@/js/detailPreview.js"

let paths = await utils.loadText('./data/paths.txt')

export default {
  data() {
    return {
      thePathsHavingKeyword: [],
      currentPath: '',
    }
  },
  mounted() {
    paths = paths.split(/\r?\n/)
    this.thePathsHavingKeyword = paths.filter(path => path.includes('claude'))
  },
  methods: {
    shortPath(path) {
      return utils.shortPath(path)
    }
  },
  watch: {
    async currentPath(newVal) {
      let currentPath = newVal.replace(/\\/g, '/')  // 避免watch被觸發兩次，不使用this.去重複賦值
      try {
        let jobs = await utils.loadJobs(currentPath, setCurrentPath)
        if (jobs && jobs.length > 0)
          window.vm.jobs = jobs
      } catch {
        console.error('檔案路徑不存在')
      }
    },
  },
}
</script>

<style scoped lang="sass">
@use "@/styles/variables.sass" as var

.select
  position: absolute
  margin: var.$px20
  padding: var.$px10 var.$px20
  font-size: 14px
  border-bottom: solid 2px var.$gray
  border-radius: var.$infinity
  transition: 0.2s

  &:focus
    outline: none

  &:hover
    transform: scale(1.05)
    cursor: pointer

  option
    padding: var.$px10
    border-bottom: solid 2px var.$gray
    border-radius: var.$infinity
</style>