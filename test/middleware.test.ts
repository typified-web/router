import Koa from 'koa';
import http from 'http';
import assert from 'assert';
import { defineMiddleware, defineRouter } from '../src/index';

describe('koa-router', function () {
  it('should greet without errors', function (done) {
    this.timeout(200);
    const app = new Koa();
    app.use(
      defineMiddleware(
        defineRouter((define) => ({
          title: 'Sample',
          routes: [
            define.route({
              method: 'GET',
              path: '/',
              input: define.input((types) => ({
                header: types.object({}),
              })),
              output: define.output((types) => ({
                status: 200,
                header: types.object({
                  server: types.string(),
                }),
                body: types.string(),
              })),
            })(() => {
              return {
                status: 200,
                header: {
                  server: 'koa',
                },
                body: 'hello',
              };
            }),
          ],
        })),
      ),
    );
    const port = 9420;
    const server = app.listen(port);
    setTimeout(() => {
      http.get(`http://localhost:${port}/`, (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          server.close();
          assert.equal(rawData, 'hello');
          done();
        });
      });
    });
  });
});
