# JavaScript Proxy 


## 各種嘗試

### 1_Array.html

<img src="../../../main/javascript/proxy/assets/demo_1.png?raw=true">

```js
// proxy 的 target 結構如:
let tableData = [
    { id: 1, name: 'winwu' }
];
```

Proxy 主要是用來代理物件的行為，在這個範例使用 Array 的結構作為 Proxy 的 target 對象並製作一個表格，並且可以透過原生的 dialog 視窗新增表格的記錄，用來模擬雙向綁定的效果，資料全存在 local，沒有任何的 API，也沒有引入任何的 lib（除了 bebel，我需要這個 :P）。

這個範例比較需要注意的部分是在於因為操作 Array 會影響 length 的數量，因此在 proxy 過程中 set 會被呼叫兩次，其中一次正是因為 array length 的異動 (length 本身也是個 property，但 length 異動不需要觸發 render 表格的行為，因此需要將 length 被異動時的操作跳過不處理 (如範例 html 中的 `if (property === 'length') {  return true; }` )


### 2_Object.html

<img src="../../../main/javascript/proxy/assets/demo_2.png?raw=true">

```js
// proxy 的 target 結構如:
let tableData = {
    data: [
        { id: 1, name: 'winwu' },
        { id: 2, name: 'ant' },
        { id: 3, name: 'ter' },
        { id: 4, name: 'stan' },
        { id: 5, name: 'curt' },
        { id: 6, name: 'andy' },
        { id: 7, name: 'chrisss' },
        { id: 8, name: 'amy' },
        { id: 9, name: 'zoo' },
        { id: 10, name: 'Drink' }   
    ]
}
```

這個練習是第一個練習的延伸，但不同的是 proxy 的 target 是一個 object 結構，與前一個範例做比較，差別主要在於刪除的功能上，在第一個範例中，要刪除某個 table 的項目，可以直接使用 delete tableData[index]，然後在 proxy 中新增 deleteProperty，只要偵測到 delete 的行為，就會觸發重新 render 表格的行為。

```js
// 1_Array.html
const tableProxy = new Proxy(tableData, {
    set: (target, property, value) => {
        // 略
    },
    deleteProperty: (target, property) => {
        Reflect.deleteProperty(target, property);
        tableNode.render(tableData);
        return true;
    }
});
```

而第二個範例，因為資料都存在 tableData 的 data 之中，proxy 沒有 handle 到巢狀的 array，因此要刪除某個項目必須把整個 tableData.data 抓出來 splice 不需要的 index 項目後，再整個更新 tableData.data。

```js
// 2_Object.html
tableNode.addEventListener('click', (e) => {
    if (e.target.className === 'delete-btn') {
        const removeIndex = e.target.dataset.index;
        const original = tableProxy.data;
        original.splice(removeIndex, 1);
        if (removeIndex) {
            tableProxy.data = original;
        }
    }
});
```


### 3_DataTable.html

<img src="../../../main/javascript/proxy/assets/demo_3.png?raw=true">

```js
// proxy 的 target 結構如:
const tableData = {
    loading: false,
    total: null,
    sort: 'stars', // best match
    order: 'desc',
    query: 'react',
    page: 1,
    size: 10,
    data: null,
    errors: []
};
```

第三個練習，是將第二個練習再進階一點，使用 github 的 API 作為 table 的資料來源，並且新增分頁、搜尋 (包含 debounce input change 事件)、排序、重新整理等功能。這個練習的寫法是絕對有可以再優化的空間，但是主要是能夠完整的呈現使用 Proxy 達到雙向綁定的效果，後續的練習會再將這個練習改善一下。走到這個練習發現其實雙向綁定沒有這麼的複雜，偶爾也能思考假如可以不要依賴框架，可以怎麼達到自己想要的效果呢。