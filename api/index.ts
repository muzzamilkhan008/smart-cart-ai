import app from '../server/dist/index';

export default function handler(req: any, res: any) {
  return app(req, res);
}
