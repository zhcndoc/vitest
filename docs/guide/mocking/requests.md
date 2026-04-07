# 模拟请求

由于 Vitest 运行在 Node 中，模拟网络请求很棘手；Web API 不可用，所以我们需要某种东西来为我们模拟网络行为。我们推荐使用 [Mock Service Worker](https://mswjs.io/) 来完成此任务。它允许你模拟 `http`、`WebSocket` 和 `GraphQL` 网络请求，并且不依赖特定框架。

Mock Service Worker (MSW) 通过拦截测试发出的请求来工作，允许你使用它而无需更改任何应用程序代码。在浏览器中，它使用 [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)。在 Node.js 中，以及对于 Vitest，它使用 [`@mswjs/interceptors`](https://github.com/mswjs/interceptors) 库。要了解有关 MSW 的更多信息，请阅读他们的 [介绍](https://mswjs.io/docs/)

## 配置

你可以在 [设置文件](/config/setupfiles) 中如下使用它

::: code-group

```js [HTTP 设置]
import { afterAll, afterEach, beforeAll } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

const posts = [
  {
    userId: 1,
    id: 1,
    title: 'first post title',
    body: 'first post body',
  },
  // ...
]

export const restHandlers = [
  http.get('https://rest-endpoint.example/path/to/posts', () => {
    return HttpResponse.json(posts)
  }),
]

const server = setupServer(...restHandlers)

// 在所有测试之前启动服务器
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// 在所有测试之后关闭服务器
afterAll(() => server.close())

// 在每个测试之后重置处理程序以实现测试隔离
afterEach(() => server.resetHandlers())
```

```js [GraphQL 设置]
import { afterAll, afterEach, beforeAll } from 'vitest'
import { setupServer } from 'msw/node'
import { graphql, HttpResponse } from 'msw'

const posts = [
  {
    userId: 1,
    id: 1,
    title: 'first post title',
    body: 'first post body',
  },
  // ...
]

const graphqlHandlers = [
  graphql.query('ListPosts', () => {
    return HttpResponse.json({
      data: { posts },
    })
  }),
]

const server = setupServer(...graphqlHandlers)

// 在所有测试之前启动服务器
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// 在所有测试之后关闭服务器
afterAll(() => server.close())

// 在每个测试之后重置处理程序以实现测试隔离
afterEach(() => server.resetHandlers())
```

```js [WebSocket 设置]
import { afterAll, afterEach, beforeAll } from 'vitest'
import { setupServer } from 'msw/node'
import { ws } from 'msw'

const chat = ws.link('wss://chat.example.com')

const wsHandlers = [
  chat.addEventListener('connection', ({ client }) => {
    client.addEventListener('message', (event) => {
      console.log('Received message from client:', event.data)
      // 将接收到的消息回显给客户端
      client.send(`Server received: ${event.data}`)
    })
  }),
]

const server = setupServer(...wsHandlers)

// 在所有测试之前启动服务器
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// 在所有测试之后关闭服务器
afterAll(() => server.close())

// 在每个测试之后重置处理程序以实现测试隔离
afterEach(() => server.resetHandlers())
```
:::

> 将服务器配置为 `onUnhandledRequest: 'error'` 可确保每当存在没有相应请求处理程序的请求时，都会抛出错误。

## 更多

MSW 还有更多功能。你可以访问 cookies 和查询参数，定义模拟错误响应，以及更多！要查看使用 MSW 可以做的所有事情，请阅读 [他们的文档](https://mswjs.io/docs)。
