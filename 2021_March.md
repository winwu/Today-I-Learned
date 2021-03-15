

## 2021-03-04

(整理) 自己接手 legacy code 的習慣:

0. 從 redux-saga, reducer, action 開始追 code，確認資料來源跟網頁上的事件有哪些觸發點，例如 initXXX，是要 init 什麼，中間呼叫哪些 API，存入 store 的資料主要又是什麼，中間是否又會從 saga 的 function 中去 put 其他 action 等等...，一連串的功能以及行為可以從 saga 的撰寫得到一些資訊。

1. 補 i18n key (如果之前的開發者沒有補的話...)。

2. 檢查檔案 import 順序，個人習慣由第三方套件優先，接著是共用 component, 接著才是相對目錄的 component 或是檔案。(也有人會習慣用英文字母排序～)。

3. 盡量不在 react 依序呼叫 action，如果是有順序性的流程應該在 saga 處理，也可以免除一大堆 prop 的傳接球遊戲。而且除了不能保證得到資料的先後順序，要新增流程或功能也很麻煩。

4. 檢查錯字，使用 eslint-plugin-spellcheck 掃一次檔案目錄 (但我自己平常開發時不啟用，只有在整理 code 的時候會 enabled，因為專案比較複雜，有很多單字其實是 API response 的 key，但又不是一個可以辨別的單字，如果要一個一個加入白名單既耗時又沒有太大的幫助)。

5. 盡量為 any 型別的 TypeScript 補上型別 (也許是過去從 js 轉移到 ts 的檔案或者是趕時間沒有好好整理型別的檔案)。但不會為容易變更 API response 結構的 API response 下 TypeScript 型別。

6. 擴展功能或是原 API 結構或內容有調整，也要多留意原本的變數命名是否符合適當的命名。

7. saga 檔案裡面的 function 的順序跟檔案底部的 export statement 順序要一致。我自己習慣如果是越常用(改)、初始化頁面資料相關的 function 會放在比較上面。


## 2021-03-15

最近在處理工作上的新需求，順便改寫前人以及我自己以前的 code，
整理了幾個範例，以下是我自己平常喜歡的 JavaScript 整理方式 (純個人喜好，請參考參考就好，每個人都有自己喜歡的方式)


#### 1) 清除多餘的 value re-assign

如果 Object 的 key 及 value 同名，可直接簡化:

```js
// before
const something = {
    start: 0,
    size: 10,
    sortBy: 'name',
    sortOrder: 'asc'
};

const { start, size, sortBy, sortOrder } = something;
const requestParams = {
    start: start,           // <- here
    size: size,             // <- here
    sortBy: sortBy,         // <- here
    sortOrder: sortOrder    // <- here
};
```


```js
// after
const { start, size, sortBy, sortOrder } = something;

const requestParams = {
    start,
    size,
    sortBy,
    sortOrder
};
```

#### 2) 利用 Object Destructuring assignment 簡化賦值到新物件

```js
// before

/*
 * 情境假設:
 * 後端傳遞的 key 值與實際前端儲存的 key 值不同，就必須要一個一個 re-assign 到指定的 object key
 * API 回傳的 key 格式不一致，例如大小寫命名不同
 */
const response = {
    data: [],
    posts_count: 0,
    hiddenCount: 0,
    message
};

const result = {
    datas: response.data,
    postCount: response.posts_count,
    hiddenCount: response.hiddenCount
    message
}

return result;
```

```js
// after
const {
    data: datas,
    post_count: postCount,
    hiddenCount,
    message
} = response;

const result = {
    data,
    postCount,
    hiddenCount,
    message
}

return result;
```

* Object Destructuring 有很多好用的語法，https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment


#### 3) 利用 optional chaining 簡化不斷巢狀進去物件判斷值存不存在的情況

* 要注意 optional chaining 至少要 TypeScript 3.7 以上才有支援。

```js
// before
if (res && res.data && res.data.message) {
    alert(res.data.message);
}
```

```js
// after
if (res?.data?.message) {
    alert(res.data.message);
}
```

我通常也會搭配 Nullish coalescing operator (??) 一起使用，?? 代表找不到值時最後的預設值。(有的人可能會疑惑，那為甚麼不用 || 就好了，請參考 https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#nullish-coalescing 說明)

```js
const res = null;

const msg = res?.data?.message ?? 'No message.';
alert(msg);
// 會印出 'No message.'
```


```js
const res = {
    data: {
        message: ''
    }
}

const msg = res?.data?.message ?? 'No message.';
alert(msg);
// 會印出 ''
```


#### 4) 簡化 if-else statement

如果有一段 code snippets 包含一堆 if-else 只是為了去新增/修正/移除某個物件的值，我自己是看了有點煩躁，除非整段寫起來的行氣有一個 grouping 的感覺或是真的沒有修改太多屬性，不然真的是在整追 code 的人吧?! 誰知道哪個值到底是哪裡被改掉，說不定中間還穿插一些不相關的判斷呢。

```js
// before
const meals = {
    breakfast: null,
    lunch: 'curry',
    dessert: 'French fries'
};

if (iHaveTime) {
    meals.breakfast = 'sandwich';
}

if (tasksFinished) {
    meals.dessert = meals.dessert + ' and coke';
} else {
    delete meals.dessert;
}

```

```js
// after
const meals = {
    breakfast: iHaveTime ? 'sandwich' : null,
    lunch: 'curry',
    ... (tasksFinished ? { dessert: 'French fries and coke'} : {}) 
    // 也可以是 ... (tasksFinished ? { dessert: 'French fries and coke'} : undefined ) ，看情況啦~
};
```


#### 5) 參數簡化

```js
// before
function onChange(e) {
    console.log('e.data', e.data);
    console.log('e.message', e.message);
}

onChange({data: 'abc', message: 'success' })

// output
// e.data abc
// e.message success

```

```js
// before
function onChange({ data, message }) {
    console.log('data', data);
    console.log('message', message);
}

onChange({data: 'abc', message: 'success' })

// output
// e.data abc
// e.message success

```
