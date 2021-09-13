import assert from 'assert';
import { defineRoutes, defineSchema } from '../src/route-builder';

describe('RouteBuilder', () => {
  it('should throw no declaration errors', () => {
    const routes = defineRoutes((routes) =>
      routes
        .route({
          method: 'GET',
          path: '/',
          input: {
            header: defineSchema((types) =>
              types.object({
                a: types.boolean(),
              }),
            ),
            body: defineSchema((types) => types.boolean()),
          },
          output: {
            header: defineSchema((types) => types.object({})),
            body: defineSchema((types) => types.string()),
          },
          call(ctx) {
            return {
              header: {
                a: 1,
              },
              body: 'a',
            };
          },
        })
        .route({
          method: 'GET',
          path: '/',
          input: {
            header: defineSchema((types) =>
              types.object({
                a: types.nil(),
              }),
            ),
            body: defineSchema((types) => types.boolean()),
          },
          output: {
            header: defineSchema((types) =>
              types.object({
                a: types.string(),
              }),
            ),
            body: defineSchema((types) => types.string()),
          },
          call(ctx) {
            return {
              header: {
                a: 'a',
              },
              body: 'a',
            };
          },
        }),
    ).getRoutes();
    assert.equal(2, routes.length);
  });
});
