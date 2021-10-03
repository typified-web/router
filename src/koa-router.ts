import KoaRouter from '@koa/router';
import { defineRoutes, RouterDefiner } from './route-builder';

export type { RouterDefiner };

export function defineRouter(cb: (definer: RouterDefiner) => void): KoaRouter {
  const router = new KoaRouter();
  defineRoutes(cb)
    .getRoutes()
    .forEach((r) => {
      router.register(r.path, r.method ? (Array.isArray(r.method) ? r.method : [r.method]) : [], (ctx) => {
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
  return router;
}
