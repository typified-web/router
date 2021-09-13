import assert from 'assert';
import { generateOpenAPI } from '../src/api-exporter';
import { defineRoutes, defineSchema } from '../src/route-builder';

describe('api-exporter', () => {
  it('should export sample OpenAPI doc', () => {
    const doc = generateOpenAPI(
      defineRoutes((routes) =>
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
            method: 'POST',
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
      ),
    );
    assert.equal(doc.openapi, '3.0.0');
    assert.equal(Object.keys(doc.paths['/']).length, 2);
  });
});
