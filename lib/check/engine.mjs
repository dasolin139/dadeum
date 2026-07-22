// 다듬 · AI 티 점검 엔진 (dependency-free, 브라우저/Node 공용)
//
// 순수 함수만 노출한다. DOM·네트워크·API 키 의존이 전혀 없어
// 클라이언트에서 무료로, 서버 비용 0 으로 값을 전달할 수 있다.
// 이것이 이 제품에서 외부 유통·결제 없이도 검증 가능한 유일한 가치 표면이다.

import { RULES, GRADES } from "./rules.mjs";

// 규칙셋을 훑어 겹치지 않는 매치 구간(span) 목록을 만든다.
// 반환: [{ start, end, cat, weight }] — start 오름차순, 서로 겹치지 않음.
export function collect(text, rules = RULES) {
  const hits = [];
  for (const rule of rules) {
    rule.re.lastIndex = 0;
    let m;
    while ((m = rule.re.exec(text)) !== null) {
      let full = m[0];
      let start = m.index;
      let len = full.length;

      // 접속사류: 앞 구두점/공백 캡처를 제외하고 핵심어만 표시
      if (rule.trimLead) {
        const leadMatch = full.match(/^([.!?…]?\s*|\n?\s*)/);
        const lead = leadMatch ? leadMatch[0].length : 0;
        start += lead;
        len -= lead;
        full = full.slice(lead);
      }

      // 빈 매치 방어 (무한 루프 차단)
      if (full.trim().length === 0) {
        if (m.index === rule.re.lastIndex) rule.re.lastIndex++;
        continue;
      }

      hits.push({ start, end: start + len, cat: rule.cat, weight: rule.weight });
      if (m.index === rule.re.lastIndex) rule.re.lastIndex++;
    }
  }

  // 겹치는 매치는 먼저 시작한 것 우선, 겹치면 버린다.
  hits.sort((a, b) => a.start - b.start || b.end - a.end);
  const merged = [];
  let lastEnd = -1;
  for (const h of hits) {
    if (h.start >= lastEnd) {
      merged.push(h);
      lastEnd = h.end;
    }
  }
  return merged;
}

// 가중 히트 밀도 → 자연스러움 점수(0~100). 밀도 0 = 100, 촘촘할수록 낮아진다.
export function score(text, hits) {
  const chars = text.replace(/\s/g, "").length || 1;
  const weighted = hits.reduce((s, h) => s + h.weight, 0);
  const density = (weighted / chars) * 100;
  const s = Math.round(100 - density * 16);
  return Math.max(0, Math.min(100, s));
}

// 점수 → 등급 객체
export function grade(s, grades = GRADES) {
  for (const g of grades) {
    if (s >= g.min) return g;
  }
  return grades[grades.length - 1];
}

// 카테고리별 히트 수 집계
export function countByCat(hits) {
  const by = {};
  for (const h of hits) by[h.cat] = (by[h.cat] || 0) + 1;
  return by;
}

// 한 번에 분석: 점수·등급·히트·카테고리 집계를 반환한다.
export function analyze(text, rules = RULES, grades = GRADES) {
  const hits = collect(text, rules);
  const s = score(text, hits);
  return {
    score: s,
    grade: grade(s, grades),
    hits,
    total: hits.length,
    byCat: countByCat(hits),
  };
}
