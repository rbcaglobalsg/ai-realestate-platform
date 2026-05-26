require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Design endpoint - text to image/3D placeholder
app.post('/api/design', async (req, res) => {
  try {
    const { prompt, type = 'image', model } = req.body;
    
    if (type === 'image') {
      // Call FAL API for image generation
      const falKey = process.env.FAL_API_KEY;
      if (!falKey) {
        return res.status(500).json({ success: false, error: 'FAL API key not configured' });
      }
      
      // Using fast-sdxl model for speed and quality
      const falModel = 'fal-ai/fast-sdxl';
      const falUrl = `https://fal.ai/run/${falModel}`;
      
      const response = await fetch(falUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${falKey}`
        },
        body: JSON.stringify({
          prompt: prompt,
          // Optional parameters
          image_size: { width: 1024, height: 1024 }, // square
          num_inference_steps: 20,
          guidance_scale: 7.5,
          num_images: 1,
          enable_safety_checker: true
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`FAL API error: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      
      // FAL returns images array with url
      const imageUrl = result.images?.[0]?.url;
      
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
          createdAt: new Date().toISOString()
        }
      });
    } else {
      // For non-image types (3D, video, etc.) return placeholder for now
      // In future implementation, integrate respective models
      res.json({
        success: true,
        data: {
          id: `design_${Date.now()}`,
          prompt,
          type,
          model: model || 'default',
          resultUrl: `https://example.com/mock-${type}-${Date.now()}.png`,
          createdAt: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('Design endpoint error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Finance endpoint - business analysis placeholder
app.post('/api/finance', async (req, res) => {
  try {
    const { landCost, constructionCost, expectedSalePrice, loanRate, loanTerm } = req.body;
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
          monthlyPayment: 0 // placeholder
        },
        analysisDate: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Finance endpoint error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Marketing endpoint - content generation placeholder
app.post('/api/marketing', async (req, res) => {
  try {
    const { projectName, description, targetAudience } = req.body;
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
            'flexible financing options available'
          ],
          callToAction: '지금바로투자상담을신청하세요',
          socialMediaSnippets: {
            twitter: `Check out ${projectName}! Amazing opportunity. #RealEstate #Investment`,
            instagram: `Discover ${projectName} - where luxury meets value. ✨`
          }
        },
        createdAt: new Date().toISOString()
      }
    );
  } catch (error) {
    console.error('Marketing endpoint error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Compliance endpoint - regulatory check placeholder
app.post('/api/compliance', async (req, res) => {
  try {
    const { location, projectType, landArea, buildingHeight } = req.body;
    // Mock compliance checks
    const checks = [
      { id: 'zoning', name: '용도지역 확인', status: 'pass', description: '해당 지역의 용도지역이 프로젝트 유형과 일치합니다.' },
      { id: 'height', name: '건물 높이 제한', status: buildingHeight && buildingHeight > 30 ? 'warning' : 'pass', description: `건물 높이가 ${buildingHeight || 0}m로, 지역 제한 ${buildingHeight && buildingHeight > 30 ? '을 초과하여' : '을 준수합니다'}.` },
      { id: 'setback', name: '이격거리 기준', status: 'pass', description: '건물 간 이격거리가 법적 기준을 충족합니다.' },
      { id: 'env', name: '환경영향평가', status: 'info', description: '소규모 프로젝트로 환경영향평가는 면제 대상입니다.' }
    ];
    
    const allPass = checks.every(c => c.status === 'pass' || c.status === 'info');
    
    res.json({
      success: true,
      data: {
        location,
        projectType,
        landArea,
        buildingHeight,
        complianceChecks: checks,
        overallStatus: allPass ? 'pass' : 'warning',
        summary: allPass ? '모든 기본 규제 요건을 충족합니다.' : '일부 항목에서 검토가 필요합니다.',
        checkedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Compliance endpoint error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
