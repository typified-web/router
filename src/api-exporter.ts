import type { OpenAPIObject, PathItemObject } from 'openapi3-ts';
import { Router } from './router';

/**
 * Export OpenAPI doc of given router.
 *
 * @param router the router to export.
 * @returns the OpenAPI doc.
 */
export function exportOpenAPI(router: Router): OpenAPIObject {
  return {
    openapi: '3.0.0',
    info: {
      title: router.title,
      version: router.version ?? '0.0.1',
    },
    paths: router.routes.reduce((paths, r) => {
      if (!paths[r.path]) {
        paths[r.path] = {};
      }
      const pathObj = paths[r.path];
      (r.method ? (Array.isArray(r.method) ? r.method : [r.method]) : ['GET']).forEach((m) => {
        if (pathObj[m]) {
          throw new Error(`duplicated route on ${r.path} with method ${m}`);
        }
        pathObj[m] = {
          summary: r.summary ?? '',
          requestBody: {
            content: {
              'application/json': {
                schema: r.input.body.schema,
              },
            },
          },
          responses: r.output.schema,
        };
      });
      return paths;
    }, {} as Record<string, PathItemObject>),
  };
}
