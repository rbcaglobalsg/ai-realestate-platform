import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../db/index';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { generateToken } from '../middleware/auth';

const router = Router();

const registerSchema = z.object({
  email: z.string().email('유효한 이메일을 입력하세요'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다'),
  name: z.string().min(2, '이름은 2자 이상이어야 합니다'),
  phone: z.string().optional(),
  company: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const body = registerSchema.parse(req.body);
    
    // Check existing user
    const existing = await db.select().from(users).where(eq(users.email, body.email)).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ success: false, error: '이미 가입된 이메일입니다.' });
      return;
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    const [newUser] = await db.insert(users).values({
      email: body.email,
      passwordHash,
      name: body.name,
      phone: body.phone || null,
      company: body.company || null,
      plan: 'free',
      aiCreditsUsed: 0,
      aiCreditsLimit: 5,
    }).returning();

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      plan: newUser.plan,
    });

    res.status(201).json({
      success: true,
      data: {
        user: { id: newUser.id, email: newUser.email, name: newUser.name, plan: newUser.plan },
        token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors[0].message });
      return;
    }
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: '회원가입 중 오류가 발생했습니다.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const body = loginSchema.parse(req.body);

    const [user] = await db.select().from(users).where(eq(users.email, body.email)).limit(1);
    if (!user) {
      res.status(401).json({ success: false, error: '이메일 또는 비밀번호가 일치하지 않습니다.' });
      return;
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ success: false, error: '이메일 또는 비밀번호가 일치하지 않습니다.' });
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      plan: user.plan,
    });

    res.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name, plan: user.plan },
        token,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors[0].message });
      return;
    }
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: '로그인 중 오류가 발생했습니다.' });
  }
});

export default router;
