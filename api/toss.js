/* 토스증권 Open API 시세 프록시 (Vercel 서버리스 함수) — ETF 실시간 시세용.

   토스 Open API는 OAuth2 Client Credentials로 서버간 토큰을 받고, client_secret은
   절대 브라우저에 노출하면 안 되므로 이 서버리스 함수가 대신 호출한다.

   ⚠ 활성화 방법: Vercel 환경변수에 TOSS_CLIENT_ID / TOSS_CLIENT_SECRET 을 넣으면
     실시간이 켜진다. 없으면 501을 반환하고, 프런트(wealthEtfLive.js)가 '모의 실시간'으로
     폴백하므로 데모는 키 없이도 항상 돌아간다.

   ⚠ 아래 엔드포인트·응답 필드명은 공개 가이드 기준의 best-effort다. 실제 키로 붙일 때
     공식 문서(OpenAPI JSON)로 토큰 URL·시세 경로·필드명을 한 번 확인해 맞출 것.
     - 토큰:  POST https://openapi.tossinvest.com/oauth2/token  (client_credentials)
     - 현재가: GET  https://openapi.tossinvest.com/v1/market/price?symbol=<code>
     - 캔들:   GET  https://openapi.tossinvest.com/v1/market/candles?symbol=<code>&interval=1m */

const TOKEN_URL = "https://openapi.tossinvest.com/oauth2/token";
const BASE = "https://openapi.tossinvest.com";

/* 열린 프록시 방지 — 6자리 KRX 코드만 허용, 최대 10개 */
const isCode = (s) => /^\d{6}$/.test(s);

async function getToken() {
  const id = process.env.TOSS_CLIENT_ID;
  const secret = process.env.TOSS_CLIENT_SECRET;
  if (!id || !secret) return null;
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: id, client_secret: secret }),
  });
  if (!res.ok) throw new Error(`token ${res.status}`);
  const j = await res.json();
  return j.access_token || j.accessToken || null;
}

async function fetchPrice(code, token) {
  const headers = { Authorization: `Bearer ${token}` };
  const [priceRes, candleRes] = await Promise.all([
    fetch(`${BASE}/v1/market/price?symbol=${code}`, { headers }),
    fetch(`${BASE}/v1/market/candles?symbol=${code}&interval=1m`, { headers }).catch(() => null),
  ]);
  if (!priceRes.ok) throw new Error(`price ${priceRes.status}`);
  const p = await priceRes.json();
  /* 공식 필드명은 문서로 확인해 매핑을 맞출 것 */
  const price = p.price ?? p.currentPrice ?? p.close ?? null;
  const changePct = p.changeRate ?? p.changePercent ?? p.fluctuationRate ?? null;
  const volume = p.volume ?? p.accVolume ?? null;
  let series = [];
  if (candleRes && candleRes.ok) {
    const c = await candleRes.json();
    const rows = c.candles || c.data || [];
    series = rows
      .map((r) => ({ t: new Date(r.time ?? r.timestamp ?? r.dt).getTime(), c: r.close ?? r.price }))
      .filter((x) => x.c != null && !Number.isNaN(x.t));
  }
  return { price, changePct, volume, series };
}

export default async function handler(req, res) {
  const raw = String(req.query.symbols || "");
  const codes = raw.split(",").map((s) => s.trim()).filter(isCode).slice(0, 10);
  if (codes.length === 0) {
    res.status(400).json({ error: "no valid symbols" });
    return;
  }
  try {
    const token = await getToken();
    if (!token) {
      /* 키 미설정 — 프런트가 모의 실시간으로 폴백 */
      res.status(501).json({ error: "toss open api not configured" });
      return;
    }
    const entries = await Promise.all(
      codes.map(async (code) => {
        try {
          return [code, await fetchPrice(code, token)];
        } catch {
          return [code, null];
        }
      })
    );
    const quotes = Object.fromEntries(entries.filter(([, v]) => v));
    res.setHeader("Cache-Control", "s-maxage=5, stale-while-revalidate=30");
    res.status(200).json({ quotes });
  } catch {
    res.status(502).json({ error: "toss upstream failed" });
  }
}
