/* 마켓 보드 시세 프록시 (Vercel 서버리스 함수).

   Yahoo Finance 차트 API는 브라우저 직접 호출이 CORS로 막힌다. 처음에는 공개
   프록시(corsproxy.io)를 썼지만 무료 플랜이 localhost에서만 동작해 배포 도메인에서
   403이 났다. 같은 배포에 서버리스 함수를 두면 서드파티 의존 없이 해결된다.

   열린 프록시가 되지 않도록 심볼을 허용 목록으로 제한한다. 목록을 바꿀 때는
   src/hub/data/marketQuotes.js의 SYMBOLS와 함께 고칠 것. */

const ALLOWED_SYMBOLS = new Set(["^KS11", "^KQ11", "^GSPC", "^IXIC", "KRW=X", "^TNX"]);

export default async function handler(req, res) {
  const symbol = req.query.symbol;
  if (!ALLOWED_SYMBOLS.has(symbol)) {
    res.status(400).json({ error: "unknown symbol" });
    return;
  }

  try {
    const upstream = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
        symbol
      )}?interval=1d&range=10d`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    if (!upstream.ok) {
      res.status(502).json({ error: `upstream ${upstream.status}` });
      return;
    }
    const json = await upstream.json();

    /* 시세는 분 단위면 충분 — CDN에 60초 캐시해 야후 호출을 줄인다 */
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    res.status(200).json(json);
  } catch {
    res.status(502).json({ error: "upstream fetch failed" });
  }
}
