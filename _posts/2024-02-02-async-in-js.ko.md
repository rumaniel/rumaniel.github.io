---
layout: post
title: "JavaScript 비동기 처리의 진화"
description: JavaScript 비동기 처리의 진화 과정 - Callback에서 Promise, async/await까지
image: /assets/callback-hell.webp
date: 2024-02-02 11:11:24 +0900
tags: [javascript, async]
categories: [backend]
lang: ko
permalink: /async-in-javascript/
---

# JavaScript 비동기 처리의 진화

js 초창기에는 비동기 작업을 처리하기 위해 콜백(callback) 패턴을 주로 사용했습니다. 하지만 콜백이 중첩되면서 코드 가독성이 떨어지고, 흔히 "callback hell"이라 불리는 문제가 발생했습니다. 이후 이를 언어가 현대화 되는 과정에서 다양한 접근이 등장했는데, 대표적으로 **Promise**와 이후의 **async/await** 키워드가 있습니다. 이번 글에서는 이 흐름을 정리하고, 과거 호환성을 위해 `async` 라이브러리와 `async/await`를 함께 사용하는 방법까지 살펴보겠습니다.

---

## 1. Callback

콜백은 함수 실행이 끝난 뒤 호출될 함수를 인자로 넘겨주는 방식입니다.

```js
function getData(callback) {
  setTimeout(() => {
    callback("data");
  }, 1000);
}

getData((result) => {
  console.log(result); // "data"
});
```

단순한 예제에서는 문제가 없지만, 여러 비동기 작업을 순차적으로 처리하려면 콜백이 중첩되면서 코드가 복잡해집니다.

```js
getData((a) => {
  getData((b) => {
    getData((c) => {
      console.log(a, b, c);
    });
  });
});
```

---

## 2. Promise

Promise는 비동기 작업을 객체로 표현하여, 성공(`resolve`)과 실패(`reject`)를 명확히 다룰 수 있게 합니다.

```js
function getDataPromise() {
  return new Promise((resolve) => {
    setTimeout(() => resolve("data"), 1000);
  });
}

getDataPromise()
  .then((result) => console.log(result))
  .catch((err) => console.error(err));
```

체이닝을 통해 콜백 중첩 문제를 완화할 수 있습니다.

```js
getDataPromise()
  .then((a) => getDataPromise())
  .then((b) => getDataPromise())
  .then((c) => console.log(a, b, c));
```

---

## 3. Async / Await

ES2017에서 도입된 `async/await`는 Promise 기반 비동기 코드를 동기 코드처럼 작성할 수 있게 해줍니다.

```js
async function processData() {
  const a = await getDataPromise();
  const b = await getDataPromise();
  const c = await getDataPromise();
  console.log(a, b, c);
}

processData();
```

가독성이 크게 향상되며, 에러 처리도 `try/catch`로 직관적으로 다룰 수 있습니다.

---

## 4. Async 라이브러리와 Async/Await

Node.js 구버전에서는 [async](https://www.npmjs.com/package/async) 라이브러리를 활용해 콜백 지옥을 완화했습니다. 최근에는 이 라이브러리도 `async/await`와 함께 사용할 수 있습니다.

예를 들어, `async.map`을 `async/await`와 함께 쓰는 방식은 다음과 같습니다.

```js
const asyncLib = require("async");

async function run() {
  const results = await asyncLib.map(
    [1, 2, 3],
    async (num) => {
      return await getDataPromise();
    }
  );
  console.log(results);
}

run();
```

이렇게 하면 레거시 코드와의 호환성을 유지하면서도 최신 문법의 장점을 살릴 수 있습니다.
