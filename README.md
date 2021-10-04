# @typified-web/router

A type-safe wrapper over koa router with focus on maintenance and consistence.

## Getting Started

To install the package via npm:

```sh
npm i @typified-web/router
```

To define a router:

```ts
import { defineRouter } from '@typified-web/router';

const router = defineRouter((define) => ({
  routes: [
    define.route({
      method: 'GET',
      input: define.input.body((types) => types.string()),
      output: define.output.body((types) => types.string()),
    }})((ctx) => {
      return {
        status: 200,
        header: {},
        body: ctx.body,
      };
    }),
  ]
}));
```

Add it to server and run.

```ts
import Koa from 'koa';
import { defineMiddleware } from '@typified-web/router';

const app = new Koa();
app.use(defineMiddleware(router));

app.listen(3000);
```

To export the OpenAPI document:

```ts
import { exportOpenAPI } from '@typified-web/router';

const doc = exportOpenAPI(router);
```

## License

ISC
