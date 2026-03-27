---
layout: post
title: "Evolution of Async in JavaScript"
description: The evolution of asynchronous programming in JavaScript - from Callbacks to Promises and async/await
image: /assets/callback-hell.webp
date: 2024-02-02 11:11:24 +0900
tags: [javascript, async]
categories: [backend]
lang: en
permalink: /async-in-javascript/
---

# Evolution of Async in JavaScript

In the early days of JavaScript, the callback pattern was primarily used to handle asynchronous operations. However, as callbacks nested deeper, code readability suffered, leading to the infamous "callback hell" problem. As the language modernized, various approaches emerged to address this, most notably **Promise** and later the **async/await** keywords. In this article, I'll summarize this evolution and explore how to use the `async` library alongside `async/await` for backward compatibility.

---

## 1. Callback

A callback is a function passed as an argument to be executed after another function completes.

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

While this works fine in simple examples, handling multiple asynchronous operations sequentially causes callbacks to nest, making code increasingly complex.

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

Promise represents asynchronous operations as objects, allowing clear handling of success (`resolve`) and failure (`reject`).

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

Chaining helps mitigate callback nesting issues.

```js
getDataPromise()
  .then((a) => getDataPromise())
  .then((b) => getDataPromise())
  .then((c) => console.log(a, b, c));
```

---

## 3. Async / Await

Introduced in ES2017, `async/await` allows Promise-based asynchronous code to be written like synchronous code.

```js
async function processData() {
  const a = await getDataPromise();
  const b = await getDataPromise();
  const c = await getDataPromise();
  console.log(a, b, c);
}

processData();
```

Readability improves significantly, and error handling becomes intuitive with `try/catch`.

---

## 4. Async Library with Async/Await

In older Node.js versions, the [async](https://www.npmjs.com/package/async) library was used to mitigate callback hell. Today, this library can be used alongside `async/await`.

For example, here's how to use `async.map` with `async/await`:

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

This approach maintains compatibility with legacy code while leveraging the benefits of modern syntax.
