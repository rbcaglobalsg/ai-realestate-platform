import { Router, Request, Response } from 'express';

const router = Router();

const PUBLIC_DATA_API_KEY = process.env.PUBLIC_DATA_API_KEY || '';
const VWORLD_API_KEY = process.env.VWORLD_API_KEY || '';

// GET /api/public/transactions — 실거래가 조회
router.get('/transactions', async (req: Request, res: Response) => {
  try {
    const {
      lawdCd,        // 법정동코드 (5자리)
      dealYmd,       // 계약월 (YYYYMM)
      propertyType = 'apt', // apt | rowhouse | detached | officetel
      dealType = 'sale',    // sale | lease | rent
      pageNo = '1',
      numOfRows = '100',
    } = req.query;

    if (!lawdCd || !dealYmd) {
      res.status(400).json({
        success: false,
        error: '법정동코드(lawdCd)와 계약월(dealYmd, YYYYMM)은 필수입니다.',
      });
      return;
    }

    if (!PUBLIC_DATA_API_KEY) {
      res.status(503).json({
        success: false,
        error: '공공데이터포털 API 키가 설정되지 않았습니다.',
      });
      return;
    }

    // Map property type to service name
    const serviceMap: Record<string, string> = {
      'apt': 'RTMSDataSvcAptTrade',
      'rowhouse': 'RTMSDataSvcRHTrade',
      'detached': 'RTMSDataSvcSHTrade',
      'officetel': 'RTMSDataSvcOffiTrade',
      'apt-lease': 'RTMSDataSvcAptRent',
      'rowhouse-lease': 'RTMSDataSvcRHRent',
      'detached-lease': 'RTMSDataSvcSHRent',
      'officetel-lease': 'RTMSDataSvcOffiRent',
    };

    let serviceKey = propertyType as string;
    if (dealType === 'lease' || dealType === 'rent') {
      serviceKey = `${propertyType}-lease`;
    }
    const serviceName = serviceMap[serviceKey] || serviceMap['apt'];

    const url = `http://openapi.molit.go.kr:8081/OpenAPI_ToolInstallPackage/service/rest/RTMSOBJSvc/getRTMSDataSvc${serviceName.slice('RTMSDataSvc'.length)}?` +
      `LAWD_CD=${lawdCd}&DEAL_YMD=${dealYmd}&serviceKey=${encodeURIComponent(PUBLIC_DATA_API_KEY)}` +
      `&pageNo=${pageNo}&numOfRows=${numOfRows}&_type=json`;

    const response = await fetch(url);
    const data = await response.json();

    res.json({ success: true, data });
  } catch (error) {
    console.error('Transaction API error:', error);
    res.status(500).json({ success: false, error: '실거래가 조회 중 오류가 발생했습니다.' });
  }
});

// GET /api/public/building-registry — 건축물대장 조회
router.get('/building-registry', async (req: Request, res: Response) => {
  try {
    const {
      sigunguCd,     // 시군구코드 (5자리)
      bun,           // 번 (4자리)
      ji,            // 지 (4자리, 없으면 '0')
      pageNo = '1',
      numOfRows = '100',
    } = req.query;

    if (!sigunguCd) {
      res.status(400).json({
        success: false,
        error: '시군구코드(sigunguCd)는 필수입니다.',
      });
      return;
    }

    if (!PUBLIC_DATA_API_KEY) {
      res.status(503).json({
        success: false,
        error: '공공데이터포털 API 키가 설정되지 않았습니다.',
      });
      return;
    }

    const url = `http://apis.data.go.kr/1613000/BldRgstService_v2/getBrBasisInfo?` +
      `sigunguCd=${sigunguCd}&bun=${bun || ''}&ji=${ji || ''}` +
      `&serviceKey=${encodeURIComponent(PUBLIC_DATA_API_KEY)}` +
      `&pageNo=${pageNo}&numOfRows=${numOfRows}&_type=json`;

    const response = await fetch(url);
    const data = await response.json();

    res.json({ success: true, data });
  } catch (error) {
    console.error('Building registry API error:', error);
    res.status(500).json({ success: false, error: '건축물대장 조회 중 오류가 발생했습니다.' });
  }
});

