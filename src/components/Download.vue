<template>
  <button @click='toCsv()'>
    <i class='fa fa-download' aria-hidden='true'></i>
    {{ textContent ?? 'EXPORT' }}
  </button>
</template>

<script>
import * as utils from '@/js/core/utils.js'
import Papa from 'papaparse'

export default {
  props: ['data', 'format', 'csvName', 'textContent'],
  data() {
    return {
      processedData: [],
    }
  },
  methods: {
    toCsv() {
      this.jobToData()
      if (!this.processedData || this.processedData.length === 0) return

      const csvString = Papa.unparse(this.processedData, {
        quotes: true,
        quoteChar: '"',
        escapeChar: '"',
        delimiter: ',',
        header: false,
        newline: '\r\n'
      })

      let csv = 'data:application/csv,' + encodeURIComponent('\ufeff' + csvString)
      let anchor = document.createElement('a')
      anchor.setAttribute('href', csv)
      anchor.setAttribute('download', this.csvName)
      document.body.appendChild(anchor)
      anchor.click()
    },
    jobToData() {
      if (this.format === 'job' || this.format === 'detail') {
        let data = this.data
        let col = Object.keys(data[0])
        let rows = data.map(job => col.map(key => job[key]))
        this.processedData = [col, ...rows]
      }
    },
  },
}
</script>

<style scoped lang='sass' src='@/styles/btn.sass'/>