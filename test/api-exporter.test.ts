import assert from 'assert';
import { defineRouter, exportOpenAPI } from '../src/index';

describe('api-exporter', () => {
  it('should export multiple routes in OpenAPI doc', () => {
    const doc = exportOpenAPI(
      defineRouter((define) => ({
        routes: [
          define.route({
            method: 'GET',
            path: '/',
            input: define.input((types) => ({
              header: types.object({
                a: types.boolean(),
              }),
              body: types.boolean(),
            })),
            output: define.output((types) => ({
              header: types.object({
                a: types.number(),
              }),
              body: types.string(),
            })),
          })(() => {
            return {
              status: 200,
              header: {
                a: 1,
              },
              body: 'a',
            };
          }),
          define.route({
            method: 'POST',
            path: '/',
            input: define.input((types) => ({
              header: types.object({
                a: types.nil(),
              }),
              body: types.boolean(),
            })),
            output: define.output((types) => ({
              status: 200,
              header: types.object({
                a: types.string(),
              }),
              body: types.string(),
            })),
          })(() => {
            return {
              status: 200,
              header: {
                a: 'a',
              },
              body: 'a',
            };
          }),
        ],
      })),
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
                200: { content: { 'application/json': { schema: { type: 'string' } } } },
              },
            },
            POST: {
              summary: 'sample path',
              requestBody: { content: { 'application/json': { schema: { type: 'boolean' } } } },
              responses: {
                200: { content: { 'application/json': { schema: { type: 'string' } } } },
              },
            },
          },
        },
      },
      doc,
    );
  });

  it('should export multiple responses in OpenAPI doc', () => {
    const doc = exportOpenAPI(
      defineRouter((define) => ({
        routes: [
          define.route({
            method: 'GET',
            path: '/',
            input: define.input((types) => ({
              header: types.object({
                a: types.boolean(),
              }),
              body: types.boolean(),
            })),
            output: define.output.union(
              define.output((types) => ({
                status: 200,
                header: types.object({
                  a: types.number(),
                }),
                body: types.string(),
              })),
              define.output((types) => ({
                status: 400,
                header: types.object({
                  a: types.number(),
                }),
                body: types.number(),
              })),
            ),
          })(() => {
            return {
              status: 200,
              header: {
                a: 1,
              },
              body: 'a',
            };
          }),
        ],
      })),
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
                200: { content: { 'application/json': { schema: { type: 'string' } } } },
                400: { content: { 'application/json': { schema: { type: 'number' } } } },
              },
            },
          },
        },
      },
      doc,
    );
  });
});
