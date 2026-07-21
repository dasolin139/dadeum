import Hero from "@/components/Hero";
import HumanizeTool from "@/components/HumanizeTool";
import Showcase from "@/components/Showcase";
import Pricing from "@/components/Pricing";
import showcaseData from "@/content/showcase.json";
import type { ShowcaseData } from "@/lib/types";

const data = showcaseData as ShowcaseData;

export default function Home() {
  return (
    <main>
      <Hero />
      <HumanizeTool />
      <Showcase examples={data.examples} />
      <Pricing />

      <footer className="border-t border-ink-100 bg-white py-10">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-ink-400">
          <p className="font-semibold text-ink-600">다듬 · Dadeum</p>
          <p className="mt-1">AI 티 없이, 사람이 쓴 것처럼.</p>
          <p className="mt-4 text-xs">
            © {new Date().getFullYear()} 다듬. 자연스러운 한국어 윤문 서비스.
          </p>
        </div>
      </footer>
    </main>
  );
}
