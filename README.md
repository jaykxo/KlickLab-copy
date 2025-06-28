# klickLab

> 클릭스트림 기반 데이터 수집 및 분석 플랫폼  
> 웹 사용자 행동 데이터를 실시간으로 수집하고, 분석 대시보드로 시각화합니다.

## 🔍 소개

**klickLab**은 웹사이트나 웹앱에 방문한 사용자의 클릭, 페이지 이동, 폼 입력 등의 행동 데이터를 수집하여,  
이를 기반으로 사용자 경험(UX) 개선에 도움이 되는 인사이트를 제공하는 플랫폼입니다.

### 주요 특징

- ✅ SDK 삽입만으로 간편한 이벤트 수집
- 📊 클릭스트림 데이터 기반 실시간 분석
- 🧩 커스텀 이벤트 속성 설정
- 📁 MySQL/PostgreSQL 등 관계형 DB 연동
- ⚡ React 기반 분석 대시보드 제공

## 🛠️ 기술 스택

| 구분 | 스택 |
|------|------|
| 프론트엔드 | React, TypeScript, Chart.js / Recharts |
| 백엔드 | Node.js (Express) |
| 데이터베이스 | PostgreSQL |
| 이벤트 전송 | Axios / Beacon API |
| 데이터 수집 방식 | REST API, SDK 삽입, HTML 속성 기반 자동 트래킹 |
| 배포 | AWS EC2, RDS, S3, CloudFront 등 |

## ⚙️ 설치 및 실행

### 1. 레포지토리 클론

```bash
git clone https://github.com/your-org/klickLab.git
cd klickLab
```

### 2. 백엔드 설치

```bash
cd backend
npm install
npm run start:dev
```

### 3. 프론트엔드 설치

```bash
cd frontend
npm install
npm run dev
```

### 4. .env 설정 예시

```env
# backend/.env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=klicklab
```

## 🧪 이벤트 전송 예시

SDK를 통해 다음과 같은 방식으로 이벤트를 전송할 수 있습니다:

```javascript
sendEvent("page_view", { path: "/home" }, "user_1234");
```

또는 HTML 속성 기반 자동 수집:

```html
<button data-kl-event="click" data-kl-prop-button_name="buy_now">구매하기</button>
```

## 📁 디렉토리 구조 (예시)

```
klickLab/
├── frontend/            # 분석 대시보드 (React)
├── backend/             # 이벤트 수집 서버 (Express)
├── sdk/                 # 삽입용 JS SDK
├── scripts/             # 초기 설정 및 배포용 스크립트
└── README.md
```

## 🤝 기여하기

Pull Request는 언제든지 환영입니다!  
이슈나 기능 제안도 자유롭게 남겨주세요.

## 📄 라이선스

MIT License
