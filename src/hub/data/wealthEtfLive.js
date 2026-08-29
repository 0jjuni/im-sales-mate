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

/* ── 세일즈 포인트 규칙엔진 (PB·비이자이익 관점) ──
   ETF는 저보수·위탁수수료 중심이라 '직접판매' 자체는 은행 수익이 얇다.
   그래서 세일즈 포인트는 '고객 혜택'이 아니라 '어떻게 팔면 비이자이익이 남는가'
   — 연계판매(신탁/랩 래핑·액티브 펀드), 연금·ISA 계좌 유치, 자산 리텐션 — 로 짠다.
   저비용·분산 같은 고객 혜택은 '고객 설득용'으로 명확히 구분 표기한다.
   상품 사실 + 실시간 흐름 기반 생성(하드코딩 아님, 추적 가능). */
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

/* 유형별 연계판매(비이자이익) 제안 — 은행이 실제로 수익을 남기는 경로 */
const crossSell = (product) => {
  const c = product.category || "";
  if (c.includes("해외") || c.includes("미국") || c.includes("글로벌") || c.includes("반도체") || c.includes("헬스") || c.includes("테크")) {
    return "해외 ETF는 매매수수료+환전스프레드가 남습니다. ETF 편입 특정금전신탁·랩으로 감싸면 신탁·일임보수까지 확보되고, 동일 테마 해외 액티브 펀드(판매보수)도 대안입니다.";
  }
  if (c.includes("배당") || c.includes("인컴")) {
    return "월현금흐름 니즈 고객 → 인컴형 신탁·배당 펀드로 연계하면 판매·신탁보수를 확보할 수 있습니다.";
  }
  if (c.includes("채권") || c.includes("금") || c.includes("원자재")) {
    return "안정형 성향 → 채권형 펀드·ELB·특정금전신탁으로 연계해 비이자이익을 보완하세요.";
  }
  return "국내 액티브 펀드·랩으로 연계하거나, ISA·연금 계좌 내 편입으로 계좌 잔액을 키우세요.";
};

export const deriveEtfPitch = (product, quote) => {
  const points = [];
  const chg = quote?.changePct;

  /* 1) 수익 관점 — ETF 직접판매는 얇다(솔직하게) */
  points.push({
    tone: "warn",
    title: "수익 관점 — ETF 직접판매는 은행 수익이 얇음",
    detail: `ETF는 위탁매매 수수료(해외는 환전 포함) 중심이라, 판매보수가 붙는 펀드보다 건당 비이자이익이 작습니다(총보수 ${product.fee}%는 대부분 운용사 몫). 아래 연계로 수익을 키우세요.`,
  });

  /* 2) 연계 판매(핵심 수익 경로) */
  points.push({ tone: "im", title: "연계 판매로 비이자이익 확보", detail: crossSell(product) });

  /* 3) 계좌 유치·리텐션 */
  points.push({
    tone: "im",
    title: "계좌 유치·자산 리텐션",
    detail: "저비용 ETF를 안 주면 고객이 타사(토스·키움)로 이탈합니다. IRP·연금저축·ISA 안에서 담게 유도하면 세제혜택으로 만족도↑ + 계좌 잔액·재예치 기반을 은행에 붙잡아 둡니다.",
  });

  /* 4) 오늘 흐름 — 상담 명분 */
  if (chg != null) {
    if (chg >= 1) points.push({ tone: "up", title: `오늘 +${chg.toFixed(2)}% — 연락 명분`, detail: "관심·보유 고객에게 '오늘 흐름' 안부로 접점을 만들어 연계 상담으로 잇기 좋습니다." });
    else if (chg <= -1) points.push({ tone: "down", title: `오늘 ${chg.toFixed(2)}% 조정 — 상담 명분`, detail: "저가 분할매수·적립식 제안 명분. 신규 계좌·적립 약정으로 연결하세요." });
    else points.push({ tone: "flat", title: `오늘 ${chg > 0 ? "+" : ""}${chg.toFixed(2)}% 보합`, detail: "변동이 크지 않아 신규 적립 약정을 부담 없이 권하기 좋은 국면입니다." });
  }

  /* 5) 고객 설득 포인트(고객에게 강조 — 은행 수익 근거 아님) */
  const save = Math.max(0, AVG_FUND_FEE - product.fee);
  points.push({
    tone: "slate",
    title: "고객 설득 포인트(고객에게 강조용)",
    detail: `${focusLine(product)}. 저비용(펀드 평균 대비 약 ${save.toFixed(2)}%p↓)·실시간 환금성으로 고객을 설득하되, 이는 고객 혜택이지 은행 수익 근거는 아닙니다.`,
  });

  /* 6) 위험 고지(필수) */
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
