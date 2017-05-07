# Mockiji-Proxy-Middleware

A basic proxy middleware for [Mockiji](https://github.com/NijiDigital/mockiji).

## Usage

```js
const Mockiji = require('mockiji');

const server = new Mockiji({
  configuration: {
    middlewares: [
      require('mockiji-proxy-middleware')({
        checkMockStatus: true,
        paths: {
          '/api/test/book/.*': 'my-books-api.local',
          '/api/test/user/[0-9]+': '127.0.0.1:8083',
        },
      })
    ]
  }
});

server.start();
```

## Parameters

| Name            | Default | Description                                                                                                   |
|-----------------|---------|---------------------------------------------------------------------------------------------------------------|
| checkMockStatus | `true`  | If set to true proxying will only happen if Mockiji could not find a mock file matching the request           |
| timeout         | `60`    | Timeout in seconds for proxied requests                                                                       |
| paths           | `{}`    | An object in which keys are regular expressions and values are the hosts the requests should be redirected to |
