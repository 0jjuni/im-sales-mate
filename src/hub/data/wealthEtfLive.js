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

/* ── 세일즈 포인트 규칙엔진 ──
   상품 사실 + 실시간 흐름을 근거로 PB 상담 멘트를 '생성'한다(하드코딩 아님, 추적 가능).
   동일 유형 펀드 평균 보수(데모 기준) 대비 ETF 저보수를 핵심 강점으로 잡는다. */
const AVG_FUND_FEE = 1.3;

const focusLine = (product) => {
  const c = product.category || "";
  if (c.includes("반도체")) return "반도체 밸류체인에 집중 — 업황 반등 국면에서 탄력적";
  if (c.includes("미국") || c.includes("해외주식")) return "미국 대형주에 폭넓게 분산 — 장기 핵심 자산";
  if (c.includes("배당")) return "배당주 중심 — 현금흐름을 원하는 고객에게 적합";
  if (c.includes("테마")) return "성장 테마 집중 — 기대수익과 변동성이 함께 큼";
  if (c.includes("원자재") || c.includes("금")) return "금 등 실물자산 — 인플레이션·안전자산 분산 목적";
  if (c.includes("채권")) return "채권형 — 안정적 이자수취 중심, 변동성 낮음";
  if (c.includes("국내주식")) return "국내 대표주 분산 — 코어 포지션에 적합";
  return "지수·바스켓 분산 상품";
};

export const deriveEtfPitch = (product, quote) => {
  const points = [];
  const chg = quote?.changePct;

  /* 1) 오늘 흐름 */
  if (chg != null) {
    if (chg >= 1) points.push({ tone: "up", title: `오늘 +${chg.toFixed(2)}% 상승 흐름`, detail: "관심 고객에게 진입 문의 타이밍으로 안내하기 좋습니다." });
    else if (chg <= -1) points.push({ tone: "down", title: `오늘 ${chg.toFixed(2)}% 조정`, detail: "저가 분할매수·적립식 시작 관점으로 제안할 수 있습니다." });
    else points.push({ tone: "flat", title: `오늘 ${chg > 0 ? "+" : ""}${chg.toFixed(2)}% 보합`, detail: "변동이 크지 않아 신규 적립 시작을 부담 없이 권할 수 있습니다." });
  }

  /* 2) 저보수(ETF 핵심 강점) */
  const save = Math.max(0, AVG_FUND_FEE - product.fee);
  points.push({
    tone: "im",
    title: `총보수 연 ${product.fee}% — 저비용`,
    detail: `유사 유형 펀드 평균(약 ${AVG_FUND_FEE}%) 대비 연 ${save.toFixed(2)}%p 낮아, 장기·적립식일수록 유리합니다.`,
  });

  /* 3) 투자 포커스 */
  points.push({ tone: "slate", title: focusLine(product), detail: `분류: ${product.category}` });

  /* 4) 적립식 제안 */
  points.push({ tone: "slate", title: "적립식으로 변동성 분산", detail: "매월 정액 매수 시 진입가를 평준화 — 상세의 적립식 시뮬레이터로 예상 평가액을 함께 보여주세요." });

  /* 5) 위험 고지(필수) */
  points.push({
    tone: "warn",
    title: `${riskName(product.risk)}(${product.risk}등급) · 원금손실 가능`,
    detail: "투자설명서 교부·상품 설명 의무를 반드시 이행하세요. 과거 수익률은 미래를 보장하지 않습니다.",
  });

  return points;
};

/* 고객 응대용 한 문단 스크립트(복사용) */
export const buildEtfScript = (product, quote) => {
  const chg = quote?.changePct;
  const flow =
    chg == null ? "" : chg >= 1 ? ` 오늘은 +${chg.toFixed(1)}% 흐름이라 관심 있으실 때 진입을 검토해 보셔도 좋습니다.` : chg <= -1 ? ` 오늘은 ${chg.toFixed(1)}% 조정이라 나눠서 담기 시작하기에도 부담이 적습니다.` : "";
  const save = Math.max(0, AVG_FUND_FEE - product.fee);
  return (
    `고객님, ${product.name}는 ${focusLine(product).split(" — ")[0]}하는 ETF입니다. ` +
    `총보수가 연 ${product.fee}%로 비슷한 펀드보다 약 ${save.toFixed(2)}%p 낮아 오래 보유하실수록 비용 면에서 유리합니다.${flow} ` +
    `다만 ${riskName(product.risk)} 상품으로 원금손실 가능성이 있어 이 점은 함께 안내드립니다.`
  );
};
