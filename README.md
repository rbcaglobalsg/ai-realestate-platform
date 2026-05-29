# 🏠 AI 부동산 플랫폼

AI 기반 부동산 분석 및 시장 예측 플랫폼입니다. 공공데이터와 VWorld 데이터를 자동 수집하여 부동산 시장 인사이트를 제공합니다.

## 🎯 프로젝트 비전

- **데이터 기반 부동산 분석**: 공공데이터(실거래가, 건축물대장)와 VWorld(토지/건물) 데이터를 자동 수집
- **AI 시장 예측**: 수집된 데이터를 기반으로 부동산 시장 트렌드 분석 및 예측
- **사용자 친화적 대시보드**: 직관적인 프론트엔드로 복잡한 데이터를 쉽게 이해

## 🛠 기술 스택

### 프론트엔드
- **React** + **Vite** — 빠른 개발 및 HMR
- **React Router** — SPA 라우팅

### 백엔드
- **Node.js** + **Express** — REST API 서버
- **FAL AI** — AI 모델 연동

### 인프라 / 데이터 파이프라인
- **Python 3.10+** — 데이터 크롤러
- **requests** — HTTP 요청
- **BeautifulSoup4** — HTML 파싱
- **pandas** — 데이터 처리 및 CSV 저장
- **python-dotenv** — 환경변수 관리
- **GitHub Actions** — 주간 자동 크롤링 워크플로우

## 📁 디렉터리 구조

```
ai-realestate-platform/
├── README.md                       # 프로젝트 문서
├── .gitignore                      # Git 제외 파일
├── .env                            # 환경변수 (Git 추적 제외)
├── frontend/                       # React 프론트엔드
│   ├── src/
│   │   ├── App.jsx                 # 루트 컴포넌트
│   │   ├── main.jsx                # 진입점
│   │   ├── Dashboard.jsx           # 대시보드 페이지
│   │   ├── NewProject.jsx          # 신규 프로젝트 페이지
│   │   └── ProjectDetail.jsx       # 프로젝트 상세 페이지
│   ├── vite.config.js
│   └── package.json
├── backend/                        # Express 백엔드
│   ├── server.js                   # API 서버
│   └── package.json
├── infra/                          # 인프라 및 데이터 파이프라인
│   ├── crawlers/                   # 데이터 크롤러
│   │   ├── public_data.py          # 공공데이터 API 크롤러
│   │   └── vworld_csv.py           # VWorld CSV 크롤러
│   ├── github-actions/             # GitHub Actions 워크플로우
│   │   └── crawl-weekly.yml        # 주간 크롤링 워크플로우
│   └── requirements.txt            # Python 의존성
└── data/                           # 수집된 데이터 (Git 추적 제외)
    └── raw/                        # 원본 CSV 파일
```

## 🔑 환경변수

프로젝트 루트에 `.env` 파일을 생성하세요:

```env
# 공공데이터 API 키 (data.go.kr 발급)
PUBLIC_DATA_API_KEY=your_public_data_api_key_here

# VWorld API 키 (vworld.kr 발급)
VWORLD_API_KEY=your_vworld_api_key_here

# FAL AI API 키
FAL_API_KEY=your_fal_api_key_here
```

### API 키 발급 방법

| 환경변수 | 발급처 | 용도 |
|----------|--------|------|
| `PUBLIC_DATA_API_KEY` | [data.go.kr](https://www.data.go.kr) | 실거래가, 건축물대장 조회 |
| `VWORLD_API_KEY` | [vworld.kr](https://www.vworld.kr) | 토지/건물 데이터 다운로드 |
| `FAL_API_KEY` | [fal.ai](https://fal.ai) | AI 모델 호출 |

## 🚀 실행 방법

### 1. 저장소 클론

```bash
git clone https://github.com/your-org/ai-realestate-platform.git
cd ai-realestate-platform
```

### 2. 환경변수 설정

```bash
cp .env.example .env
# .env 파일을 열어 API 키 입력
```

### 3. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

### 4. 백엔드 실행

```bash
cd backend
npm install
node server.js
```

### 5. 데이터 크롤러 실행 (수동)

```bash
cd infra
pip install -r requirements.txt

# 공공데이터 크롤링
python crawlers/public_data.py

# VWorld 데이터 크롤링
python crawlers/vworld_csv.py
```

## 📡 API 엔드포인트 목록

### 백엔드 API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/health` | 서버 상태 확인 |
| `GET` | `/api/projects` | 프로젝트 목록 조회 |
| `POST` | `/api/projects` | 신규 프로젝트 생성 |
| `GET` | `/api/projects/:id` | 프로젝트 상세 조회 |
| `DELETE` | `/api/projects/:id` | 프로젝트 삭제 |

### 외부 데이터 API

| API | 설명 |
|-----|------|
| 국토교통부 실거래가 API | 아파트/단독다가구/연립다세대 매매 실거래가 |
| 건축물대장 API | 건축물 정보 및 대장 데이터 |
| VWorld 데이터 API | 월간 토지/건물 데이터 CSV |

## 📅 자동 크롤링

GitHub Actions를 통해 매주 월요일 09:00 KST에 공공데이터와 VWorld 데이터를 자동 수집합니다.

- 워크플로우 파일: `.github/workflows/crawl-weekly.yml`
- 수집 결과는 `data/` 디렉터리에 CSV로 자동 커밋됩니다

## 📜 라이선스

Private Repository — 사내 프로젝트
