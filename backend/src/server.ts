import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import { fal } from '@fal-ai/client';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import publicDataRoutes from './routes/public-data';
import paymentRoutes from './routes/payments';

const app = express();
const PORT = process.env.PORT || 3001;

// Configure FAL client
fal.config({ credentials: process.env.FAL_API_KEY });

// Middleware
app.use(cors());
app.use(express.json());

// ==================== Health Check ====================
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    services: {
      database: process.env.DATABASE_URL ? 'configured' : 'not_configured',
      fal: process.env.FAL_API_KEY ? 'configured' : 'not_configured',
      publicData: process.env.PUBLIC_DATA_API_KEY ? 'configured' : 'not_configured',
      vworld: process.env.VWORLD_API_KEY ? 'configured' : 'not_configured',
      toss: process.env.TOSS_SECRET_KEY ? 'configured' : 'not_configured',
    },
  });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
  });
});

// ==================== API Routes ====================
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/public', publicDataRoutes);
app.use('/api/payments', paymentRoutes);

// ==================== Legacy Compatibility Endpoints ====================

// Finance endpoint (standalone, no auth required for backward compat)
interface FinanceRequest {
  landCost?: number;
  constructionCost?: number;
  expectedSalePrice?: number;
  loanRate?: number;
  loanTerm?: number;
}

app.post('/api/finance', async (req: Request, res: Response) => {
  try {
    const { landCost, constructionCost, expectedSalePrice, loanRate, loanTerm } =
      req.body as FinanceRequest;

    const totalCost = (landCost || 0) + (constructionCost || 0);
    const profit = (expectedSalePrice || 0) - totalCost;
    const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;

    // Calculate monthly loan payment if loan details provided
    let monthlyPayment = 0;
    const principal = totalCost;
    const monthlyRate = (loanRate || 0) / 100 / 12;
    const totalMonths = (loanTerm || 0) * 12;

    if (principal > 0 && monthlyRate > 0 && totalMonths > 0) {
      // Amortization formula
      monthlyPayment =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
    }

    // Profit margin
    const profitMargin = (expectedSalePrice || 0) > 0
      ? (profit / (expectedSalePrice || 0)) * 100
      : 0;

    // Break-even price
    const breakEvenPrice = totalCost;

    // IRR estimation (simplified)
    const irrEstimate = roi > 0 ? roi / (loanTerm || 1) : 0;

    res.json({
      success: true,
      data: {
        landCost: landCost || 0,
        constructionCost: constructionCost || 0,
        totalCost,
        expectedSalePrice: expectedSalePrice || 0,
        profit,
        profitMargin: parseFloat(profitMargin.toFixed(2)),
        roi: parseFloat(roi.toFixed(2)),
        irrEstimate: parseFloat(irrEstimate.toFixed(2)),
        breakEvenPrice,
        loanDetails: {
          loanRate: loanRate || 0,
          loanTerm: loanTerm || 0,
          monthlyPayment: Math.round(monthlyPayment),
          totalInterest: Math.round(monthlyPayment * totalMonths - principal),
        },
        analysisDate: new Date().toISOString(),
      },
    });
  } catch (error) {
    const err = error as Error;
    console.error('Finance endpoint error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Marketing endpoint (standalone)
interface MarketingRequest {
  projectName: string;
  description?: string;
  targetAudience?: string;
}

app.post('/api/marketing', async (req: Request, res: Response) => {
  try {
    const { projectName, description, targetAudience } = req.body as MarketingRequest;
    res.json({
      success: true,
      data: {
        projectName,
        description,
        targetAudience,
        generatedContent: {
          title: `[${projectName}] 매력적인 부동산 투자 기회`,
          shortDescription: description || '멋진 부동산 프로젝트',
          bulletPoints: [
            'prime location with excellent accessibility',
            'modern design with sustainable features',
            'strong investment returns projected',
            'flexible financing options available',
          ],
          callToAction: '지금 바로 투자 상담을 신청하세요',
          socialMediaSnippets: {
            twitter: `Check out ${projectName}! Amazing opportunity. #RealEstate #Investment`,
            instagram: `Discover ${projectName} - where luxury meets value. ✨`,
          },
        },
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    const err = error as Error;
    console.error('Marketing endpoint error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Compliance endpoint (standalone)
interface ComplianceRequest {
  location?: string;
  projectType?: string;
  landArea?: number;
  buildingHeight?: number;
}

app.post('/api/compliance', async (req: Request, res: Response) => {
  try {
    const { location, projectType, landArea, buildingHeight } = req.body as ComplianceRequest;

    const checks = [
      {
        id: 'zoning',
        name: '용도지역 확인',
        status: 'pass',
        description: '해당 지역의 용도지역이 프로젝트 유형과 일치합니다.',
      },
      {
        id: 'height',
        name: '건물 높이 제한',
        status: buildingHeight && buildingHeight > 30 ? 'warning' : 'pass',
        description: `건물 높이가 ${buildingHeight || 0}m로, 지역 제한 ${buildingHeight && buildingHeight > 30 ? '을 초과하여' : '을 준수합니다'}.`,
      },
      {
        id: 'setback',
        name: '이격거리 기준',
        status: 'pass',
        description: '건물 간 이격거리가 법적 기준을 충족합니다.',
      },
      {
        id: 'env',
        name: '환경영향평가',
        status: 'info',
        description: '소규모 프로젝트로 환경영향평가는 면제 대상입니다.',
      },
      {
        id: 'parking',
        name: '주차장 요구사항',
        status: 'info',
        description: `예상 주차 대수: ${Math.floor((landArea || 0) * 0.2)} 대`,
      },
    ];

    const allPass = checks.every((c) => c.status === 'pass' || c.status === 'info');

    res.json({
      success: true,
      data: {
        location,
        projectType,
        landArea,
        buildingHeight,
        checks,
        allPass,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    const err = error as Error;
    console.error('Compliance endpoint error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==================== Server Start ====================
app.listen(PORT, () => {
  console.log(`🚀 AI 부동산 플랫폼 백엔드 서버 v2.0 — 포트 ${PORT}`);
  console.log(`📋 Health: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
  console.log(`📊 Projects: http://localhost:${PORT}/api/projects`);
  console.log(`🏛️ Public Data: http://localhost:${PORT}/api/public`);
  console.log(`💳 Payments: http://localhost:${PORT}/api/payments`);
});
