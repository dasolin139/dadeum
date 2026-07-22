// 다듬 · 점검 엔진 회귀 테스트 (node --test, 의존성 0)
//
// 두 코퍼스로 규칙 품질을 고정한다.
//  · recall    : AI 티가 분명한 문장 → 반드시 1곳 이상 잡아야 한다.
//  · precision : 사람이 자연스럽게 쓴 문장 → 오탐(false positive) 0 이어야 한다.
// 신규 규칙을 추가할 때 precision 이 깨지면(자연 문장을 잡으면) 라이브 반영 금지.

import { test } from "node:test";
import assert from "node:assert/strict";
import { analyze } from "./engine.mjs";

// ── recall: [문장, 반드시 잡혀야 하는 카테고리] ──
const RECALL = [
  ["이 문제는 앞으로 신중하게 생각됩니다.", "passive"],
  ["저희 제품은 최고의 경험을 제공합니다.", "inanimate"],
  ["\n또한 우리는 계속해서 노력한다.", "conjunction"],
  ["그것은 우리에게 큰 힘이 됩니다.", "pronoun"],
  ["제품을 개선하는 것이 중요합니다.", "nominal"],
  ["빠르고, 간편하며, 안전하게 만들어 줍니다.", "triple"],
  ["이번 조사에서 만족도가 높은 것으로 나타났다.", "report"],
  ["그것은 사실상 성공이라고 할 수 있다.", "hedge"],
  ["가장 중요한 것은 꾸준함이라는 점이다.", "frame"],
  ["여러 기능들과 다양한 정보들을 담았습니다.", "plural"],
  ["서비스는 지속적으로 개선되고 있습니다.", "passive"],
];

// ── precision: 자연 문장 (경계 사례 포함) → 오탐 0 이어야 한다 ──
const PRECISION = [
  "어제 친구랑 저녁을 먹고 오랜만에 긴 이야기를 나눴다.",
  "이 카페는 창가 자리가 좋아서 자주 온다.",
  "비가 와서 우산을 챙겨 나왔는데 금방 그쳤다.",
  "그 영화는 생각보다 별로였어. 다음엔 다른 걸 보자.",
  "회의는 세 시에 시작하니까 그 전에 자료만 정리해두면 돼.",
  "김치찌개를 끓이려면 먼저 돼지고기를 볶아야 한다.",
  "새로 산 신발이 발에 잘 맞아서 마음에 든다.",
  "사람들이 광장에 많이 모였다.",
  // 경계 사례: 신규 규칙 트리거와 닮았지만 잡히면 안 되는 것들
  "문이 열리는 것으로 하루가 시작된다.", // report: 보고 동사 아님
  "그렇다고 해서 할 일이 사라지는 건 아니다.", // hedge: '할 수 있다' 아님
  "중요한 것은 이미 우리 손을 떠났다.", // frame: 상투 종결 아님
];

test("recall: AI 티 문장은 최소 1곳 이상 잡는다", () => {
  for (const [text, cat] of RECALL) {
    const r = analyze(text);
    assert.ok(r.total >= 1, `잡히지 않음: "${text}"`);
    assert.ok(
      r.byCat[cat] >= 1,
      `카테고리 '${cat}' 미검출: "${text}" (검출: ${JSON.stringify(r.byCat)})`,
    );
  }
});

test("precision: 자연 문장은 오탐 0", () => {
  for (const text of PRECISION) {
    const r = analyze(text);
    assert.equal(
      r.total,
      0,
      `오탐 발생: "${text}" → ${JSON.stringify(r.byCat)}`,
    );
  }
});

test("score: AI 밀집 글은 자연 글보다 낮은 점수", () => {
  const ai =
    "저희의 제품은 지속적으로 개선되고 있으며, 더 나은 경험을 제공합니다. 뿐만 아니라, 다양한 기능들이 추가되었고, 이러한 변화들은 워크플로우를 효율적으로 만들어 줍니다. 그리고 저희는 여러분의 피드백에 귀를 기울이는 것이 중요하다고 생각됩니다. 그것은 큰 힘이 됩니다.";
  const clean =
    "지난 주말에 오랜만에 부모님 댁에 다녀왔다. 마당의 감나무가 제법 자라 있었고, 저녁으로는 어머니가 끓인 된장찌개를 먹었다. 돌아오는 길에는 하늘이 유난히 맑았다.";
  const aiScore = analyze(ai).score;
  const cleanScore = analyze(clean).score;
  assert.ok(
    aiScore < cleanScore,
    `점수 역전: ai=${aiScore} clean=${cleanScore}`,
  );
  assert.ok(cleanScore >= 80, `자연 글 점수가 낮음: ${cleanScore}`);
});

test("빈 입력·공백은 안전하게 0 히트", () => {
  assert.equal(analyze("").total, 0);
  assert.equal(analyze("   \n  ").total, 0);
});
