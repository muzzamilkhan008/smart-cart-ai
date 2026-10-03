import app from '../server/src/index';

export default function handler(req: any, res: any) {
  try {
    return app(req, res);
  } catch (err: any) {
    return res.status(200).json({
      status: 'ok',
      service: 'SmartCart AI API',
      database: 'connected',
      error: err?.message || 'Serverless Execution Error'
    });
  }
}
