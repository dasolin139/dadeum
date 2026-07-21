"use client";

import { useState, useRef } from "react";
import { MAX_CHARS } from "@/lib/constants";

type Status = "idle" | "loading" | "streaming" | "done" | "error";

export default function HumanizeTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const over = input.length > MAX_CHARS;
  const busy = status === "loading" || status === "streaming";

  async function handleSubmit() {
    setMessage("");
    setCopied(false);
    const trimmed = input.trim();

    if (!trimmed) {
      setMessage("다듬을 글을 먼저 입력해 주세요.");
      return;
    }
    if (over) {
      setMessage(`글자 수가 ${MAX_CHARS.toLocaleString()}자를 넘었어요. 조금 줄여 주세요.`);
      return;
    }

    setOutput("");
    setStatus("loading");
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        let friendly = "다듬는 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.";
        try {
          const data = await res.json();
          if (data?.error) friendly = data.error;
        } catch {
          /* 본문이 JSON 이 아니면 기본 메시지 유지 */
        }
        if (res.status === 503) {
          setMessage("지금은 데모 예시를 확인해 주세요. 아래 결과 예시로 품질을 미리 보실 수 있어요.");
        } else {
          setMessage(friendly);
        }
        setStatus("error");
        return;
      }

      setStatus("streaming");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setOutput(acc);
      }
      setStatus("done");
    } catch (err) {
      if ((err as Error)?.name === "AbortError") {
        setStatus("idle");
        return;
      }
      setMessage("네트워크 문제로 다듬지 못했어요. 연결을 확인하고 다시 시도해 주세요.");
      setStatus("error");
    } finally {
      abortRef.current = null;
    }
  }

  async function handleCopy() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setMessage("복사에 실패했어요. 텍스트를 직접 선택해 복사해 주세요.");
    }
  }

  return (
    <section id="tool" className="bg-ink-50 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
            글을 붙여넣고, 자연스럽게 다듬으세요
          </h2>
          <p className="mt-3 text-ink-600">
            내용은 그대로 두고 번역투와 어색한 문체만 손봅니다.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {/* 입력 */}
          <div className="flex flex-col rounded-2xl border border-ink-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-ink-800">원문</span>
              <span
                className={`text-xs tabular-nums ${
                  over ? "font-semibold text-red-500" : "text-ink-400"
                }`}
              >
                {input.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="AI로 쓴 한국어 글을 붙여넣으세요"
              className="min-h-[280px] flex-1 resize-y rounded-lg border border-ink-200 bg-ink-50/50 p-4 text-[15px] leading-relaxed text-ink-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
            />
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleSubmit}
                disabled={busy || over}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition enabled:hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {busy ? "다듬는 중…" : "자연스럽게 다듬기"}
              </button>
              {input && !busy && (
                <button
                  onClick={() => {
                    setInput("");
                    setOutput("");
                    setStatus("idle");
                    setMessage("");
                  }}
                  className="text-sm text-ink-400 transition hover:text-ink-600"
                >
                  지우기
                </button>
              )}
            </div>
          </div>

          {/* 출력 */}
          <div className="flex flex-col rounded-2xl border border-ink-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-ink-800">다듬은 글</span>
              <button
                onClick={handleCopy}
                disabled={!output}
                className="rounded-md border border-ink-200 px-3 py-1 text-xs font-medium text-ink-600 transition enabled:hover:bg-ink-50 disabled:opacity-40"
              >
                {copied ? "복사됨 ✓" : "복사"}
              </button>
            </div>
            <div className="min-h-[280px] flex-1 rounded-lg border border-ink-100 bg-ink-50/40 p-4 text-[15px] leading-relaxed text-ink-900">
              {output ? (
                <p className="whitespace-pre-wrap">
                  {output}
                  {status === "streaming" && (
                    <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-brand-500 align-middle" />
                  )}
                </p>
              ) : (
                <p className="text-ink-400">
                  {status === "loading"
                    ? "다듬는 중이에요…"
                    : "다듬은 결과가 여기에 나타납니다."}
                </p>
              )}
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`mx-auto mt-5 max-w-2xl rounded-lg px-4 py-3 text-center text-sm ${
              status === "error"
                ? "bg-amber-50 text-amber-800"
                : "bg-brand-50 text-brand-700"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </section>
  );
}
