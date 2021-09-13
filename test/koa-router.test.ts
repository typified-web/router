import Koa from 'koa';
import http from 'http';
import assert from 'assert';
import { defineRouter } from '../src/koa-router';
import { defineSchema } from '../src/route-builder';

describe('koa-router', function () {
  it('should greet without errors', function (done) {
    this.timeout(200);
    const app = new Koa();
    app.use(
      defineRouter((definer) => {
        definer.route({
          method: 'GET',
          path: '/',
          input: {
            header: defineSchema((types) => types.object({})),
            body: defineSchema((types) => types.nil()),
          },
          output: {
            header: defineSchema((types) =>
              types.object({
                server: types.string(),
              }),
            ),
            body: defineSchema((types) => types.string()),
          },
          call(ctx) {
            return {
              header: {
                server: 'koa',
              },
              body: 'hello',
            };
          },
        });
      }).middleware(),
    );
    const server = app.listen(9420);
    setTimeout(() => {
      http.get('http://localhost:9420', (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          assert.equal(rawData, 'hello');
          server.close();
          done();
        });
      });
    })
  });
});
