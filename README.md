# Timing

여러 참여자의 가능한 시간을 입력받아 최적의 약속 시간을 추천해주는 일정 조율 웹 서비스입니다.

## 서비스 URL

- **웹 서비스 URL**: https://timing-six.vercel.app
- **백엔드 api 명세서**: https://timing-server.onrender.com/api-docs

---

## 주요 기능

#### 1. 모임 생성 및 링크 공유

<img width=45% alt="main_page_1" src="https://github.com/user-attachments/assets/45a9d9d1-345d-417e-a2c4-941cdf0c3d5a" />
<img width=45% alt="main_page_2" src="https://github.com/user-attachments/assets/155fcc4b-0109-413d-ae94-cd44bbdb5a2c" />

* 모임 제목, 날짜 범위, 시간 범위를 설정하여 모임 생성
* 고유 참여 링크 자동 생성
* 링크 복사를 통한 참여자 초대

#### 2. 모임 참여

<img width=45% alt="join_page_1" src="https://github.com/user-attachments/assets/f5f680c9-944a-4b11-932c-26d2d0760978" />
<img width=45% alt="join_page_2" src="https://github.com/user-attachments/assets/6705594a-2d0b-4e1a-839e-38125510fa91" />

* 회원가입 없이 닉네임과 비밀번호만 입력하여 참여
* 입력한 비밀번호를 통한 일정 수정 지원

#### 3. 시간 입력

<img width=45% alt="time_page_1" src="https://github.com/user-attachments/assets/f61c5ad7-827d-4b31-b9ef-9051944ac141" />
<img width=45% alt="time_page_2" src="https://github.com/user-attachments/assets/e86cc901-0004-41cd-b7c0-e28413b0b893" />

* 드래그 기반 시간표 UI 제공
* 참여 가능한 시간대를 직관적으로 선택 가능

#### 4. 일정 추천

<img width=45% alt="result_page_3" src="https://github.com/user-attachments/assets/0f62c341-4a30-496d-9133-7dee1bb4dcd0" />
<img width=45% alt="result_page_4" src="https://github.com/user-attachments/assets/11c52639-f08d-423c-a4ef-03b80e129942" />

* 참여자 일정 데이터 분석
* 최소 참석 인원 조건 적용
* 필수 참석자 조건 적용
* 회의 시간 조건 적용
* 최적의 일정 후보 자동 추천

#### 5. 도움말 기능

<img width=45% alt="tip_1" src="https://github.com/user-attachments/assets/9c2f3b35-ab16-43e8-80b8-607802e081dc" />
<img width=45% alt="tip_2" src="https://github.com/user-attachments/assets/919272d8-4409-4da4-92f8-39fe2b39413f" />
<img width=30% alt="tip_3" src="https://github.com/user-attachments/assets/eb7aa3db-b526-4ae6-8e8d-ab573b85f850" />
<img width=30% alt="tip_4" src="https://github.com/user-attachments/assets/c5f6889a-4ab1-4722-9f88-b19a1a7faad9" />
<img width=30% alt="tip_5" src="https://github.com/user-attachments/assets/370496ca-139b-44ec-9423-7f83cb4f2808" />

* 단계별 서비스 이용 가이드 제공
* 모임 생성부터 결과 확인까지 순차 안내

#### 6. 반응형 UI

<img width="766" height="791" alt="모바일 반응형 UI" src="https://github.com/user-attachments/assets/729e4c37-3956-4035-a27e-503d04623916" />

* 데스크톱 환경 지원
* 모바일 및 태블릿 환경 지원

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

**Development Tools**

- Visual Studio Code
- Claude Code
- Git
- GitHub

---

## 시스템 구조
<img width="1503" height="936" alt="시스템구조도" src="https://github.com/user-attachments/assets/40e37c87-093d-4191-968c-917c82a6026d" />


## 배포 환경

| 구분 | 사용 서비스                                       |
| ------ | ------------------------------------------ | 
| Frontend Hosting    | Vercel                                  | 
| Backend Hosting   | Render                            | 
| Database    | MongoDB Atlas                    | 
| Monitoring   | UptimeRobot           | 
| Source Repository    | GitHub           | 

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
```
.env 파일 생성 후 MONGODB_URI, PORT, CLIENT_URL 설정
```env
MONGODB_URI= ...
PORT=3000
CLIENT_URL= ...
```
```bash
npm run dev
```

**2. 클라이언트 실행**

```bash
cd client
npm install
```
.env 파일 생성 후 VITE_API_URL 설정
```env
VITE_API_URL=http://localhost:3000
```

```
npm run dev
```

---

## API

| 메서드 | 경로                                       | 역할               |
| ------ | ------------------------------------------ | ------------------ |
| GET    | `/health`                                  | 서버 상태 확인     |
| POST   | `/api/meetings`                            | 모임 생성          |
| GET    | `/api/meetings/:id`                        | 모임 조회          |
| POST   | `/api/meetings/:id/participants`           | 참여자 등록 |
| GET    | `/api/meetings/:id/participants`           | 참여자 목록 조회   |
| PUT    | `/api/meetings/:id/participants/:nickname` | 일정 저장          |
