import KoaRouter from '@koa/router';
import { defineRoutes, RouterDefiner } from './route-builder';

export type { RouterDefiner };

export function defineRouter(cb: (definer: RouterDefiner) => void) {
  const router = new KoaRouter();
  defineRoutes(cb)
    .getRoutes()
    .forEach((r) => {
      router.register(r.path, r.method ? (Array.isArray(r.method) ? r.method : [r.method]) : [], (ctx) => {
        const routeCtx = {
          header: r.input.header.transform(ctx.header),
          body: r.input.body.transform(ctx.body),
        };
        const result = r.call(routeCtx);
        Object.entries(r.output.header.transform(result.header)).forEach(([k, v]) => {
          ctx.set(k, `${v}`);
        });
        ctx.body = r.output.body.transform(result.body);
      });
    });
  return router;
}
