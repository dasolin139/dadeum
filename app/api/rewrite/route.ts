import { streamText } from "ai";
import { createGateway } from "@ai-sdk/gateway";
import { MAX_CHARS, DEFAULT_MODEL } from "@/lib/constants";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompt";
import { isRateLimited, getClientIp } from "@/lib/rateLimit";

// Node 런타임 (AI SDK 스트리밍 + 환경변수 사용).
export const runtime = "nodejs";
export const maxDuration = 60;

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function POST(req: Request) {
  // 1) 키 없으면 명확한 503 — 앱은 죽지 않고 UI 가 데모 안내로 폴백한다.
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) {
    return jsonError(
      "지금은 데모 예시를 확인해 주세요. (서비스 준비 중입니다)",
      503,
    );
  }

  // 2) IP 레이트 리밋 (요금 폭탄 방지, best-effort)
  const ip = getClientIp(req.headers);
  if (isRateLimited(ip)) {
    return jsonError(
      "잠시 후 다시 시도해 주세요. 짧은 시간에 요청이 너무 많았어요.",
      429,
    );
  }

  // 3) 입력 파싱 및 검증
  let text = "";
  try {
    const body = await req.json();
    text = typeof body?.text === "string" ? body.text : "";
  } catch {
    return jsonError("요청 형식이 올바르지 않습니다.", 400);
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return jsonError("다듬을 글을 입력해 주세요.", 400);
  }
  if (text.length > MAX_CHARS) {
    return jsonError(`글자 수는 ${MAX_CHARS}자까지 지원해요.`, 400);
  }

  // 4) AI Gateway 로 스트리밍 윤문
  try {
    const gateway = createGateway({ apiKey });
    const modelId = process.env.REWRITE_MODEL || DEFAULT_MODEL;

    const result = streamText({
      model: gateway(modelId),
      system: SYSTEM_PROMPT,
      prompt: buildUserPrompt(trimmed),
      temperature: 0.4,
    });

    return result.toTextStreamResponse();
  } catch {
    // 내부 오류 세부사항은 절대 노출하지 않는다.
    return jsonError(
      "다듬는 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요.",
      500,
    );
  }
}
