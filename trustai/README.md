## AriMentis 멘탈헬스 상담 시스템

멘탈헬스 상담을 위해 아리스토텔레스 설득 이론(Ethos, Pathos, Logos) 기반의 프롬프트와 7단계 대화 흐름(레포형성 → 상황 물어보기 → 탐색 → 인지재구성 → 행동계획 세우기 → 대처 전략 → 마무리 인사)을 적용한 Next.js 애플리케이션입니다.

### 주요 특징
- **3가지 상담 톤**: Ethos(전문성), Pathos(공감), Logos(논리/증거)별 시스템 프롬프트.
- **7단계 대화 구조**: 단계별 최대 3턴, 목표 달성 시 다음 단계로 자동 전환.
- **중복 상담전화 방지**: 이전 대화에서 언급된 상담전화(1393, 1588-9191)가 있으면 재언급을 차단.
- **응답 길이 제어**: `maxOutputTokens`로 응답 길이 제한(필요 시 해제/조정).
- **Firebase 연동**: 대화 종료 시 Firestore에 기록(클라이언트 사이드 동적 import).

### 기술 스택
- Next.js 16, React 19
- TypeScript, Tailwind CSS v4
- Google Generative AI (Gemini)
- Firebase Firestore

### 프로젝트 구조(주요 경로)
- `app/page.tsx` : 홈(조건 선택)
- `app/ethos|pathos|logos/page.tsx` : 각 조건 진입
- `components/Chat.tsx` : 대화 UI, 단계/턴 관리, 스트리밍 처리
- `app/api/chat/route.ts` : Gemini 호출 API, 히스토리/단계/중복전화 처리
- `lib/prompts.ts` : 카테고리별 시스템 프롬프트 + 7단계 가이드
- `lib/firebase.ts` : Firebase 초기화(클라이언트 전용)

### 환경 변수
프로젝트 루트에 `.env.local` 생성:
```
GEMINI_API_KEY=YOUR_KEY
```
> 키는 절대 커밋하지 마세요. `.gitignore`에 이미 포함되어 있습니다.

### 설치 및 실행
```bash
npm install
npm run dev
```
`http://localhost:3000` 접속 후 원하는 조건(Ethos/Pathos/Logos)을 선택하세요.

### 모델 설정
`app/api/chat/route.ts`의 `model` 필드로 제어합니다.
- 현재 설정: `gemini-2.5-flash` (404 발생 시 `gemini-1.5-flash-latest`나 `gemini-pro`로 교체 후 재시도)
- 응답 길이: `generationConfig.maxOutputTokens` 주석 해제/조정으로 변경

### 대화 흐름
- 각 단계 최대 3턴, 총 7단계(최대 21턴).
- UI에 현재 단계와 단계별 턴 수 표시.
- 목표 달성 판단 시 다음 단계로 자동 진행.

### 안전 및 중복 안내
- 상담전화 번호(1393, 1588-9191)는 이전 대화에 이미 언급된 경우 다시 말하지 않습니다.
- Ethos/Pathos 프롬프트에서는 기본적으로 번호를 직접 언급하지 않도록 설계되어 있습니다.

### Firebase 참고
- Firestore 저장은 클라이언트 측 동적 import로 수행됩니다. 실제 기록이 필요하면 `lib/firebase.ts`에 올바른 Firebase 설정을 입력하세요.

### 문제 해결
- **모델 404**: 지원되는 모델 이름으로 변경(예: `gemini-1.5-flash-latest`, `gemini-pro`).
- **첫 대화 오류**: 메시지가 없거나 마지막 메시지가 비어 있으면 400을 반환하도록 방어 로직이 추가되어 있습니다. 프런트엔드 기본 흐름을 사용하면 자동으로 방지됩니다.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
