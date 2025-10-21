<template>
  <button @click="toCsv()">
    <i class="fa fa-download" aria-hidden="true"></i>
    EXPORT
  </button>
</template>

<script>
import * as utils from '../js/utils'

export default {
  props: ['data', 'format', 'csvName'],
  data() {
    return {
      processedData: [],
    }
  },
  methods: {
    toCsv() {
      this.jobToData()
      if (!this.processedData || this.processedData.length === 0) return

      let csvString = ""
      this.processedData.forEach(row => {
        row.forEach(cell => {
          if (cell === undefined || cell === null) return
          if (utils.includes(cell, ','))
            cell = '"' + cell + '"'
          csvString += cell + ","
        })
        csvString += "\r\n"
      })

      csvString = "data:application/csv," + encodeURIComponent('\ufeff' + csvString)
      let anchor = document.createElement("a")
      anchor.setAttribute("href", csvString)
      anchor.setAttribute("download", this.csvName)
      document.body.appendChild(anchor)
      anchor.click()
    },
    jobToData() {
      if (this.format === 'job') {
        let data = this.data
        let col = Object.keys(data[0])
        let rows = data.map(job => col.map(key => job[key]))
        this.processedData = [col, ...rows]
      }
    },
  },
}
</script>

<style scoped lang="sass" src="../styles/btn.sass">
</style>