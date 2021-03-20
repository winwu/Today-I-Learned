

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


## 2021-03-21

### [讀書筆記] 淺談 JavaScript 的 prototype

閱讀書籍為: [JavaScript 深入精要](https://www.tenlong.com.tw/products/9789863470120?list_name=srh) - Cody Lindley 著、賴屹民 譯

這本書是幾年前一個朋友送我的，還蠻薄的一本書，不過指出很多 JavaScript 使用上的細微的差異，有很多東西我都蠻想記錄下來的，不過今天就以函式的 prototype 為主要的筆記。

* JavaScript 是用 prototype 的機制來實現繼承屬性跟方法，例如建立一個字串變數，而所有的字串都能呼叫 toLocaleLowerCase 這個方法，為什麼有 toLocaleLowerCase 這樣的方法可以使用?，其原因就在於 toLocaleLowerCase 這個方法是繼承自 String function 的 prototype 中。也因為原型繼承的關係，使我們能夠有效率的使用一樣的程式邏輯。

    ```js
    // console

    var a = "aa";
    var b = "bb";
    var c = "cc";

    console.log(a.constructor);
    console.log(b.constructor);
    console.log(c.constructor);

    // ƒ String() { [native code] }
    // ƒ String() { [native code] }
    // ƒ String() { [native code] }

    aa.constructor.prototype.toLocaleLowerCase
    // ƒ toLocaleLowerCase() { [native code] }
    ```


* 使用 JavaScript 建立一個 function 之後，一定會配給一個 prototype 的屬性 (雖然裡面沒有東西)，但是我們可以存取得到 prototype 這個屬性值:

     ```js
    var order = function() {};
    // undefined

    // prototype 的屬性是來自於 Function() 這個建構式
    order.prototype
    // {constructor: ƒ}

    console.log(order.prototype);
    // 得到 undefined
    ```

    不過這邊有一點很特別，使用 arrow function 定義的 function 卻沒自動配給一個 prototype 的屬性，原因就只是因為 arrow function 本來就不會配 prototype 屬性，這是刻意的，因為 arrow function 就是被設計成比較輕巧的，另一個方面可以跟 this 的 scope 有關，可以參考 stackoverflow 上的這篇參考: [Why can't we create prototypes using ES6 Arrow Functions?](https://stackoverflow.com/questions/51416486/why-cant-we-create-prototypes-using-es6-arrow-functions) 或是自行查找網路資料瞜！

    ```js
    const aa = () => {}

    // 透過瀏覽器 Console 介面中輸入 aa. 之後，不會有 prototype 的屬性可以讀取
    // 但是還是可以透過 console.log 取值看看 ，只是會顯示 undefined

    console.log(aa.prototype)
    // undefined
    ````

* JavaScript 在尋找屬性時的順序是，先在該物件查找，如果沒有，從上一層 prototype 裡面查找，再沒有，會去 Object.prototype 屬性裡面查找，**Object.prototype 是查找屬性的最後目的地了**，如果這裡也沒有找到，就會回傳 undefined。以下是我自己在練習時測試的幾個範例。

    範例1:

    ```js 
    var morning = [];

    console.log(morning.sayHello);
    // undefined
    // 查找過程: morning.sayHello -> Array.prototype.sayHello -> Object.prototype.sayHello 

    ```


    範例 2:

    ```js
    var morning = [];

    console.log(morning.sayHello)
    // sayHello 屬性不存在，因此得到 undefined


    // 我在 morning 上自己新增一個 sayHello 的方法 
    morning.sayHello = function() { console.log('say hello at morning') };  

    // 我在 Array 的 prototype 上也新增一個 sayHello 方法 
    morning.constructor.prototype.sayHello = function() { console.log('say hello from Array prototype') };
    // 也可以是: Array.prototype.sayHello = function() { console.log('say hello from Array prototype') };

    // 呼叫 sayHello，因為 morning 已有定義 sayHello 屬性，因此不會在往上(Array 的 prototype) 查找
    morning.sayHello()
    // say hello at morning

    morning.constructor.prototype.sayHello()
    // say hello from Array prototype

    ```


    範例 3:

    ```js
    var morning = [];

    console.log(morning.sayHello)
    // 因為 sayHello 屬性不存在，因此得到 undefined

    // 我在 Object 的 prototype 上也新增一個 sayHello 方法 
    Object.prototype.sayHello = function() { console.log('say hello from Object prototype') };  

    // 呼叫 sayHello
    morning.sayHello()
    // 查找過程: morning.sayHello -> Array.prototype.sayHello -> Object.prototype.sayHello 
    // 因為 morning 沒有定義，Array.prototype 也沒有，但是 object.prototype 有
    // say hello from Object prototype


    // Array.prototype
    // [constructor: ƒ, concat: ƒ, copyWithin: ƒ, fill: ƒ, find: ƒ, …]

    // Object.prototype
    // {sayHello: ƒ, constructor: ƒ, __defineGetter__: ƒ, __defineSetter__: ƒ, hasOwnProperty: ƒ, …}
    ```

### [補充] 要注意的一點

* 所有加入到 Object.prototype 的屬性都會在 for..in 迴圈顯示，因為 for in 會 iterate 所有包括自有和繼承而來的屬性。這也是為什麼有時候使用 for...in 而我們的裝的 linter 可能會跳出一個 warning 訊息，告知要使用 hasOwnProperty 優先判斷屬性是否存在的原因。

```js
// 在原形鏈中加入 aaa, bbb 兩個屬性
Object.prototype.aaa = 10;
Object.prototype.bbb = 20;

let members = {
    cc: 30,
    dd: 40,
};

for (let k in members) {
   console.log(k);
}

// cc
// dd
// aaa
// bbb
```

* 如果只想要 iterate 該物件自己擁有的屬性，可以使用 Object.keys()。

```js
Object.keys(members).forEach((k) => {
    console.log(k);
})

// cc
// dd
```

--- 補充結束，以下回到 prototype ---


* prototype 的屬性是 ***動態*** 的，動態的意思是什麼？物件取得屬性值的時候，不論那個值什麼時候被修改、或是新增一個值(注意，是修改跟新增，下一段會繼續談另一個情況)，都是拿到最新的值，因為這些值都還是跟 prototype 綁在一起的。

```js
// 建立一個員工福利的 function，其中儲存各種假期天數跟福利 blabla 好啦，不重要 XD 只是個舉例～
var employeeBenefits = function employeeBenefits() {};

// 預設員工可以請的病假天數是 15
employeeBenefits.prototype.sickLeaveDays = 15;

// 有一家公司以 employeeBenefits 也作為自家的員工福利政策
var ourCompanyBenefits = new employeeBenefits(); 
console.log(ourCompanyBenefits.sickLeaveDays);
// 15

// 將 employeeBenefits 的病假天數調整為 30
employeeBenefits.prototype.sickLeaveDays = 30;

// 此時再次取得這家公司的病假天數，會得到最新的 30 天
console.log(ourCompanyBenefits.sickLeaveDays)
// 30

// 擴充 sickLeaveDays，從值變成一個 object 看看
employeeBenefits.prototype.sickLeaveDays = {
   paid: 15,
   unpaid: 15
};

// 換成物件也是一樣，此時在取得這家公司的 sickLeaveDays，會取得到最新的物件
console.log(ourCompanyBenefits.sickLeaveDays);
// {paid: 15, unpaid: 15}

```

* 上一點，可以清楚地看出 prototype 裡面的值怎麼被調換，新增，都是取得到最新的結果，但有一種情況是例外，也就是將整個 prototype 換掉，那情況可就不一樣了，上一段的例子，調整、新增的部位可是 prototype 裡面的屬性，但是當 **整個** prototype 是被修改的目標，就沒有辦法保持原形連結的關係，而是變成一個新的原型了，不過已經實例化過的物件，還是會綁定在原有的 prototype 上，不會被更新成新的。


```js
var employeeBenefits = function employeeBenefits() {};
employeeBenefits.prototype.sickLeaveDays = 15;


var ourCompanyBenefits = new employeeBenefits(); 
console.log(ourCompanyBenefits.sickLeaveDays);
// 15

// 注意: 這裡是替換掉整個 prototype
employeeBenefits.prototype = {
    sickLeaveDays: {
       paid: 0,
       unpaid: 30
    }
}

console.log(ourCompanyBenefits.sickLeaveDays);
// 依舊得到 15
// ourCompanyBenefits 還是參考到它當初初始化時的 prototype，已經不是連結到最新的了，因為 employeeBenefits 的 prototype 已經被整個替換掉了 (已失去鏈結。)


// 建立一個新的 company 由 employeeBenefits 實例化而來
var anotherCompanyBenefits = new employeeBenefits();
console.log(anotherCompanyBenefits.sickLeaveDays);

// {paid: 0, unpaid: 30}
```

(讓連結斷掉的情況感覺很奇妙，我是想不到什麼時候會這樣做，總之在操作 prototype 時要注意，身為學習者，知道會有這樣的差異應該就可以了吧 XD)
