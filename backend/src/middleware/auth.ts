import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ai-realestate-platform-secret-key-2026';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
  userPlan?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: '인증이 필요합니다.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      plan: string;
    };
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userPlan = decoded.plan;
    next();
  } catch {
    res.status(401).json({ success: false, error: '유효하지 않은 토큰입니다.' });
  }
}

export function generateToken(payload: { userId: string; email: string; plan: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Plan-based credit check
export function checkAiCredit(plan: string, creditsUsed: number, creditsLimit: number): boolean {
  if (plan === 'pro' || plan === 'business') return true; // unlimited
  return creditsUsed < creditsLimit;
}
