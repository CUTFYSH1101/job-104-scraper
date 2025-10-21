export default class {
    batch = 30

    async forEach(arr, callback) {
        for (let i = 0; i < arr.length; i++) {
            await callback(arr[i])
            if ((i + 1) % this.batch === 0)  // 避免一開始就滿足條件
                await this.yield()
        }
        await this.yield()
    }

    // 釋放給其他程式執行
    yield() {
        return new Promise(resolve => setTimeout(resolve, 0))
    }
}
