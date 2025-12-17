### jobs還未切換過來所造成的錯誤

解法1：等待直到載入

```javascript
// 直到`isJobIncludesKeyword.setCurrentPath`觸發，`calcuLoading.jobsData.getDetail`才不為`undefined`
async function loadingAfterSettingDetailCsvPath(nodes, delay = 100) {
    return await new Promise(resolve => {
        let interval = setInterval(async () => {
            let result = await CalcuLoading.loading(utils.parse(props.jobs), nodes)
            if (!result[0].count) return
            clearInterval(interval)
            resolve(result)
        }, delay)
    })
}
```

解法2：在每個async方法，用await等待它載入
缺點是畫面會等待它而卡頓

```javascript
export async function loadJobs(filepath, onSuccess = filepath => {
}) {
    let async_ = async () => new Promise((resolve, reject) => Papa.parse(filepath, {
        download: true, // 載入檔案而非字串
        header: true, // 轉成[{},{}]格式
        complete(result) {
            resolve(result.data)
        }, error(e) {
            reject(e)
        },
    }))
    try {
        let jobs = await async_()
        jobs = jobs.filter(job => joinDictValues(job, '').trim() && job['網址']?.trim())  // dropna
        await onSuccess?.(filepath)  // 這一行
        return jobs
    } catch (e) {
        console.error(e)
        return undefined
    }
}
```

### 在`d3.join`等有`{}`括住的地方呼叫`this`最好搭配箭頭函數（一般都是希望指向外側的`class`本體）

```javascript
{  // <--注意這個
  g.append('rect')
    .attr('fill', 'white')
    .attr('width', d => d.width)
    .attr('height', this.nodeHeight)
    .lower()
    .call(
      d3.drag()
        .on('start', this.dragStart)
        .on('drag', this.dragging)
        .on('end', this.dragEnd),
    )
    .on('mouseenter', this.interaction.mouseenterNode)
    .on('mouseleave', this.interaction.mouseleaveNode)
    .attr('cursor', 'pointer')
}  // <--注意這個
```

要搭配箭頭函數

```javascript
this.dragging = (event, data) => {
  this.simulation.dragging(event, data)  // `this`指向外側的`class`本體
}
```

而不是函式

```javascript
function dragging(event, data) {
  this.simulation.dragging(event, data)  // `this`指向`function`，此時`this.simulation`為`undefined`
}
```

---

### 力學模擬傳入新的nodes或links，節點會飄到不知道哪裡

DEBUG: 更新`nodes`或`links`不會位置跑掉（錯誤原因：會繼承上一次設定的`vx, vy, x, y`導致偏移）
解決方法有兩種，我選後一種，因為邏輯是每次更新任何屬性，就重新繪製畫面

```javascript
// 經過力學模擬後，`nodes`不會改變，但是`links`會改變，必須還原`links`的`source`和`target`
// 原本links[0] = { 'source': 'A', 'target': 'B' }
// 經過力學模擬，links[0] = { 'source': { id, index, vx, vy, x, y }, 'target': { id, index, vx, vy, x, y } }
let [n2, l2] = CalcuBetweenRelation.calcu(utils.parse(props.jobs))  // okay
// let [n2, l2] = [Object.assign([], nodes), Object.assign([], links)]  // error
let loadingNodesCount = await CalcuLoading.loading(utils.parse(props.jobs), n2)
graph.args = {
    nodes: loadingNodesCount,
    links: l2,
}
```

```javascript
// 資料更新後，統一把 source/target 轉回字串，再調用`d3.forceSimulation`重新綁定和生成位置
if (this.links?.length > 0 && this.links[0].source.id)
  this.links.forEach(link => {
    link.source = link.source.id
    link.target = link.target.id
  })
```

---

### git deploy failed

```commandline
Failed to get remote.origin.url (task must either be run in a git repository with a configured origin remote or must be configured with the "repo" option).
```

錯誤原因：npm套件衝突

解決方式：刪除 `package-lock.json` 和 `node_modules`，再輸入 `npm install` 重新安裝所有套件即可

---

### 找不到App.vue檔案

```commandline
Failed to resolve import "@/App.vue" from "src/main.js". Does the file exist?
```

```commandline
Failed to parse source for import analysis because the content contains invalid JS syntax. Install @vitejs/plugin-vue to handle .vue files.
```

##### 造成問題的原因：

有進程占用了 5173 這個 port 導致 Vue 自動切到 5174，也就是說 `http://localhost:5173/` 連不到，要改成
`http://localhost:5174/`

##### 解決方式：

1. 重啟環境`npm run dev`後點選新網址
2. 關閉占用5173的進程

二擇一，以下是關閉占用進程的方法

```commandline
# 查看誰在使用 5173 port
netstat -ano | findstr :5173

# 會看到類似這樣的輸出：
# TCP    0.0.0.0:5173    0.0.0.0:0    LISTENING    12345
# 最後的數字（12345）就是 Process ID (PID)

# 關閉該進程（用上面查到的 PID）
taskkill /PID 12345 /F
```

或是關閉全部進程

```commandline
# 一次關閉所有 Node.js 進程
taskkill /IM node.exe /F
```

---

### 推送到github

npm install gh-pages --save-dev

git init
git config --global --add safe.directory 'T:/Programing_RightPath/_WebAndHTML/JS Hahow動畫互動網頁特效入門/4.
js/vue-project'
git remote add origin https://github.com/CUTFYSH1101/job-104-scraper.git
git pull
用Fork這款軟體，強制推送master到遠端資料庫origin，所有選項都打勾 詳情看notion教學
