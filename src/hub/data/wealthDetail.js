/* 투자상품 상세용 파생 데이터 — 수익률 차트 시계열·구성종목·지표·적립식 시뮬레이션.
   ⚠ 실제 기준가·구성종목 데이터가 없어 상품 특성(수익률·위험)에서 결정론적으로 생성한 데모다.
   실서비스에서는 펀드평가사·상품시스템의 실데이터로 대체한다. */

/* 결정론적 난수(상품별로 항상 같은 차트) */
const mulberry32 = (a) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const seedFromId = (id) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return h >>> 0;
};

export const DETAIL_PERIODS = [
  { key: "1m", label: "1개월", points: 22, days: 30, ret: (p) => p.return1y / 12 },
  { key: "6m", label: "6개월", points: 26, days: 182, ret: (p) => p.return1y / 2 },
  { key: "1y", label: "1년", points: 52, days: 365, ret: (p) => p.return1y },
  { key: "3y", label: "3년", points: 36, days: 365 * 3, ret: (p) => p.return3y ?? p.return1y * 2.4 },
  { key: "5y", label: "5년", points: 60, days: 365 * 5, ret: (p) => p.return5y ?? (p.return3y ?? p.return1y * 2.4) * 1.5 },
];

/* 기준가 시계열 생성 — 시작 1000 → 기간수익률 반영. 위험등급이 높을수록(1등급) 변동 큼 */
export const genSeries = (product, periodKey) => {
  const pd = DETAIL_PERIODS.find((p) => p.key === periodKey) || DETAIL_PERIODS[2];
  const total = pd.ret(product) ?? 0;
  const n = pd.points;
  const rng = mulberry32(seedFromId(product.id + periodKey));
  const volScale = (7 - product.risk) * 0.55; // risk1(고위험)→3.3, risk6→0.55
  const base = 1000;
  const now = Date.now();
  const pts = [];
  for (let i = 0; i < n; i++) {
    const frac = i / (n - 1);
    let cumPct;
    if (i === 0) cumPct = 0;
    else if (i === n - 1) cumPct = total;
    else cumPct = total * frac + (rng() - 0.5) * 2 * volScale * Math.sqrt(frac + 0.05) * (1 + Math.abs(total) / 30);
    const c = Math.round(base * (1 + cumPct / 100) * 100) / 100;
    const t = now - pd.days * 86400000 * (1 - frac);
    pts.push({ t, c });
  }
  return pts;
};

/* 시계열 → 변동성(연환산 근사)·최대낙폭(MDD) */
export const seriesMetrics = (series) => {
  if (!series || series.length < 3) return { vol: null, mdd: null };
  const rets = [];
  for (let i = 1; i < series.length; i++) rets.push(series[i].c / series[i - 1].c - 1);
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const varc = rets.reduce((a, b) => a + (b - mean) ** 2, 0) / rets.length;
  const stepsPerYear = 52; // 주간 근사
  const vol = Math.sqrt(varc) * Math.sqrt(stepsPerYear) * 100;
  let peak = series[0].c;
  let mdd = 0;
  for (const p of series) {
    if (p.c > peak) peak = p.c;
    const dd = (p.c - peak) / peak;
    if (dd < mdd) mdd = dd;
  }
  return { vol: Math.round(vol * 10) / 10, mdd: Math.round(mdd * 1000) / 10 };
};

/* 카테고리별 대표 구성종목(데모) */
const HOLDINGS = {
  해외주식: [["애플", 8.2], ["마이크로소프트", 7.4], ["엔비디아", 6.9], ["아마존", 4.1], ["알파벳", 3.8]],
  국내주식: [["삼성전자", 24.1], ["SK하이닉스", 6.8], ["LG에너지솔루션", 3.2], ["삼성바이오로직스", 2.9], ["현대차", 2.4]],
  테마: [["에코프로비엠", 12.4], ["포스코퓨처엠", 10.1], ["엘앤에프", 8.3], ["SK이노베이션", 6.2], ["삼성SDI", 5.9]],
  배당: [["알트리아", 4.6], ["버라이즌", 4.3], ["시스코", 4.0], ["코카콜라", 3.7], ["펩시코", 3.5]],
  채권: [["국고채 10년", 22.0], ["국고채 5년", 18.5], ["통안채 2년", 14.2], ["국고채 3년", 12.0], ["산금채", 8.4]],
  원자재: [["금 선물", 98.0]],
  리츠: [["프로로지스", 6.1], ["아메리칸타워", 5.4], ["에퀴닉스", 4.7], ["리얼티인컴", 4.2], ["디지털리얼티", 3.6]],
  자산배분: [["선진국주식 ETF", 32.0], ["국내채권", 24.0], ["미국채", 18.0], ["금", 10.0], ["현금성", 8.0]],
  신흥: [["릴라이언스", 6.8], ["인포시스", 5.1], ["HDFC은행", 4.9], ["TCS", 4.2], ["바자즈파이낸스", 3.7]],
  주가연계: [["KOSPI200 지수", 50.0], ["S&P500 지수", 50.0]],
};

export const holdingsFor = (product) => {
  const cat = product.category;
  const key =
    Object.keys(HOLDINGS).find((k) => cat.includes(k)) ||
    (cat.includes("주식") ? "국내주식" : "채권");
  return HOLDINGS[key] || [];
};

/* 연환산 수익률(3년 우선) — 시뮬레이션 가정 수익률 */
export const annualizedReturn = (product) => {
  if (product.return3y != null) return Math.pow(1 + product.return3y / 100, 1 / 3) * 100 - 100;
  if (product.return1y != null) return product.return1y;
  return 5;
};

/* 적립식 시뮬레이션 — 월 납입(만원)·기간(년)·연수익률(%) → 원금·예상평가액·수익 */
export const simulateSaving = (monthlyManwon, years, annualPct) => {
  const m = Number(monthlyManwon) || 0;
  const n = (Number(years) || 0) * 12;
  const i = Math.pow(1 + annualPct / 100, 1 / 12) - 1;
  const principal = m * n;
  const fv = i === 0 ? principal : m * ((Math.pow(1 + i, n) - 1) / i);
  return { principal, futureValue: Math.round(fv), gain: Math.round(fv - principal) };
};
