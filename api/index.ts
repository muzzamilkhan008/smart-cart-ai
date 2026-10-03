const app = require('../server/dist/index').default || require('../server/dist/index');

module.exports = (req: any, res: any) => {
  return app(req, res);
};
