/* 투자상품(비이자수익) 카탈로그 — 펀드·ETF·신탁.
   ⚠ 데모 목업 데이터다. 수익률·보수·위험등급·판매건수는 예시이며 실제와 다르다.
   실서비스에서는 상품시스템(기준가·시세·판매실적)에서 조회해 대체한다. */

export const PRODUCT_TYPES = ["펀드", "ETF", "신탁"];

/* 위험등급: 1(매우 높은 위험) ~ 6(매우 낮은 위험) — 금융투자협회 표준 */
export const riskMeta = (r) => {
  if (r <= 2) return { label: `${r}등급`, full: `${r}등급 높은위험`, tone: "rose" };
  if (r <= 4) return { label: `${r}등급`, full: `${r}등급 중위험`, tone: "amber" };
  return { label: `${r}등급`, full: `${r}등급 낮은위험`, tone: "slate" };
};

/* sold = 당행 누적 판매건수(데모) — 인기 순위 기준 */
export const PRODUCTS = [
  // ── ETF ──
  { id: "etf-nasdaq", name: "TIGER 미국나스닥100", type: "ETF", category: "해외주식", risk: 2, return1y: 28.6, return3y: 62.1, return5y: 145.2, fee: 0.07, aum: 32000, company: "미래에셋자산운용", since: "2010.10", sold: 1240, desc: "미국 나스닥100 지수를 추종하는 대표 ETF. 애플·마이크로소프트·엔비디아 등 미국 대형 기술주 100종목에 분산 투자합니다. 성장주 비중이 높아 기대수익과 변동성이 함께 큽니다." },
  { id: "etf-sp500", name: "KODEX 미국S&P500", type: "ETF", category: "해외주식", risk: 2, return1y: 22.3, return3y: 48.7, return5y: 98.3, fee: 0.09, aum: 28000, company: "삼성자산운용", since: "2021.04", sold: 1090, desc: "미국을 대표하는 500대 기업에 폭넓게 분산 투자. 장기 적립식 핵심 자산으로 활용도가 높습니다." },
  { id: "etf-kospi200", name: "KODEX 200", type: "ETF", category: "국내주식", risk: 3, return1y: 8.2, return3y: 21.4, return5y: 34.1, fee: 0.15, aum: 61000, company: "삼성자산운용", since: "2002.10", sold: 870, desc: "코스피200 지수를 추종하는 국내 대표 ETF. 국내 대형주 분산 투자의 기본." },
  { id: "etf-dividend", name: "TIGER 미국배당다우존스", type: "ETF", category: "해외주식·배당", risk: 3, return1y: 14.5, return3y: 33.2, return5y: null, fee: 0.01, aum: 21000, company: "미래에셋자산운용", since: "2023.06", sold: 640, desc: "미국 고배당 우량주에 투자하고 매월 분배금을 지급. 현금흐름을 원하는 고객에게 적합." },
  { id: "etf-gold", name: "KODEX 골드선물(H)", type: "ETF", category: "원자재", risk: 4, return1y: 18.9, return3y: 41.0, return5y: 76.4, fee: 0.68, aum: 8000, company: "삼성자산운용", since: "2010.10", sold: 410, desc: "금 선물 가격을 추종. 인플레이션 헤지·안전자산 분산 목적." },
  { id: "etf-bond10", name: "KODEX 국고채10년", type: "ETF", category: "국내채권", risk: 5, return1y: 3.1, return3y: 6.8, return5y: 9.2, fee: 0.07, aum: 12000, company: "삼성자산운용", since: "2011.10", sold: 300, desc: "국고채 10년물에 투자. 금리 하락기 자본이득을 기대하는 안정형 자산." },
  { id: "etf-battery", name: "TIGER 2차전지테마", type: "ETF", category: "국내주식·테마", risk: 1, return1y: -12.4, return3y: 5.2, return5y: 62.0, fee: 0.49, aum: 9000, company: "미래에셋자산운용", since: "2018.09", sold: 280, desc: "2차전지 밸류체인 테마. 성장 기대가 크지만 변동성이 매우 높아 분할·장기 접근 필요." },

  // ── 펀드 ──
  { id: "fund-global", name: "미래에셋 글로벌그로스", type: "펀드", category: "해외주식", risk: 2, return1y: 24.1, return3y: 51.3, return5y: 88.7, fee: 1.28, aum: 4200, company: "미래에셋자산운용", since: "2015.03", sold: 560, desc: "전 세계 성장주에 투자하는 액티브 펀드. 환노출형으로 환율 영향을 함께 받습니다." },
  { id: "fund-india", name: "삼성 인디아중소형포커스", type: "펀드", category: "해외주식·신흥", risk: 1, return1y: 31.7, return3y: 72.5, return5y: 132.4, fee: 1.55, aum: 3100, company: "삼성자산운용", since: "2016.05", sold: 480, desc: "인도 중소형 성장주에 집중 투자. 고성장·고변동. 장기 분산의 위성 자산으로 적합." },
  { id: "fund-value", name: "KB 밸류포커스", type: "펀드", category: "국내주식", risk: 2, return1y: 6.8, return3y: 18.4, return5y: 41.2, fee: 1.12, aum: 5400, company: "KB자산운용", since: "2009.08", sold: 350, desc: "국내 저평가 가치주를 발굴하는 정통 가치투자 펀드." },
  { id: "fund-reits", name: "한국투자 글로벌리츠", type: "펀드", category: "리츠", risk: 3, return1y: 9.3, return3y: 12.7, return5y: null, fee: 0.85, aum: 2200, company: "한국투자신탁운용", since: "2019.11", sold: 230, desc: "글로벌 상장 리츠에 투자. 배당 수익과 부동산 시세를 함께 추구." },
  { id: "fund-longshort", name: "신한 코리아롱숏", type: "펀드", category: "국내주식·롱숏", risk: 3, return1y: 5.4, return3y: 14.9, return5y: 33.5, fee: 1.4, aum: 1800, company: "신한자산운용", since: "2017.02", sold: 190, desc: "매수·매도 전략을 함께 써 시장 변동성을 완화하는 절대수익 추구형." },

  // ── 신탁 ──
  { id: "trust-bond", name: "특정금전신탁 (국공채)", type: "신탁", category: "채권", risk: 5, return1y: 3.8, return3y: 8.2, return5y: null, fee: 0.3, aum: 15000, company: "iM뱅크", since: "수시", sold: 720, desc: "국공채를 편입하는 맞춤형 금전신탁. 안정적인 이자수취가 목적." },
  { id: "trust-elt", name: "ELT 스텝다운 (KOSPI200·S&P500)", type: "신탁", category: "주가연계", risk: 3, return1y: 6.5, return3y: null, return5y: null, fee: 0.5, aum: 8000, company: "iM뱅크", since: "수시(회차)", sold: 910, desc: "기초지수가 일정 조건을 충족하면 조기상환되는 주가연계신탁. 조건 충족 시 확정수익, 미충족 시 원금손실 가능." },
  { id: "trust-wrap", name: "글로벌 자산배분 랩", type: "신탁", category: "자산배분", risk: 3, return1y: 11.2, return3y: 26.8, return5y: 58.0, fee: 1.0, aum: 3300, company: "iM증권", since: "수시", sold: 260, desc: "주식·채권·대체자산을 분산해 운용하는 일임형 상품." },
];

