import { Router, Response } from 'express';
import { db } from '../db/index';
import { projects, designs } from '../db/schema';
import { AuthRequest, authMiddleware, checkAiCredit } from '../middleware/auth';
import { eq, and, desc } from 'drizzle-orm';
import { fal } from '@fal-ai/client';
import { z } from 'zod';

const router = Router();

// All project routes require auth
router.use(authMiddleware);

const createProjectSchema = z.object({
  name: z.string().min(1, '프로젝트 이름을 입력하세요'),
  description: z.string().optional(),
  location: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  landArea: z.string().optional(),
  buildingHeight: z.string().optional(),
  expectedFloors: z.number().int().optional(),
  landCost: z.number().optional(),
  constructionCost: z.number().optional(),
  expectedSalePrice: z.number().optional(),
  loanRate: z.string().optional(),
  loanTerm: z.number().int().optional(),
});

// GET /api/projects — list user's projects
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, req.userId!))
      .orderBy(desc(projects.createdAt));

    res.json({ success: true, data: userProjects });
  } catch (error) {
    console.error('List projects error:', error);
    res.status(500).json({ success: false, error: '프로젝트 목록 조회 중 오류가 발생했습니다.' });
  }
});

// POST /api/projects — create project
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const body = createProjectSchema.parse(req.body);
    const [newProject] = await db.insert(projects).values({
      userId: req.userId!,
      name: body.name,
      description: body.description || null,
      location: body.location || null,
      latitude: body.latitude || null,
      longitude: body.longitude || null,
      landArea: body.landArea || null,
      buildingHeight: body.buildingHeight || null,
      expectedFloors: body.expectedFloors || null,
      landCost: body.landCost || null,
      constructionCost: body.constructionCost || null,
      expectedSalePrice: body.expectedSalePrice || null,
      loanRate: body.loanRate || null,
      loanTerm: body.loanTerm || null,
      status: 'planning',
    }).returning();

    res.status(201).json({ success: true, data: newProject });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.errors[0].message });
      return;
    }
    console.error('Create project error:', error);
    res.status(500).json({ success: false, error: '프로젝트 생성 중 오류가 발생했습니다.' });
  }
});

// GET /api/projects/:id — get project detail
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, req.params.id), eq(projects.userId, req.userId!)))
      .limit(1);

    if (!project) {
      res.status(404).json({ success: false, error: '프로젝트를 찾을 수 없습니다.' });
      return;
    }

    // Also fetch designs for this project
    const projectDesigns = await db
      .select()
      .from(designs)
      .where(eq(designs.projectId, project.id))
      .orderBy(desc(designs.createdAt));

    res.json({ success: true, data: { ...project, designs: projectDesigns } });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ success: false, error: '프로젝트 조회 중 오류가 발생했습니다.' });
  }
});

// POST /api/projects/:id/design — generate AI design
router.post('/:id/design', async (req: AuthRequest, res: Response) => {
  try {
    const { prompt, type = 'image' } = req.body;
    if (!prompt) {
      res.status(400).json({ success: false, error: '프롬프트를 입력하세요.' });
      return;
    }

    // Check AI credits
    const [user] = await db.select().from(users).where(eq(users.id, req.userId!)).limit(1);
    if (user && !checkAiCredit(user.plan, user.aiCreditsUsed, user.aiCreditsLimit)) {
      res.status(403).json({
        success: false,
        error: 'AI 크레딧이 소진되었습니다. 플랜을 업그레이드하세요.',
        upgradeRequired: true,
      });
      return;
    }

    const falModel = 'fal-ai/fast-sdxl';
    const result = await fal.subscribe(falModel, {
      input: {
        prompt,
        image_size: { width: 1024, height: 1024 },
        num_inference_steps: 20,
        guidance_scale: 7.5,
        num_images: 1,
        enable_safety_checker: true,
      },
      logs: true,
    }) as any;

    const imageUrl = result.data?.images?.[0]?.url;
    if (!imageUrl) {
      throw new Error('FAL API에서 이미지 URL을 받지 못했습니다.');
    }

    // Save design
    const [newDesign] = await db.insert(designs).values({
      projectId: req.params.id,
      userId: req.userId!,
      prompt,
      type,
      model: falModel,
      resultUrl: imageUrl,
    }).returning();

    // Increment AI credit usage
    if (user) {
      await db.update(users)
        .set({ aiCreditsUsed: user.aiCreditsUsed + 1 })
        .where(eq(users.id, user.id));
    }

    res.json({ success: true, data: newDesign });
  } catch (error) {
    const err = error as Error;
    console.error('Design generation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Import users schema for credit check
import { users } from '../db/schema';

export default router;
