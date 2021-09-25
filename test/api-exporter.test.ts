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
    assert.deepEqual(
      {
        openapi: '3.0.0',
        info: { title: 'Sample', version: '0.0.1' },
        paths: {
          '/': {
            GET: {
              summary: 'sample path',
              requestBody: { content: { 'application/json': { schema: { type: 'boolean' } } } },
              responses: { '200': { content: { 'application/json': { schema: { type: 'string' } } } } },
            },
            POST: {
              summary: 'sample path',
              requestBody: { content: { 'application/json': { schema: { type: 'boolean' } } } },
              responses: { '200': { content: { 'application/json': { schema: { type: 'string' } } } } },
            },
          },
        },
      },
      doc,
    );
  });
});
