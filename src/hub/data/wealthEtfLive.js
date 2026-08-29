/* ETF 시세 조회 계층(조회 전용 — 매매/주문 없음).
   ETF는 거래소 상품이라 시세를 API로 당겨 온다.
   - Yahoo Finance 차트 API를 조회한다(키·계좌·IP 허용목록 불필요, 배포에서도 동작).
     dev는 Vite /yahoo 프록시, 배포는 /api/quote 서버리스가 대신 부른다(둘 다 같은 Yahoo API).
   - KRX는 약 15분 지연 시세. 실패하면 '모의'로 폴백(화면엔 「모의 시세」 표기).
   ⚠ 실서비스에서는 사내 실시간 ETF 소스를 이 어댑터로 연결하면 화면은 그대로 동작한다. */

import { riskName } from "./wealthProducts";

/* 카탈로그 ETF ↔ KRX 종목코드(실제) — Yahoo 심볼 <code>.KS 조회 키 */
export const ETF_KRX = {
  "etf-nasdaq": "133690", // TIGER 미국나스닥100
  "etf-sp500": "379800", // KODEX 미국S&P500
  "etf-kospi200": "069500", // KODEX 200
  "etf-dividend": "458730", // TIGER 미국배당다우존스
  "etf-gold": "132030", // KODEX 골드선물(H)
  "etf-bond10": "152380", // KODEX 국고채10년
  "etf-battery": "305540", // TIGER 2차전지테마
};

/* 모의 실시간용 기준 현재가(원) — 실제와 무관한 데모 표시값 */
const BASE_PRICE = {
  "etf-nasdaq": 152340,
  "etf-sp500": 18760,
  "etf-kospi200": 37250,
  "etf-dividend": 13980,
  "etf-gold": 22470,
  "etf-bond10": 51230,
  "etf-battery": 8320,
};

const mulberry32 = (a) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const seedOf = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h >>> 0;
};

/* 장중 진행도(0~1) — 09:00~15:30. 장외에는 종가 고정(1) */
const sessionProgress = (d) => {
  const m = d.getHours() * 60 + d.getMinutes();
  const open = 9 * 60;
  const close = 15 * 60 + 30;
  if (m <= open) return 0;
  if (m >= close) return 1;
  return (m - open) / (close - open);
};

/* 위험등급이 높을수록 일중 변동폭을 크게(1등급≈±3% 수준) */
const dayAmplitude = (risk) => (7 - (risk ?? 3)) * 0.6;

/* 한 종목의 모의 실시간 스냅샷 — 종목·날짜별 결정론적이라 새로고침해도 흐름이 일관 */
const mockQuote = (product) => {
  const now = new Date();
  const dayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const rng = mulberry32(seedOf(product.id + dayKey));
  const base = BASE_PRICE[product.id] ?? 10000;
  const amp = dayAmplitude(product.risk);
  const prog = sessionProgress(now);

  /* 일중 종가 방향(오늘의 등락)과 경로 */
  const dayTarget = (rng() - 0.5) * 2 * amp; // 오늘 최종 등락률(%)
  const n = 40;
  const series = [];
  let last = 0;
  for (let i = 0; i < n; i++) {
    const f = i / (n - 1);
    if (f > prog + 1e-9) break; // 아직 도래하지 않은 시간은 그리지 않음
    const noise = (rng() - 0.5) * 2 * amp * 0.5 * Math.sqrt(f + 0.05);
    last = dayTarget * f + noise;
    series.push({ t: now.getTime() - (prog - f) * 6.5 * 3600000, c: base * (1 + last / 100) });
  }
  if (series.length < 2) {
    series.push({ t: now.getTime() - 1000, c: base }, { t: now.getTime(), c: base });
    last = 0;
  }
  const price = series[series.length - 1].c;
  const changePct = last;
  const volume = Math.round((200000 + rng() * 1800000) * (amp / 2 + 0.5));
  return {
    price: Math.round(price),
    changePct: Math.round(changePct * 100) / 100,
    volume,
    series,
  };
};

const mockQuotes = (etfs) => Object.fromEntries(etfs.map((p) => [p.id, mockQuote(p)]));

/* dev는 Vite /yahoo 프록시, 배포는 /api/quote 서버리스 (둘 다 Yahoo 차트 API) */
const chartUrl = (code, interval, range) =>
  import.meta.env.DEV
    ? `/yahoo/v8/finance/chart/${code}.KS?interval=${interval}&range=${range}`
    : `/api/quote?symbol=${code}.KS&interval=${interval}&range=${range}`;

/* Yahoo 차트 JSON → {price, changePct, volume, series}.
   intraday(분봉)면 등락은 전일종가(meta.chartPreviousClose) 대비, 일봉이면 직전 종가 대비 */
