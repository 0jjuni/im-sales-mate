/* ETF 실시간 시세 계층.
   ETF는 거래소 실시간 상품이므로 시세를 API로 당겨 온다.
   - 배포에서 토스증권 Open API 서버리스 프록시(/api/toss)가 있으면 그걸 쓰고(live:true),
     없거나 실패하면 '모의 실시간'으로 폴백한다(live:false, 화면엔 「실시간(모의)」 표기).
   - 공모전 데모는 키 없이도 항상 돌아가야 하므로 모의 폴백이 기본, 키를 넣으면 진짜 실시간이 된다.
   ⚠ 실서비스에서는 사내 실시간 ETF 소스를 이 어댑터로 연결하면 화면은 그대로 동작한다. */

import { riskName } from "./wealthProducts";

/* 카탈로그 ETF ↔ KRX 종목코드(실제) — 토스/사내 API 조회 키 */
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

/* 토스 프록시 응답 → 화면 형태로 정규화(스키마는 api/toss.js에서 맞춘다) */
const normalize = (data, etfs) => {
  const byCode = data.quotes || {};
  const out = {};
  for (const p of etfs) {
    const q = byCode[ETF_KRX[p.id]];
    if (!q) continue;
    out[p.id] = {
      price: q.price,
      changePct: q.changePct,
      volume: q.volume ?? null,
      series: Array.isArray(q.series) ? q.series : [],
    };
  }
  return out;
};

/* ETF 시세 조회 — 프록시 우선, 실패 시 모의. 항상 {live, quotes} 반환 */
export async function fetchEtfQuotes(etfs) {
  if (!etfs || etfs.length === 0) return { live: false, quotes: {} };
  try {
    const codes = etfs.map((p) => ETF_KRX[p.id]).filter(Boolean).join(",");
    const res = await fetch(`/api/toss?symbols=${codes}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const quotes = normalize(data, etfs);
      if (Object.keys(quotes).length) return { live: true, quotes };
    }
  } catch {
    /* 프록시 없음/실패 → 모의 */
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

export const etfCustomerPoints = (product) => [
  focusLine(product),
  `총보수 연 ${product.fee}%`,
  `위험등급 ${product.risk}등급 · ${riskName(product.risk)} (원금손실 가능)`,
  "거래소 상장 — 실시간 매매로 환금 쉬움",
];