export const PRODUCT_BY_ID = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));

/* 매입가(기준가) 확정 방식 — 상품 유형별로 다르다.
   ETF : 거래소 실시간 체결 → 체결가로 즉시 확정(lag 0)
   펀드: 기준가(NAV) 적용에 시차 — 국내형 익영업일(T+1), 해외형 2영업일(T+2)
   신탁: 설정일에 편입·매입 확정 — ELT는 회차 청약 마감 후 설정(T+3 근사)
   lagDays = 신청일로부터 매입가가 확정되는 데 걸리는 영업일 수(데모 근사). */
export const pricingOf = (p) => {
  if (!p) return { mode: "실시간", lagDays: 0, chip: "실시간", priceLabel: "매입 단가", note: "" };
  if (p.type === "ETF")
    return { mode: "실시간", lagDays: 0, chip: "실시간 체결", priceLabel: "매입 단가", note: "거래소에서 실시간 체결 · 매입단가가 즉시 확정됩니다." };
  if (p.type === "펀드") {
    const overseas = /해외|신흥|글로벌|리츠/.test(p.category);
    return overseas
      ? { mode: "기준가", lagDays: 2, chip: "기준가 T+2", priceLabel: "매입 기준가", note: "해외형 펀드 · 신청 2영업일 뒤 기준가로 매입가가 확정됩니다." }
      : { mode: "기준가", lagDays: 1, chip: "기준가 T+1", priceLabel: "매입 기준가", note: "국내형 펀드 · 신청 익영업일 기준가로 매입가가 확정됩니다." };
  }
  /* 신탁 */
  const elt = p.category.includes("주가연계");
  return elt
    ? { mode: "설정일", lagDays: 3, chip: "설정일", priceLabel: "매입 기준가", note: "회차 청약 마감 후 설정일에 편입·매입이 확정됩니다." }
    : { mode: "설정일", lagDays: 1, chip: "설정일", priceLabel: "매입 기준가", note: "신탁 설정일에 자산 편입·매입이 확정됩니다." };
};

/* 판매 순위(인기순) — sold 내림차순. rank 부여 */
export const SOLD_RANK = Object.fromEntries(
  [...PRODUCTS].sort((a, b) => b.sold - a.sold).map((p, i) => [p.id, i + 1])
);
