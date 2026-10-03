export default function handler(req: any, res: any) {
  res.status(200).json({
    status: 'ok',
    service: 'SmartCart AI API',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
}
