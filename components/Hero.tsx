export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-ink-100 bg-white">
      <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-ink-50 px-4 py-1.5 text-sm font-medium text-ink-600">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          자연스러운 한국어 윤문 · 다듬
        </span>

        <h1 className="mt-7 text-4xl font-bold leading-tight tracking-tight text-ink-900 sm:text-6xl">
          AI 티 없이,
          <br className="sm:hidden" /> 사람이 쓴 것처럼.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-600 sm:text-xl">
          AI로 쓴 한국어 글의 번역투와 어색한 문체를 자연스러운 한국어로 다듬어
          드립니다. 내용·사실·수치는 그대로, 읽는 느낌만 사람답게.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#tool"
            className="w-full rounded-lg bg-brand-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-brand-700 sm:w-auto"
          >
            지금 다듬어 보기
          </a>
          <a
            href="#showcase"
            className="w-full rounded-lg border border-ink-200 bg-white px-8 py-3.5 text-base font-semibold text-ink-800 transition hover:bg-ink-50 sm:w-auto"
          >
            결과 예시 보기
          </a>
        </div>

        <p className="mt-6 text-sm text-ink-400">
          하루 3회 무료 · 붙여넣고 버튼 한 번이면 끝
        </p>
      </div>
    </section>
  );
}
