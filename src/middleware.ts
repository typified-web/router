import KoaRouter, { Middleware } from '@koa/router';
import { Router } from './router';

/**
 * Define a middleware by given router, currently back by Koa.
 *
 * @param router the router to define.
 * @returns the middleware of koa.
 */
export function defineMiddleware(router: Router): Middleware {
  const middleware = new KoaRouter();
  router.routes.forEach((r) => {
    middleware.register(r.path, r.method ? (Array.isArray(r.method) ? r.method : [r.method]) : [], (ctx) => {
      const routeCtx = {
        header: r.input.header.transform(ctx.header),
        body: r.input.body.transform(ctx.body),
      };
      const { status, header, body } = r.output.transform(r.call(routeCtx));
      ctx.status = status;
      if (header) {
        Object.entries(header).forEach(([k, v]) => {
          ctx.set(k, `${v}`);
        });
      }
      ctx.body = body;
    });
  });
  return middleware.middleware();
}
