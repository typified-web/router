import assert from 'assert';
import { generateOpenAPI } from '../src/api-exporter';
import { defineRoutes, defineSchema } from '../src/route-builder';

describe('api-exporter', () => {
  it('should export sample OpenAPI doc', () => {
    const doc = generateOpenAPI(
      defineRoutes((routes) =>
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
                  types.output.union(
                    types.output({
                      status: 200,
                      header: types.object({
                        a: types.number(),
                      }),
                      body: types.string(),
                    }),
                    types.output({
                      status: 400,
                      header: types.object({
                        a: types.number(),
                      }),
                      body: types.number(),
                    }),
                  ),
                ),
              })
              .call((ctx) => {
                return {
                  status: 200,
                  header: {
                    a: 1,
                  },
                  body: 'a',
                };
              }),
          )
          .defineRoute((route) =>
            route
              .schema({
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
                output: defineSchema((types) =>
                  types.output({
                    status: 200,
                    header: types.object({
                      a: types.string(),
                    }),
                    body: types.string(),
                  }),
                ),
              })
              .call((ctx) => {
                return {
                  status: 200,
                  header: {
                    a: 'a',
                  },
                  body: 'a',
                };
              }),
          ),
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
              responses: {
                '200': { content: { 'application/json': { schema: { type: 'string' } } } },
                '400': { content: { 'application/json': { schema: { type: 'number' } } } },
              },
            },
            POST: {
              summary: 'sample path',
              requestBody: { content: { 'application/json': { schema: { type: 'boolean' } } } },
              responses: {
                '200': { content: { 'application/json': { schema: { type: 'string' } } } },
              },
            },
          },
        },
      },
      doc,
    );
  });
});
