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
              output: defineSchema((types) =>
                types.output({
                  status: 200,
                  header: types.object({}),
                  body: types.string(),
                }),
              ),
            })
            .call((ctx) => {
              return {
                status: 200,
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
              output: defineSchema((types) =>
                types.output({
                  status: 200,
                  header: types.object({}),
                  body: types.object({
                    a: types.string(),
                  }),
                }),
              ),
            })
            .call((ctx) => {
              return {
                status: 200,
                header: {},
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
