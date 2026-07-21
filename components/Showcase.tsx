"use client";

import { useState } from "react";
import type { ShowcaseExample } from "@/lib/types";

export default function Showcase({ examples }: { examples: ShowcaseExample[] }) {
  const [active, setActive] = useState(0);
  if (!examples.length) return null;
  const ex = examples[active];

  return (
    <section id="showcase" className="border-y border-ink-100 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
            다듬기 전후, 이렇게 달라집니다
          </h2>
          <p className="mt-3 text-ink-600">
            장르별 예시로 확인해 보세요. 내용은 그대로, 문체만 사람답게.
          </p>
        </div>

        {/* 장르 탭 */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {examples.map((e, i) => (
            <button
              key={e.genre_id}
              onClick={() => setActive(i)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                i === active
                  ? "bg-brand-600 text-white shadow-sm"
                  : "border border-ink-200 bg-white text-ink-600 hover:bg-ink-50"
              }`}
            >
              {e.genre_label}
            </button>
          ))}
        </div>

        {/* 전후 비교 */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-ink-200 bg-ink-50/60 p-6">
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
              Before · AI 티 나는 글
            </div>
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink-400">
              {ex.before}
            </p>
          </div>

          <div className="rounded-2xl border-2 border-brand-100 bg-brand-50/40 p-6 shadow-sm">
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-600">
              After · 사람이 쓴 것처럼
            </div>
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink-900">
              {ex.after}
            </p>
          </div>
        </div>

        {ex.note && (
          <div className="mx-auto mt-5 max-w-3xl rounded-lg bg-ink-50 px-5 py-4 text-sm leading-relaxed text-ink-600">
            <span className="font-semibold text-ink-800">무엇을 바꿨나 · </span>
            {ex.note}
          </div>
        )}
      </div>
    </section>
  );
}
