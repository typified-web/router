import assert from 'assert';
import { defineRoutes, defineSchema } from '../src/route-builder';

describe('RouteBuilder', () => {
  it('should throw no declaration errors', () => {
    const routes = defineRoutes((routes) =>
      routes
        .defineRoute((route) =>
          route
            .schema({
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
            })
            .call((ctx) => {
              return {
                header: {
                  a: 1,
                },
                body: 's',
              };
            }),
        )
        .defineRoute((route) =>
          route
            .schema({
              method: 'GET',
              path: '/',
              input: {
                header: defineSchema((types) =>
                  types.object({
                    a: types.boolean(),
                  }),
                ),
                body: defineSchema((types) => types.string()),
              },
              output: {
                header: defineSchema((types) => types.object({})),
                body: defineSchema((types) =>
                  types.object({
                    a: types.string(),
                  }),
                ),
              },
            })
            .call((ctx) => {
              return {
                header: {
                  a: 1,
                },
                body: {
                  a: 'hack',
                },
              };
            }),
        ),
    ).getRoutes();
    assert.equal(2, routes.length);
  });
});
