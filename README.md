# 다듬 (Dadeum)

> AI 티 없이, 사람이 쓴 것처럼.

AI로 쓴 한국어 글의 번역투·어색한 문체를 자연스러운 한국어로 다듬어 주는 윤문 서비스입니다. 내용·사실·수치·고유명사·인용은 그대로 두고, 문체·리듬·표현만 사람답게 고칩니다.

이 저장소는 **유료 의사(WTP) 스모크 테스트용 MVP** 입니다. 랜딩·실사용 도구·전후 예시·요금제가 한 페이지에 들어 있고, 유료 버튼은 관심 신호를 수집하는 페이크도어로 동작합니다.

## 기술 스택

- Next.js 15 (App Router) · React 19 · TypeScript
- Tailwind CSS v4
- LLM: **Vercel AI Gateway** (`ai` + `@ai-sdk/gateway`), `streamText` 스트리밍
- 배포 타깃: Vercel (API 라우트는 Node 런타임)

## 로컬 실행

```bash
npm install
npm run dev
# http://localhost:3000
```

키가 없어도 앱은 정상적으로 뜹니다. 다듬기 버튼을 누르면 도구는 "데모 예시를 확인해 주세요" 안내로 폴백하고, 전후 예시 섹션에서 품질을 미리 볼 수 있습니다.

## 실제로 켜기 — 필요한 env 는 딱 하나

| 변수 | 필수 | 설명 |
|------|:---:|------|
| `AI_GATEWAY_API_KEY` | ✅ | Vercel AI Gateway API 키. **이 키 하나만 있으면 윤문이 실제로 동작합니다.** [Vercel 대시보드](https://vercel.com/dashboard) → AI Gateway 에서 발급. |
| `REWRITE_MODEL` | ⬜ | 사용할 모델. 기본값 `anthropic/claude-sonnet-5` (AI Gateway 모델 문자열). |
| `NEXT_PUBLIC_CHECKOUT_URL` | ⬜ | 설정하면 유료 CTA 클릭 시 이 주소로 바로 이동. 실제 결제 링크(Lemon Squeezy/Gumroad 등)를 **코드 수정 없이** 여기에 넣으면 됩니다. |
| `INTENT_WEBHOOK_URL` | ⬜ | 관심(WTP) 이벤트를 전달할 웹훅. Slack Incoming Webhook, Zapier Catch Hook 등. |

`.env.example` 을 `.env.local` 로 복사해 채우세요.

```bash
cp .env.example .env.local
```

## 배포 — 5분 안에 라이브

### 원클릭 배포 (권장)

아래 버튼을 누르면 이 저장소를 Vercel 로 임포트하고, 필요한 키를 입력받아 바로 배포합니다.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/dasolin139/dadeum&env=AI_GATEWAY_API_KEY&envLink=https://vercel.com/dashboard&project-name=dadeum&repository-name=dadeum)

**사람이 해야 하는 일은 딱 이것뿐입니다 (약 5분):**

1. 위 **Deploy** 버튼 클릭 → Vercel 로그인(없으면 무료 가입) → 저장소 임포트.
2. 임포트 화면에서 `AI_GATEWAY_API_KEY` 한 칸을 채웁니다.
   - 키 발급: [Vercel 대시보드](https://vercel.com/dashboard) → **AI Gateway** → **API Keys** → Create. (팀마다 매월 무료 크레딧 제공 — 스모크 테스트엔 충분)
   - 이 키 하나면 윤문이 실제로 동작합니다. (비워 두면 데모 예시 폴백으로 뜹니다)
3. **Deploy** → 1~2분 뒤 `https://dadeum-xxx.vercel.app` 라이브 URL 이 나옵니다. **끝.**

### 결제 링크 붙이기 (수익 테스트용, 선택)

지금 배포해도 유료 버튼은 **페이크도어**(관심·이메일 수집)로 동작하므로 WTP 신호는 바로 쌓입니다.
실제 결제 클릭까지 측정하려면 [`MONETIZE.md`](./MONETIZE.md) 를 따라 결제 링크를 만든 뒤,
Vercel **Settings → Environment Variables** 에 `NEXT_PUBLIC_CHECKOUT_URL` 로 넣고 재배포하면 됩니다. **코드 수정 없음.**

### CLI 로 배포 (대안)

```bash
npm i -g vercel   # 최초 1회
vercel            # 프리뷰 배포 / 프로젝트 연결
vercel --prod     # 프로덕션 배포
```

배포 후 프로젝트 **Settings → Environment Variables** 에 `AI_GATEWAY_API_KEY` 를 넣으면 라이브로 동작합니다.

## WTP(지불 의사) 신호는 어디서 보나

유료 플랜 버튼 클릭은 `/api/intent` 로 기록됩니다. 저장 방식:

1. **Vercel 로그** — 모든 이벤트가 한 줄 JSON 으로 `console.log` 됩니다. Vercel 대시보드 → 프로젝트 → Logs 에서 `wtp_intent` 로 검색하세요.
2. **웹훅** — `INTENT_WEBHOOK_URL` 을 설정하면 이벤트를 실시간으로 그쪽에 POST 합니다.

(서버리스 파일시스템은 휘발성이라 파일로 저장하지 않습니다.)

## 요금 폭탄 방지

- 입력 3,000자 제한 (클라이언트 + 서버 양쪽 검증)
- `/api/rewrite` 에 IP당 10분 8회 인메모리 레이트 리밋 (best-effort)
- 빈 입력·공백 입력 거부
- 키가 없으면 LLM 을 호출하지 않고 503 반환

## 컴플라이언스

이 서비스는 **문체 윤문 · 자연스러운 한국어 · 번역투 제거** 도구로만 포지셔닝합니다. 제품의 가치는 오직 "글 품질 개선"에 있으며, UI·카피·메타·코드 전반에서 이 문체 개선 관점만 사용합니다.

## 구조

```
app/
  layout.tsx            루트 레이아웃 · 메타데이터
  page.tsx              단일 랜딩(서버 컴포넌트, showcase.json 정적 임포트)
  globals.css           Tailwind v4 + 디자인 토큰
  api/
    rewrite/route.ts    AI Gateway 스트리밍 윤문 (Node 런타임)
    intent/route.ts     WTP 신호 수집
components/
  Hero.tsx              히어로
  HumanizeTool.tsx      실사용 도구(클라이언트, 스트리밍)
  Showcase.tsx          전후 예시 탭(클라이언트)
  Pricing.tsx           요금제 + WTP 페이크도어(클라이언트)
lib/
  constants.ts          MAX_CHARS 등 공용 상수
  prompt.ts             윤문 시스템 프롬프트
  rateLimit.ts          인메모리 IP 레이트 리밋
  types.ts              showcase 타입
content/
  showcase.json         전후 예시 데이터
```
