import { Router, Request, Response } from 'express';
import { z } from 'zod';

const router = Router();

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || '';
const TOSS_API_BASE = 'https://api.tosspayments.com/v1';

// Plan pricing
const PLAN_CONFIG: Record<string, { price: number; name: string; aiCredits: number }> = {
  free: { price: 0, name: 'Free', aiCredits: 5 },
  starter: { price: 29900, name: 'Starter', aiCredits: 10 },
  pro: { price: 79900, name: 'Pro', aiCredits: -1 }, // unlimited
  business: { price: 199900, name: 'Business', aiCredits: -1 }, // unlimited
};

// GET /api/payments/plans — list available plans
router.get('/plans', (_req: Request, res: Response) => {
  res.json({ success: true, data: PLAN_CONFIG });
});

// POST /api/payments/checkout — create Toss payment checkout
router.post('/checkout', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      plan: z.enum(['starter', 'pro', 'business']),
      orderId: z.string(),
      customerName: z.string(),
      customerEmail: z.string().email(),
    });

    const body = schema.parse(req.body);
    const planConfig = PLAN_CONFIG[body.plan];

    if (!planConfig) {
      res.status(400).json({ success: false, error: '유효하지 않은 플랜입니다.' });
      return;
    }

    if (!TOSS_SECRET_KEY) {
      // Dev mode — skip actual Toss payment
      res.json({
        success: true,
        data: {
          orderId: body.orderId,
          orderName: `AI 부동산 플랫폼 ${planConfig.name} 플랜`,
          amount: planConfig.price,
          status: 'READY',
          devMode: true,
          message: 'Toss Payments 미연동 상태. 개발 모드로 처리됩니다.',
        },
      });
      return;
    }

    const response = await fetch(`${TOSS_API_BASE}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        method: 'CARD',
        orderId: body.orderId,
        amount: planConfig.price,
        orderName: `AI 부동산 플랫폼 ${planConfig.name} 플랜`,
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        successUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success`,
        failUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/fail`,
      }),
    });

    const data = await response.json();
    res.json({ success: true, data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors[0].message });
      return;
    }
    console.error('Checkout error:', error);
    res.status(500).json({ success: false, error: '결제 요청 중 오류가 발생했습니다.' });
  }
});

// POST /api/payments/confirm — confirm Toss payment
router.post('/confirm', async (req: Request, res: Response) => {
  try {
    const { paymentKey, orderId, amount } = req.body;

    if (!paymentKey || !orderId || !amount) {
      res.status(400).json({ success: false, error: '결제 정보가 누락되었습니다.' });
      return;
    }

    if (!TOSS_SECRET_KEY) {
      res.json({ success: true, data: { status: 'DONE', devMode: true } });
      return;
    }

    const response = await fetch(`${TOSS_API_BASE}/payments/${paymentKey}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId, amount }),
    });

    const data = await response.json();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Payment confirm error:', error);
    res.status(500).json({ success: false, error: '결제 승인 중 오류가 발생했습니다.' });
  }
});

export default router;
