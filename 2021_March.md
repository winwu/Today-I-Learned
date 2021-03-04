## 2020-03-04

(整理) 自己接手 legacy code 的習慣:

0. 從 redux-saga, reducer, action 開始追 code，確認資料來源跟網頁上的事件有哪些觸發點，例如 initXXX，是要 init 什麼，中間呼叫哪些 API，存入 store 的資料主要又是什麼，中間是否又會從 saga 的 function 中去 put 其他 action 等等...，一連串的功能以及行為可以從 saga 的撰寫得到一些資訊。

1. 補 i18n key (如果之前的開發者沒有補的話...)。

2. 檢查檔案 import 順序，個人習慣由第三方套件優先，接著是共用 component, 接著才是相對目錄的 component 或是檔案。(也有人會習慣用英文字母排序～)。

3. 盡量不在 react 依序呼叫 action，如果是有順序性的流程應該在 saga 處理，也可以免除一大堆 prop 的傳接球遊戲。而且除了不能保證得到資料的先後順序，要新增流程或功能也很麻煩。

4. 檢查錯字，使用 eslint-plugin-spellcheck 掃一次檔案目錄 (但我自己平常開發時不啟用，只有在整理 code 的時候會 enabled，因為專案比較複雜，有很多單字其實是 API response 的 key，但又不是一個可以辨別的單字，如果要一個一個加入白名單既耗時又沒有太大的幫助)。

5. 盡量為 any 型別的 TypeScript 補上型別 (也許是過去從 js 轉移到 ts 的檔案或者是趕時間沒有好好整理型別的檔案)。但不會為容易變更 API response 結構的 API response 下 TypeScript 型別。

6. 擴展功能或是原 API 結構或內容有調整，也要多留意原本的變數命名是否符合適當的命名。

7. saga 檔案裡面的 function 的順序跟檔案底部的 export statement 順序要一致。我自己習慣如果是越常用(改)、初始化頁面資料相關的 function 會放在比較上面。