// GET /api/public/land-price — 공시지가 조회
router.get('/land-price', async (req: Request, res: Response) => {
  try {
    const {
      pnu,           // 필지고유번호 (19자리)
      stdrYear,      // 기준연도
      pageNo = '1',
      numOfRows = '100',
    } = req.query;

    if (!pnu && !stdrYear) {
      res.status(400).json({
        success: false,
        error: '필지고유번호(pnu) 또는 기준연도(stdrYear) 중 하나는 필수입니다.',
      });
      return;
    }

    if (!PUBLIC_DATA_API_KEY) {
      res.status(503).json({
        success: false,
        error: '공공데이터포털 API 키가 설정되지 않았습니다.',
      });
      return;
    }

    const url = `http://apis.data.go.kr/1613000/IndvdLandPriceService_v2/getIndvdLandPrice?` +
      `pnu=${pnu || ''}&stdrYear=${stdrYear || ''}` +
      `&serviceKey=${encodeURIComponent(PUBLIC_DATA_API_KEY)}` +
      `&pageNo=${pageNo}&numOfRows=${numOfRows}&_type=json`;

    const response = await fetch(url);
    const data = await response.json();

    res.json({ success: true, data });
  } catch (error) {
    console.error('Land price API error:', error);
    res.status(500).json({ success: false, error: '공시지가 조회 중 오류가 발생했습니다.' });
  }
});

// GET /api/public/land-plan — 토지이용계획 조회
router.get('/land-plan', async (req: Request, res: Response) => {
  try {
    const { pnu } = req.query;

    if (!pnu) {
      res.status(400).json({
        success: false,
        error: '필지고유번호(pnu)는 필수입니다.',
      });
      return;
    }

    if (!PUBLIC_DATA_API_KEY) {
      res.status(503).json({
        success: false,
        error: '공공데이터포털 API 키가 설정되지 않았습니다.',
      });
      return;
    }

    const url = `http://apis.data.go.kr/1613000/LandUseService_v2/getLandUseInfo?` +
      `pnu=${pnu}&serviceKey=${encodeURIComponent(PUBLIC_DATA_API_KEY)}&_type=json`;

    const response = await fetch(url);
    const data = await response.json();

    res.json({ success: true, data });
  } catch (error) {
    console.error('Land plan API error:', error);
    res.status(500).json({ success: false, error: '토지이용계획 조회 중 오류가 발생했습니다.' });
  }
});

// GET /api/public/vworld/map — VWorld 지도 WMS/WFS
router.get('/vworld/map', async (req: Request, res: Response) => {
  try {
    const { layer, bbox, width = '800', height = '600' } = req.query;

    if (!VWORLD_API_KEY) {
      res.status(503).json({
        success: false,
        error: 'VWorld API 키가 설정되지 않았습니다.',
      });
      return;
    }

    // VWorld WMS request
    const url = `http://api.vworld.kr/req/wms?` +
      `service=WMS&version=1.1.1&request=GetMap` +
      `&layers=${layer || 'lt_c_plusbase004'}&styles=` +
      `&srs=EPSG:4326&bbox=${bbox || '126.0,33.0,128.0,39.0'}` +
      `&width=${width}&height=${height}&format=image/png` +
      `&apikey=${VWORLD_API_KEY}&transparent=true`;

    const response = await fetch(url);
    const buffer = await response.arrayBuffer();

    res.setHeader('Content-Type', 'image/png');
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('VWorld map API error:', error);
    res.status(500).json({ success: false, error: 'VWorld 지도 조회 중 오류가 발생했습니다.' });
  }
});

export default router;
