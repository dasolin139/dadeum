// WTP(지불 의사) 신호 수집 엔드포인트.
// Vercel 파일시스템은 휘발성이므로 파일 대신 console.log 로 남기고(=Vercel 로그에 캡처),
// INTENT_WEBHOOK_URL 이 있으면 그쪽으로도 POST 한다. 의존성 없이 단순하게.

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    return jsonError("요청 형식이 올바르지 않습니다.", 400);
  }

  const plan = typeof body.plan === "string" ? body.plan : "unknown";
  const email = typeof body.email === "string" ? body.email.slice(0, 200) : "";
  const ts =
    typeof body.ts === "number" || typeof body.ts === "string"
      ? body.ts
      : Date.now();

  const event = {
    type: "wtp_intent",
    plan,
    email,
    ts,
    receivedAt: new Date().toISOString(),
    ua: req.headers.get("user-agent") || "",
  };

  // 1) Vercel 로그에 한 줄 JSON 으로 남긴다.
  console.log(JSON.stringify(event));

  // 2) 웹훅이 설정돼 있으면 전달 (실패해도 사용자 응답은 성공 처리).
  const webhook = process.env.INTENT_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(event),
      });
    } catch {
      // 웹훅 실패는 조용히 무시 — WTP 신호는 이미 로그에 남았다.
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
