/* 투자상품(비이자수익) 카탈로그 — 펀드·ETF·신탁.
   ⚠ 데모 목업 데이터다. 수익률·보수·위험등급은 예시이며 실제 판매조건과 다르다.
   실서비스에서는 상품시스템(펀드기준가·ETF 시세·신탁 조건)에서 조회해 대체한다. */

export const PRODUCT_TYPES = ["펀드", "ETF", "신탁"];

/* 위험등급: 1(매우 높은 위험) ~ 6(매우 낮은 위험) — 금융투자협회 표준 */
export const riskMeta = (r) => {
  if (r <= 2) return { label: `${r}등급 높은위험`, tone: "rose" };
  if (r <= 4) return { label: `${r}등급 중위험`, tone: "amber" };
  return { label: `${r}등급 낮은위험`, tone: "slate" };
};

export const PRODUCTS = [
  // ── ETF ──
  { id: "etf-nasdaq", name: "TIGER 미국나스닥100", type: "ETF", category: "해외주식", risk: 2, return1y: 28.6, return3y: 62.1, fee: 0.07, desc: "미국 나스닥100 지수 추종. 기술주 비중 높음." },
  { id: "etf-sp500", name: "KODEX 미국S&P500", type: "ETF", category: "해외주식", risk: 2, return1y: 22.3, return3y: 48.7, fee: 0.09, desc: "미국 대표 500대 기업 분산투자." },
  { id: "etf-kospi200", name: "KODEX 200", type: "ETF", category: "국내주식", risk: 3, return1y: 8.2, return3y: 21.4, fee: 0.15, desc: "코스피200 지수 추종. 국내 대형주 대표." },
  { id: "etf-dividend", name: "TIGER 미국배당다우존스", type: "ETF", category: "해외주식·배당", risk: 3, return1y: 14.5, return3y: 33.2, fee: 0.01, desc: "미국 고배당 우량주. 월배당 지급." },
  { id: "etf-gold", name: "KODEX 골드선물(H)", type: "ETF", category: "원자재", risk: 4, return1y: 18.9, return3y: 41.0, fee: 0.68, desc: "금 선물 가격 추종. 인플레·안전자산 헤지." },
  { id: "etf-bond10", name: "KODEX 국고채10년", type: "ETF", category: "국내채권", risk: 5, return1y: 3.1, return3y: 6.8, fee: 0.07, desc: "국고채 10년물. 금리 하락기 자본이득 기대." },
  { id: "etf-battery", name: "TIGER 2차전지테마", type: "ETF", category: "국내주식·테마", risk: 1, return1y: -12.4, return3y: 5.2, fee: 0.49, desc: "2차전지 밸류체인. 변동성 매우 큼." },

  // ── 펀드 ──
  { id: "fund-global", name: "미래에셋 글로벌그로스", type: "펀드", category: "해외주식", risk: 2, return1y: 24.1, return3y: 51.3, fee: 1.28, desc: "글로벌 성장주 액티브. 환노출형." },
  { id: "fund-india", name: "삼성 인디아중소형포커스", type: "펀드", category: "해외주식·신흥", risk: 1, return1y: 31.7, return3y: 72.5, fee: 1.55, desc: "인도 중소형주 집중. 고성장·고변동." },
  { id: "fund-value", name: "KB 밸류포커스", type: "펀드", category: "국내주식", risk: 2, return1y: 6.8, return3y: 18.4, fee: 1.12, desc: "국내 저평가 가치주 발굴." },
  { id: "fund-reits", name: "한국투자 글로벌리츠", type: "펀드", category: "리츠", risk: 3, return1y: 9.3, return3y: 12.7, fee: 0.85, desc: "글로벌 상장 리츠. 배당+시세." },
  { id: "fund-longshort", name: "신한 코리아롱숏", type: "펀드", category: "국내주식·롱숏", risk: 3, return1y: 5.4, return3y: 14.9, fee: 1.4, desc: "롱숏 전략으로 변동성 완화." },

  // ── 신탁 ──
  { id: "trust-bond", name: "특정금전신탁 (국공채)", type: "신탁", category: "채권", risk: 5, return1y: 3.8, return3y: 8.2, fee: 0.3, desc: "국공채 편입 맞춤 신탁. 안정 이자수취." },
  { id: "trust-elt", name: "ELT 스텝다운 (KOSPI200·S&P500)", type: "신탁", category: "주가연계", risk: 3, return1y: 6.5, return3y: null, fee: 0.5, desc: "조기상환형 주가연계신탁. 조건 충족 시 확정수익." },
  { id: "trust-wrap", name: "글로벌 자산배분 랩", type: "신탁", category: "자산배분", risk: 3, return1y: 11.2, return3y: 26.8, fee: 1.0, desc: "주식·채권·대체 분산 일임형." },
];

export const PRODUCT_BY_ID = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
