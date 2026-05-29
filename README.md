# 🏠 AI 부동산 플랫폼

공공데이터(실거래가, 건축물대장)와 VWorld(토지/건물) 데이터를 자동 수집하여 부동산 시장 인사이트를 제공하는 AI 기반 부동산 분석 플랫폼입니다.

## 🎯 프로젝트 비전

- **데이터 기반 부동산 분석**: 공공데이터 + VWorld 데이터 자동 수집 → 실거래가 트렌드, 건축물 정보 제공
- **AI 시장 예측**: 수집 데이터 기반 부동산 시장 트렌드 분석 및 예측
- **지도 기반 매물 탐색**: 네이버 지도 위 매물 마커 → 클릭 시 상세 모달
- **사용자 친화적 대시보드**: 직관적인 UI로 복잡한 데이터를 쉽게 이해

## 🛠 기술 스택

| 영역 | 기술 | 용도 |
|------|------|------|
| 프론트엔드 | React 19 + Vite | 빠른 개발 및 HMR |
| | React Router 7 | SPA 라우팅 |
| | Tailwind CSS 4 | 유틸리티 퍼스트 스타일링 |
| | 네이버 지도 API | 지도 기반 매물 탐색 |
| | Axios | HTTP 클라이언트 (JWT 자동 첨부) |
| 백엔드 | Node.js + Express | REST API 서버 |
| | PostgreSQL 16 | 관계형 데이터베이스 |
| | JWT + bcryptjs | 인증/인가 |
| | pg | PostgreSQL 클라이언트 |
| 인프라 | Docker Compose | PostgreSQL + Adminer |
| | Python 3.11 | 데이터 크롤러 |
| | pandas | 데이터 처리 및 CSV 저장 |
| | GitHub Actions | 주간 자동 크롤링 |

## 📁 디렉터리 구조

```
ai-realestate-platform/
├── docker-compose.yml              # PostgreSQL + Adminer
├── .github/workflows/
│   └── crawl-weekly.yml            # 주간 자동 크롤링
├── backend/
│   ├── server.js                   # Express 서버 (/health, /api/auth, /api/properties)
│   ├── db.js                       # PostgreSQL 연결 풀
│   ├── db/init.sql                  # DB 스키마 + 시드 데이터
│   ├── middleware/auth.js           # JWT 인증 미들웨어
│   ├── routes/auth.js              # 로그인/회원가입 엔드포인트
│   ├── routes/properties.js         # 매물 조회 엔드포인트
│   ├── .env.example                # 백엔드 환경변수 예시
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  # 라우트 정의
│   │   ├── main.jsx                 # 진입점
│   │   ├── api/client.js            # Axios 인스턴스 (JWT 자동 첨부)
│   │   ├── components/
│   │   │   ├── Layout.jsx           # Header + Footer 레이아웃
│   │   │   └── PropertyModal.jsx    # 매물 상세 모달
│   │   └── pages/
│   │       ├── HomePage.jsx         # 랜딩 페이지
│   │       ├── LoginPage.jsx        # 로그인
│   │       ├── SignupPage.jsx       # 회원가입
│   │       ├── MapPage.jsx          # 네이버 지도 + 매물 마커
│   │       └── PropertyDetailPage.jsx  # 매물 상세 페이지
│   ├── .env.example                # 프론트엔드 환경변수 예시
│   └── package.json
├── infra/
│   ├── crawlers/
│   │   ├── public_data.py          # 공공데이터 API 크롤러 (실거래가, 건축물대장)
│   │   └── vworld_csv.py           # VWorld CSV 크롤러 (토지/건물)
│   ├── github-actions/
│   │   └── crawl-weekly.yml        # 참조용 워크플로우
│   └── requirements.txt            # Python 의존성
└── data/
    └── raw/                        # 수집 CSV (Git 추적 제외)
```

## 🔑 환경변수

### 백엔드 (`backend/.env`)

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=realestate
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your_jwt_secret_here
PORT=3001
PUBLIC_DATA_API_KEY=your_public_data_api_key
VWORLD_API_KEY=your_vworld_api_key
```

### 프론트엔드 (`frontend/.env`)

```env
VITE_NAVER_MAP_CLIENT_ID=your_naver_map_client_id
VITE_API_URL=http://localhost:3001
```

### API 키 발급처

| 환경변수 | 발급처 | 용도 |
|----------|--------|------|
| `PUBLIC_DATA_API_KEY` | [data.go.kr](https://www.data.go.kr) | 실거래가, 건축물대장 |
| `VWORLD_API_KEY` | [vworld.kr](https://www.vworld.kr) | 토지/건물 데이터 |
| `VITE_NAVER_MAP_CLIENT_ID` | [Naver Cloud Platform](https://www.ncloud.com) | 네이버 지도 |

## 🚀 실행 방법

### 1. 클론 & 환경변수 설정

```bash
git clone https://github.com/rbcaglobalsg/ai-realestate-platform.git
cd ai-realestate-platform

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# 각 .env 파일에 API 키 입력
```

### 2. Docker로 DB 실행

```bash
docker compose up -d
# PostgreSQL: localhost:5432 / Adminer: http://localhost:8080
```

### 3. 백엔드 실행

```bash
cd backend
npm install
node server.js
# 서버: http://localhost:3001/health
```

### 4. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
# 앱: http://localhost:5173
```

### 5. 데이터 크롤러 (수동)

```bash
pip install -r infra/requirements.txt
python infra/crawlers/public_data.py --type all --year 2025
python infra/crawlers/vworld_csv.py --type all --year 2025
```

## 📡 API 엔드포인트

| 메서드 | 경로 | 인증 | 설명 |
|--------|------|------|------|
| `GET` | `/health` | ❌ | 서버 + DB 상태 확인 |
| `POST` | `/api/auth/signup` | ❌ | 회원가입 (email, password, name) |
| `POST` | `/api/auth/login` | ❌ | 로그인 → JWT 반환 |
| `GET` | `/api/properties` | ✅ | 매물 목록 조회 |
| `GET` | `/api/properties/:id` | ✅ | 매물 상세 조회 |

## 📅 자동 크롤링

GitHub Actions로 **매주 월요일 09:00 KST** 공공데이터 + VWorld 데이터 자동 수집 → `data/raw/`에 CSV 커밋

- 워크플로우: `.github/workflows/crawl-weekly.yml`
- GitHub Secrets에 `PUBLIC_DATA_API_KEY`, `VWORLD_API_KEY` 등록 필요

## 📜 라이선스

Private Repository — RBCA Global Pte. Ltd.
