/* 마켓 보드 시세 조회.

   데모는 Vercel 정적 배포라 서버가 없어 브라우저에서 직접 조회한다.
   Yahoo Finance 차트 API는 브라우저에서 직접 호출하면 CORS로 막히므로
   공개 CORS 프록시를 경유한다.

   ⚠ 한계 — 무료 서드파티 프록시와 비공식 API에 의존하므로 언제든 끊길 수 있다.
     실서비스에서는 제안서에 적은 대로 Apps Script가 매일 아침 시세를 구글시트에
     적재하고 사이트가 그 시트를 읽는 방식으로 바꾼다. 조회에 실패하면 화면이
     비지 않도록 예시 데이터로 물러난다(fetchMarketQuotes 호출부에서 처리).

   ⚠ 국고채 3년 금리는 브라우저에서 받을 수 있는 무료 소스가 없어 제외하고,
     금리 방향 지표로 미국 10년물을 넣었다. */

const PROXY = "https://corsproxy.io/?url=";
const CHART = (symbol) =>
  `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=10d`;

/* 표시 순서대로. format은 값 표기 방식 */
const SYMBOLS = [
  { label: "KOSPI", symbol: "^KS11", format: "index" },
  { label: "KOSDAQ", symbol: "^KQ11", format: "index" },
  { label: "S&P 500", symbol: "^GSPC", format: "index" },
  { label: "나스닥", symbol: "^IXIC", format: "index" },
  { label: "USD/KRW", symbol: "KRW=X", format: "fx" },
  { label: "미국 10년물", symbol: "^TNX", format: "rate" },
];

const REQUEST_TIMEOUT_MS = 8000;

const formatValue = (v, format) => {
  if (v == null) return "-";
  if (format === "rate") return `${v.toFixed(2)}%`;
  if (format === "fx") return v.toLocaleString("ko-KR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return v.toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/* 일별 종가 배열에서 마지막 두 개(당일·전일)를 뽑는다.
   meta.chartPreviousClose는 조회 구간 이전 종가라 등락률 계산에 쓰면 안 된다. */
const parseChart = (json) => {
  const res = json?.chart?.result?.[0];
  const ts = res?.timestamp;
  const closes = res?.indicators?.quote?.[0]?.close;
  if (!ts || !closes) return null;

  const pairs = ts.map((t, i) => [t, closes[i]]).filter(([, c]) => c != null);
  if (pairs.length < 2) return null;

  const [lastTs, close] = pairs[pairs.length - 1];
  const [, prevClose] = pairs[pairs.length - 2];
  return {
    close,
    prevClose,
    change: ((close - prevClose) / prevClose) * 100,
    asOf: new Date(lastTs * 1000),
  };
};

const fetchOne = async ({ label, symbol, format }) => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(PROXY + encodeURIComponent(CHART(symbol)), { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const parsed = parseChart(await res.json());
    if (!parsed) throw new Error("파싱 실패");
    return {
      label,
      value: formatValue(parsed.close, format),
      change: Number(parsed.change.toFixed(2)),
      asOf: parsed.asOf,
    };
  } finally {
    clearTimeout(timer);
  }
};

/* 6개 지표를 동시에 조회한다. 하나라도 실패하면 부분 결과를 쓰지 않고
   전체를 실패로 보고 호출부가 예시 데이터로 물러나게 한다 —
   일부만 실시간이면 어느 숫자가 진짜인지 알 수 없어 오히려 위험하다. */
export const fetchMarketQuotes = async () => {
  const results = await Promise.all(SYMBOLS.map(fetchOne));
  const latest = results
    .map((r) => r.asOf)
    .filter(Boolean)
    .sort((a, b) => b - a)[0];

  return {
    markets: results.map(({ label, value, change }) => ({ label, value, change })),
    asOf: latest ?? null,
  };
};
