import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import { fal } from '@fal-ai/client';

const app = express();
const PORT = process.env.PORT || 3001;

// Configure FAL client
fal.config({ credentials: process.env.FAL_API_KEY });

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Health check (api prefix)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Types for API requests
interface DesignRequest {
  prompt: string;
  type?: 'image' | '3d' | 'video';
  model?: string;
}

interface FinanceRequest {
  landCost?: number;
  constructionCost?: number;
  expectedSalePrice?: number;
  loanRate?: number;
  loanTerm?: number;
}

interface MarketingRequest {
  projectName: string;
  description?: string;
  targetAudience?: string;
}

interface ComplianceRequest {
  location?: string;
  projectType?: string;
  landArea?: number;
  buildingHeight?: number;
}

interface FalImageResult {
  data?: {
    images?: Array<{ url: string }>;
  };
}

// Design endpoint - text to image/3D placeholder
app.post('/api/design', async (req: Request, res: Response) => {
  try {
    const { prompt, type = 'image', model } = req.body as DesignRequest;

    if (type === 'image') {
      // Call FAL API for image generation
      const falModel = 'fal-ai/fast-sdxl';

      const result = await fal.subscribe(falModel, {
        input: {
          prompt: prompt,
          image_size: { width: 1024, height: 1024 },
          num_inference_steps: 20,
          guidance_scale: 7.5,
          num_images: 1,
          enable_safety_checker: true,
        },
        logs: true,
      }) as FalImageResult;

      const imageUrl = result.data?.images?.[0]?.url;

      if (!imageUrl) {
        throw new Error('No image URL returned from FAL API');
      }

      res.json({
        success: true,
        data: {
          id: `design_${Date.now()}`,
          prompt,
          type,
          model: falModel,
          resultUrl: imageUrl,
          createdAt: new Date().toISOString(),
        },
      });
    } else {
      // For non-image types (3D, video, etc.) return placeholder for now
      res.json({
        success: true,
        data: {
          id: `design_${Date.now()}`,
          prompt,
          type,
          model: model || 'default',
          resultUrl: `https://example.com/mock-${type}-${Date.now()}.png`,
          createdAt: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    const err = error as Error;
    console.error('Design endpoint error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Finance endpoint - business analysis placeholder
app.post('/api/finance', async (req: Request, res: Response) => {
  try {
    const { landCost, constructionCost, expectedSalePrice, loanRate, loanTerm } =
      req.body as FinanceRequest;
    // Simple calculations for demonstration
    const totalCost = (landCost || 0) + (constructionCost || 0);
    const profit = (expectedSalePrice || 0) - totalCost;
    const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;

    res.json({
      success: true,
      data: {
        landCost: landCost || 0,
        constructionCost: constructionCost || 0,
        totalCost,
        expectedSalePrice: expectedSalePrice || 0,
        profit,
        roi: parseFloat(roi.toFixed(2)),
        loanDetails: {
          loanRate: loanRate || 0,
          loanTerm: loanTerm || 0,
          monthlyPayment: 0, // placeholder
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

// Marketing endpoint - content generation placeholder
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
          callToAction: '지금바로투자상담을신청하세요',
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

// Compliance endpoint - regulatory check placeholder
app.post('/api/compliance', async (req: Request, res: Response) => {
  try {
    const { location, projectType, landArea, buildingHeight } = req.body as ComplianceRequest;
    // Mock compliance checks
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
