/* 마켓 보드 시세 조회.

   Yahoo Finance 차트 API는 브라우저 직접 호출이 CORS로 막히므로 같은 배포의
   서버리스 함수(api/quote.js)를 경유한다. 개발 서버(vite)에는 그 함수가 없어
   공개 프록시(corsproxy.io)로 우회한다 — 이 프록시는 무료 플랜이 localhost에서만
   동작하므로 개발 전용이다. 배포에서 쓰면 403이 난다.

   ⚠ 비공식 API라 언제든 끊길 수 있다. 실서비스에서는 제안서에 적은 대로
     Apps Script가 매일 아침 시세를 구글시트에 적재하고 사이트가 그 시트를 읽는다.
     조회 실패 시 화면이 비지 않도록 대체 데이터로 물러난다(호출부에서 처리).

   ⚠ 국고채 3년 금리는 브라우저에서 받을 수 있는 무료 소스가 없어 제외하고,
     금리 방향 지표로 미국 10년물을 넣었다. */

const DEV_PROXY = "https://corsproxy.io/?url=";
const CHART = (symbol, interval, range) =>
  `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;

/* 심볼·기간을 바꾸면 api/quote.js의 허용 목록도 함께 고칠 것 */
const quoteUrl = (symbol, interval = "1d", range = "10d") =>
  import.meta.env.DEV
    ? DEV_PROXY + encodeURIComponent(CHART(symbol, interval, range))
    : `/api/quote?symbol=${encodeURIComponent(symbol)}&interval=${interval}&range=${range}`;

/* 상담용 기간 선택 — 적립식 추천 시 장기 추이를 함께 보여줄 수 있게.
   장기는 간격을 넓혀(주/월봉) 포인트 수를 적정 유지한다. */
export const PERIODS = [
  { key: "10d", label: "10일", range: "10d", interval: "1d" },
  { key: "1y", label: "1년", range: "1y", interval: "1d" },
  { key: "5y", label: "5년", range: "5y", interval: "1wk" },
  { key: "10y", label: "10년", range: "10y", interval: "1mo" },
];

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
    /* 스파크라인·상세 차트용 일별 종가 시계열(그대로 재사용, 추가 조회 없음) */
    series: pairs.map(([t, c]) => ({ t: t * 1000, c })),
  };
};

const fetchOne = async ({ label, symbol, format }) => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(quoteUrl(symbol), { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const parsed = parseChart(await res.json());
    if (!parsed) throw new Error("파싱 실패");
    return {
      label,
      symbol,
      format,
      value: formatValue(parsed.close, format),
      change: Number(parsed.change.toFixed(2)),
      close: parsed.close,
      prevClose: parsed.prevClose,
      asOf: parsed.asOf,
      series: parsed.series,
    };
  } finally {
    clearTimeout(timer);
  }
};

/* 특정 지표의 특정 기간 시계열만 조회(상세 모달의 기간 전환용).
   실패 시 throw — 호출부에서 기존 시리즈 유지 등으로 처리. */
export const fetchSeries = async (symbol, periodKey) => {
  const p = PERIODS.find((x) => x.key === periodKey) || PERIODS[0];
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(quoteUrl(symbol, p.interval, p.range), { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const r = json?.chart?.result?.[0];
    const ts = r?.timestamp;
    const closes = r?.indicators?.quote?.[0]?.close;
    if (!ts || !closes) throw new Error("파싱 실패");
    const series = ts
      .map((t, i) => [t, closes[i]])
      .filter(([, c]) => c != null)
      .map(([t, c]) => ({ t: t * 1000, c }));
    if (series.length < 2) throw new Error("시계열 부족");
    return series;
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
    markets: results.map(({ label, symbol, format, value, change, close, prevClose, series }) => ({
      label,
      symbol,
      format,
      value,
      change,
      close,
      prevClose,
      series,
    })),
    asOf: latest ?? null,
  };
};
