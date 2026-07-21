// 아주 단순한 인메모리 IP 레이트 리밋 (요금 폭탄 방지용, best-effort).
// 주의: 서버리스/멀티 인스턴스 환경에서는 인스턴스별로 카운트가 분리되므로
// 완벽한 제한이 아니다. 어디까지나 1차 방어선이다. 강한 제한이 필요하면
// AI Gateway 대시보드의 per-user rate limit 또는 KV 기반 리밋을 붙인다.

const WINDOW_MS = 10 * 60 * 1000; // 10분
const MAX_REQUESTS = 8; // IP당 10분에 8회

const hits = new Map<string, number[]>();

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export function getClientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}
