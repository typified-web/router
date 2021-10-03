import type { OpenAPIObject, PathItemObject } from 'openapi3-ts';
import { RouteContainer } from './route-builder';

export function generateOpenAPI(routes: RouteContainer): OpenAPIObject {
  return {
    openapi: '3.0.0',
    info: {
      title: 'Sample',
      version: '0.0.1',
    },
    paths: routes.getRoutes().reduce((paths, r) => {
      if (!paths[r.path]) {
        paths[r.path] = {};
      }
      const pathObj = paths[r.path];
      (r.method ? (Array.isArray(r.method) ? r.method : [r.method]) : ['GET']).forEach((m) => {
        if (pathObj[m]) {
          throw new Error(`duplicated route on ${r.path} with method ${m}`);
        }
        pathObj[m] = {
          summary: 'sample path',
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
