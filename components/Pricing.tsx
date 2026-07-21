"use client";

import { useState } from "react";

interface Plan {
  id: string;
  name: string;
  price: string;
  period?: string;
  blurb: string;
  features: string[];
  cta: string;
  paid: boolean;
  highlight?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "₩0",
    blurb: "가볍게 시작해 보세요",
    features: ["하루 3회 무료 다듬기", "3,000자까지", "번역투·문체 개선"],
    cta: "무료로 시작",
    paid: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "₩9,900",
    period: "/월",
    blurb: "매일 쓰는 사람에게",
    features: ["무제한 다듬기", "긴 글 지원", "우선 처리 속도", "장르별 톤 조정"],
    cta: "Pro 시작하기",
    paid: true,
    highlight: true,
  },
  {
    id: "business",
    name: "Business",
    price: "₩29,000",
    period: "/월",
    blurb: "팀·에이전시용",
    features: ["Pro 모든 기능", "팀 좌석 공유", "API 연동(예정)", "우선 지원"],
    cta: "Business 시작하기",
    paid: true,
  },
];

const CREDIT_PACK: Plan = {
  id: "credit",
  name: "크레딧 팩",
  price: "₩4,900",
  blurb: "구독 없이 필요할 때만",
  features: ["1회 결제 · 소진형 크레딧", "언제든 사용", "만료 없음"],
  cta: "크레딧 구매하기",
  paid: true,
};

export default function Pricing() {
  const [modalPlan, setModalPlan] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function postIntent(plan: string, payload: Record<string, unknown> = {}) {
    try {
      await fetch("/api/intent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan, ts: Date.now(), ...payload }),
      });
    } catch {
      /* 신호 전송 실패해도 UX 는 계속 진행 */
    }
  }

  function handlePaidClick(plan: Plan) {
    const checkout = process.env.NEXT_PUBLIC_CHECKOUT_URL;
    if (checkout) {
      window.location.href = checkout;
      return;
    }
    // 페이크도어: 관심(WTP) 신호를 기록하고 안내 모달을 띄운다.
    postIntent(plan.id);
    setEmail("");
    setSent(false);
    setModalPlan(plan.name);
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!value || !value.includes("@")) return;
    await postIntent(`${modalPlan}:email`, { email: value });
    setSent(true);
  }

  function PlanButton({ plan }: { plan: Plan }) {
    if (!plan.paid) {
      return (
        <a
          href="#tool"
          className="block w-full rounded-lg border border-ink-200 bg-white px-4 py-3 text-center text-sm font-semibold text-ink-800 transition hover:bg-ink-50"
        >
          {plan.cta}
        </a>
      );
    }
    return (
      <button
        onClick={() => handlePaidClick(plan)}
        className={`block w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition ${
          plan.highlight
            ? "bg-brand-600 text-white shadow-sm hover:bg-brand-700"
            : "border border-brand-500 bg-white text-brand-700 hover:bg-brand-50"
        }`}
      >
        {plan.cta}
      </button>
    );
  }

  return (
    <section id="pricing" className="bg-ink-50 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
            간단한 요금제
          </h2>
          <p className="mt-3 text-ink-600">
            무료로 써보고, 자주 쓰게 되면 그때 올리세요.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm ${
                plan.highlight
                  ? "border-brand-500 ring-2 ring-brand-100"
                  : "border-ink-200"
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                  인기
                </span>
              )}
              <h3 className="text-lg font-bold text-ink-900">{plan.name}</h3>
              <p className="mt-1 text-sm text-ink-500">{plan.blurb}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-ink-900">{plan.price}</span>
                {plan.period && (
                  <span className="text-sm text-ink-400">{plan.period}</span>
                )}
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ink-600">
                    <span className="mt-0.5 text-brand-500">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <PlanButton plan={plan} />
              </div>
            </div>
          ))}
        </div>

        {/* 크레딧 팩 */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-ink-200 bg-white p-6 shadow-sm sm:flex-row">
          <div>
            <h3 className="text-lg font-bold text-ink-900">
              {CREDIT_PACK.name}{" "}
              <span className="ml-1 text-2xl font-bold text-ink-900">
                {CREDIT_PACK.price}
              </span>
            </h3>
            <p className="mt-1 text-sm text-ink-500">
              {CREDIT_PACK.blurb} · {CREDIT_PACK.features.join(" · ")}
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <button
              onClick={() => handlePaidClick(CREDIT_PACK)}
              className="w-full rounded-lg border border-brand-500 bg-white px-6 py-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 sm:w-auto"
            >
              {CREDIT_PACK.cta}
            </button>
          </div>
        </div>
      </div>

      {/* 관심(WTP) 안내 모달 */}
      {modalPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4"
          onClick={() => setModalPlan(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {!sent ? (
              <>
                <h3 className="text-lg font-bold text-ink-900">
                  곧 결제를 오픈합니다
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">
                  {modalPlan} 플랜에 관심 가져 주셔서 감사합니다! 준비가 끝나면
                  가장 먼저 알려 드릴게요. 이메일을 남겨 주시면 오픈 소식을
                  보내 드립니다.
                </p>
                <form onSubmit={handleEmailSubmit} className="mt-4 space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="이메일 주소 (선택)"
                    className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
                    >
                      알림 받기
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalPlan(null)}
                      className="rounded-lg border border-ink-200 px-4 py-2.5 text-sm font-medium text-ink-600 transition hover:bg-ink-50"
                    >
                      닫기
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-ink-900">감사합니다! 🙏</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">
                  오픈하면 가장 먼저 알려 드릴게요. 그동안 무료로 마음껏
                  다듬어 보세요.
                </p>
                <button
                  onClick={() => setModalPlan(null)}
                  className="mt-5 w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  닫기
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
