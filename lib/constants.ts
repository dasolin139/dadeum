// 공용 상수 — 클라이언트/서버 양쪽에서 동일 값을 쓴다.

export const MAX_CHARS = 3000;

export const DEFAULT_MODEL = "anthropic/claude-sonnet-5";

// 유료 플랜 정의 (WTP 페이크도어 테스트용)
export const PLANS = {
  pro: { id: "pro", label: "Pro", price: "₩9,900/월" },
  business: { id: "business", label: "Business", price: "₩29,000/월" },
  credit: { id: "credit", label: "크레딧 팩", price: "₩4,900" },
} as const;

export type PlanId = keyof typeof PLANS;
