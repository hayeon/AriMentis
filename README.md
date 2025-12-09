# TrustAI - AI 학습 보조 시스템

CHI 2026 연구를 위한 AI 학습 보조 시스템 실험 플랫폼입니다. 다양한 프레이밍 조건(ethos, pathos, logos)과 프레임 유형(gain, loss)에 따른 AI 응답 효과를 연구하기 위한 웹 애플리케이션입니다.

## 프로젝트 개요

이 프로젝트는 학생들이 AI 학습 보조 시스템과 상호작용할 때, 다양한 설득 전략이 학습 행동에 미치는 영향을 연구하기 위해 개발되었습니다. 6가지 실험 조건에서 최대 7턴의 대화를 진행하며, 대화 데이터는 Firebase에 저장됩니다.

## 기술 스택

- **프레임워크**: Next.js 16 (App Router)
- **언어**: TypeScript
- **UI**: React 19, Tailwind CSS
- **AI**: Google Generative AI (Gemini 2.5 Flash)
- **데이터베이스**: Firebase Firestore
- **배포**: Vercel (권장)

## 주요 기능

- 6가지 실험 조건 지원 (ethos/pathos/logos × gain/loss)
- 실시간 스트리밍 AI 응답
- 최대 7턴 대화 제한
- Firebase를 통한 대화 기록 자동 저장
- 반응형 웹 디자인

## 설치 및 실행

### 사전 요구사항

- Node.js 18 이상
- npm 또는 yarn

### 설치

```bash
npm install
```

### 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Firebase 설정은 `lib/firebase.ts`에 하드코딩되어 있습니다. 프로덕션 환경에서는 환경 변수로 관리하는 것을 권장합니다.

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
npm run build
npm start
```

## 프로젝트 구조

```
trustai/
├── app/
│   ├── [cond]/          # 동적 라우팅 (실험 조건별 페이지)
│   │   └── page.tsx
│   ├── api/
│   │   └── chat/        # AI 채팅 API 엔드포인트
│   │       └── route.ts
│   ├── page.tsx         # 메인 페이지 (실험 조건 선택)
│   └── layout.tsx
├── components/
│   └── Chat.tsx         # 채팅 인터페이스 컴포넌트
├── lib/
│   ├── firebase.ts      # Firebase 초기화 및 설정
│   └── prompt.ts        # 실험 조건별 시스템 프롬프트
└── public/              # 정적 파일
```

## 실험 조건

시스템은 6가지 실험 조건을 지원합니다:

### Ethos (신뢰성 기반)
- **ethos-gain**: 전문성 기반, 이득 프레이밍
- **ethos-loss**: 전문성 기반, 손실 프레이밍

### Pathos (감정 기반)
- **pathos-gain**: 정서적 연결, 이득 프레이밍
- **pathos-loss**: 정서적 연결, 손실 프레이밍

### Logos (논리 기반)
- **logos-gain**: 증거 기반, 이득 프레이밍
- **logos-loss**: 증거 기반, 손실 프레이밍

각 조건은 `lib/prompt.ts`에 정의된 시스템 프롬프트를 사용하여 AI의 응답 스타일을 제어합니다.

## 사용 방법

1. 메인 페이지에서 실험 조건을 선택합니다.
2. 선택한 조건에 해당하는 채팅 페이지로 이동합니다.
3. AI와 최대 7턴의 대화를 진행합니다.
4. 7턴이 완료되면 대화 기록이 자동으로 Firebase에 저장됩니다.

## 데이터 수집

대화가 완료되면 다음 정보가 Firebase Firestore의 `chats` 컬렉션에 저장됩니다:

- `cond`: 실험 조건
- `msgs`: 전체 대화 메시지 배열
- `turn`: 완료된 턴 수
- `time`: 저장 시각

## 라이선스

이 프로젝트는 연구 목적으로 개발되었습니다.

## 기여

이 프로젝트는 hci 연구를 위한 실험 플랫폼입니다. 기여나 수정이 필요한 경우 이슈를 등록해 주세요.
