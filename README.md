# Timing

여러 참여자의 가능한 시간을 입력받아 최적의 약속 시간을 추천해주는 일정 조율 웹 서비스입니다.

## 서비스 URL

- **웹 서비스 URL**: https://timing-six.vercel.app
- **백엔드 api 명세서**: https://timing-server.onrender.com/api-docs

---

## 주요 기능

- 모임 생성 및 링크 공유
- 닉네임 + 비밀번호 기반 참여 (로그인 불필요)
- 드래그 기반 시간 선택 그리드
- 조건 기반 최적 시간 추천
  - 최소 참여 인원 설정
  - 필수 참석자 설정
  - 회의 시간 설정 (연속 슬롯 필터링)
- 사용방법 팝업 안내
- 모바일 반응형 UI

---

## 기술 스택

**Frontend**

- React 19 + TypeScript
- Vite
- TailwindCSS v4
- React Router DOM

**Backend**

- Node.js + Express
- TypeScript
- Mongoose + MongoDB Atlas

**Infra**

- Vercel (프론트엔드 배포)
- Render (백엔드 배포)
- UptimeRobot (서버 모니터링)

---

## 프로젝트 구조

```
timing/
├── client/          # 프론트엔드 (React + Vite)
│   ├── src/
│   │   ├── pages/   # MainPage, JoinPage, TimePage, ResultPage
│   │   ├── components/  # HelpModal
│   │   ├── assets/  # 가이드 이미지
│   │   ├── types/   # TypeScript 타입 정의
│   │   └── api.ts   # API 호출 함수
│   └── vercel.json
└── server/          # 백엔드 (Node.js + Express)
    └── src/
        ├── models/  # Meeting, Participant Mongoose 모델
        ├── routes/  # meetings, participants 라우트
        └── index.ts
```

---

## 로컬 실행 방법

**1. 서버 실행**

```bash
cd server
npm install
# .env 파일 생성 후 MONGODB_URI, PORT, CLIENT_URL 설정
npm run dev
```

**2. 클라이언트 실행**

```bash
cd client
npm install
# .env 파일 생성 후 VITE_API_URL 설정
npm run dev
```

---

## API

| 메서드 | 경로                                       | 역할               |
| ------ | ------------------------------------------ | ------------------ |
| GET    | `/health`                                  | 서버 상태 확인     |
| POST   | `/api/meetings`                            | 모임 생성          |
| GET    | `/api/meetings/:id`                        | 모임 조회          |
| POST   | `/api/meetings/:id/participants`           | 참여자 등록/로그인 |
| GET    | `/api/meetings/:id/participants`           | 참여자 목록 조회   |
| PUT    | `/api/meetings/:id/participants/:nickname` | 시간 저장          |