const parseYahoo = (json, useMetaPrev) => {
  const r = json?.chart?.result?.[0];
  const ts = r?.timestamp;
  const q = r?.indicators?.quote?.[0];
  const closes = q?.close;
  if (!ts || !closes) return null;
  const rows = ts.map((t, i) => [t, closes[i], q?.volume?.[i]]).filter(([, c]) => c != null);
  if (rows.length < 1) return null;
  const price = rows[rows.length - 1][1];
  const secondLast = rows.length >= 2 ? rows[rows.length - 2][1] : null;
  const metaPrev = r?.meta?.chartPreviousClose ?? null;
  const prev = useMetaPrev ? metaPrev ?? secondLast ?? price : secondLast ?? metaPrev ?? price;
  const lastVol = [...rows].reverse().find(([, , v]) => v != null)?.[2] ?? null;
  return {
    price: Math.round(price),
    changePct: prev ? Math.round(((price - prev) / prev) * 10000) / 100 : 0,
    volume: lastVol,
    series: rows.map(([t, c]) => ({ t: t * 1000, c })),
  };
};

/* 한 종목 조회 — 장중이면 분봉(1d/5m), 장외·주말이면 일봉(1mo/1d)으로 폴백 */
const fetchOne = async (product) => {
  const code = ETF_KRX[product.id];
  if (!code) return null;
  for (const [interval, range] of [["5m", "1d"], ["1d", "1mo"]]) {
    try {
      const res = await fetch(chartUrl(code, interval, range), { cache: "no-store" });
      if (!res.ok) continue;
      const parsed = parseYahoo(await res.json(), interval === "5m");
      if (parsed && parsed.series.length >= 2) return parsed;
    } catch {
      /* 다음 폴백 */
    }
  }
  return null;
};

/* ETF 시세 조회(조회 전용) — Yahoo(약 15분 지연). 실패 시 모의. 항상 {live, quotes} 반환 */
export async function fetchEtfQuotes(etfs) {
  if (!etfs || etfs.length === 0) return { live: false, quotes: {} };
  try {
    const entries = await Promise.all(etfs.map(async (p) => [p.id, await fetchOne(p)]));
    const quotes = Object.fromEntries(entries.filter(([, v]) => v));
    if (Object.keys(quotes).length) return { live: true, quotes };
  } catch {
    /* 조회 실패 → 모의 */
  }
  return { live: false, quotes: mockQuotes(etfs) };
}

/* ── 고객 설명 포인트 ──
   PB가 고객에게 설명하는 '사실'만 간결하게. 마케팅·권유 문구는 넣지 않는다.
   편입 종목은 상세의 '편입 종목' 섹션에서 별도로 보여준다. */
const focusLine = (product) => {
  const c = product.category || "";
  if (c.includes("반도체")) return "반도체 기업에 집중 투자";
  if (c.includes("미국") || c.includes("해외주식")) return "미국 대형주에 분산 투자";
  if (c.includes("배당")) return "배당주 중심 — 분배금 지급";
  if (c.includes("테마")) return "성장 테마 집중 — 변동성 큼";
  if (c.includes("원자재") || c.includes("금")) return "금 등 실물자산에 투자";
  if (c.includes("채권")) return "채권에 투자 — 변동성 낮음";
  if (c.includes("국내주식")) return "국내 대표주에 분산 투자";
  return "지수·바스켓에 분산 투자";
};

/* ETF 실제 상위 편입 종목(대표 구성). 비중은 참고용 근사치 —
   지수 리밸런싱으로 수시로 바뀌며, 실서비스는 운용사/KRX 실데이터로 교체한다. */
export const ETF_HOLDINGS = {
  "etf-nasdaq": [["엔비디아", 8.9], ["애플", 8.1], ["마이크로소프트", 7.6], ["브로드컴", 5.0], ["아마존", 4.8], ["메타 플랫폼스", 4.3]],
  "etf-sp500": [["엔비디아", 7.3], ["애플", 6.5], ["마이크로소프트", 6.2], ["아마존", 3.9], ["메타 플랫폼스", 2.6], ["브로드컴", 2.4]],
  "etf-kospi200": [["삼성전자", 29.8], ["SK하이닉스", 9.4], ["LG에너지솔루션", 3.1], ["삼성바이오로직스", 2.8], ["현대차", 2.4]],
  "etf-dividend": [["코카콜라", 4.4], ["시스코", 4.2], ["텍사스인스트루먼트", 4.1], ["암젠", 4.0], ["펩시코", 3.9], ["셰브론", 3.7]],
  "etf-gold": [["금 선물(COMEX)", 97.0], ["현금성 자산", 3.0]],
  "etf-bond10": [["국고채권 10년 지표물", 42.0], ["국고채권(잔존 8~12년)", 41.0], ["기타 국고채·현금성", 17.0]],
  "etf-battery": [["에코프로비엠", 11.2], ["포스코퓨처엠", 9.8], ["에코프로", 8.6], ["엘앤에프", 7.4], ["LG에너지솔루션", 6.3]],
};

export const etfCustomerPoints = (product) => [
  focusLine(product),
  `총보수 연 ${product.fee}%`,
  `위험등급 ${product.risk}등급 · ${riskName(product.risk)} (원금손실 가능)`,
  "거래소 상장 — 실시간 매매로 환금 쉬움",
];
