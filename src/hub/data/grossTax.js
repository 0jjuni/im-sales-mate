/* 금융소득 종합과세 관리 — 데이터 계층.

   목적: 이 고객이 「지금 어떻게 절세하고 있는지」를 당행 보유 기준으로 진단하고,
   절세를 더 유도하면서 우리 상품(ISA·방카·노란우산·연금 등)을 제안하기 위한 스캐폴드.
   여러 내부 화면(0192-8·0192-1·0192-74/75 등)에서 따로 봐야 하는 걸 고객번호 하나로 통합한다.

   ⚠ 조회 범위는 「당행 보유분」이다. 타행 가입 여부·잔액은 조회할 수 없다(법정 합산한도는 표기만).
   ⚠ 데모 목업이다. 실서비스에서는 각 source(내부 조회)를 실제 조회 결과로 대체한다.
      호출부는 queryGrossTax(customerNo)·deriveStrategy(data)의 형태에만 의존한다. */

/* 통합 조회 소스 — 각 데이터가 원래 어느 화면/조회에서 오는지이자, 이 사이트가 통합하는 대상.
   0192-x는 내부 조회 화면 코드, 나머지는 당행 계좌 보유 여부 확인. */
export const SOURCES = {
  jonghap: { code: "0192-8", label: "종합과세 대상자 조회" },
  nontaxSavings: { code: "0192-1", label: "비과세종합저축" },
  insMonthly: { code: "0192-74", label: "저축성보험(월적립식)" },
  insOther: { code: "0192-75", label: "저축성보험(월적립식 외)" },
  isa: { code: "당행", label: "ISA 가입 여부" },
  housing: { code: "당행", label: "주택청약 가입 여부" },
  noran: { code: "노란우산", label: "노란우산공제" },
};

/* 상품 상태 → 색/의미.
   active=활용 중 · available=추가 납입 여력(추가 판매) · recommend=미보유·가입 권유(신규 판매)
   restricted=가입/연장 제한 · none=해당 없음 */
export const PRODUCT_STATE = {
  active: { label: "활용 중", tone: "im" },
  available: { label: "추가 납입 여력", tone: "amber" },
  recommend: { label: "미보유 · 가입 권유", tone: "im" },
  restricted: { label: "가입/연장 제한", tone: "rose" },
  none: { label: "해당 없음", tone: "slate" },
};

/* ── 대표 고객 3인(리치 목업) ─────────────────────────────────────────
   후속관리 seed 고객번호 재사용. 조회 데이터는 모두 「당행 보유 기준」.
   841023391 종합과세 대상자 / 772501180 비대상·ISA 미보유(판매 기회) / 904176624 경계(직전 3년 대상 이력) */
const CUSTOMERS = {
  "841023391": {
    customerNo: "841023391",
    name: "김○호",
    age: "52세",
    /* 상담 시 조정하는 값(자동 조회로는 최신 여부를 보장 못 하거나 조회 불가) */
    incomeType: "개인사업자",
    homeless: false,
    nontaxEligible: false,
    jonghap: {
      taxYear: 2025,
      isTarget: true,
      financialIncome: 3120,
      threshold: 2000,
      taxOffice: "동대구세무서",
      history: [
        { year: 2024, isTarget: true },
        { year: 2023, isTarget: false },
        { year: 2022, isTarget: false },
      ],
      restrictedByHistory: true,
    },
    products: [
      { key: "nontaxSavings", held: false },
      {
        key: "insMonthly",
        state: "available",
        remaining: "월 70만원",
        headline: "당행(방카) 월적립식 가입 · 납입 여력",
        metrics: [
          { label: "당행 월 납입", value: "80만원" },
          { label: "월 한도", value: "150만원" },
          { label: "남은 여력", value: "월 70만원" },
        ],
        note: "계약 10년 이상·월 150만원 이내 유지 시 보험차익 비과세.",
      },
      {
        key: "isa",
        state: "restricted",
        headline: "당행 ISA 보유 · 재가입/연장 제한",
        metrics: [{ label: "당행 가입", value: "보유(일반형)" }],
        note: "직전 3년 종합과세 대상 이력 → 만기 후 재가입·연장 제한. 현 계좌 유지 위주로 안내.",
      },
      /* 소득 유형에 따라 자격·소득공제가 달라지는 상품은 held/monthly만 두고 viewProduct로 파생 */
      { key: "housing", held: true, monthly: "10만원" },
      { key: "noran", held: true, monthly: "20만원" },
    ],
  },

  "772501180": {
    customerNo: "772501180",
    name: "이○희",
    age: "48세",
    incomeType: "근로소득자",
    homeless: true,
    nontaxEligible: false,
    jonghap: {
      taxYear: 2025,
      isTarget: false,
      financialIncome: 860,
      threshold: 2000,
      taxOffice: "수성세무서",
      history: [
        { year: 2024, isTarget: false },
        { year: 2023, isTarget: false },
        { year: 2022, isTarget: false },
      ],
      restrictedByHistory: false,
    },
    products: [
      { key: "nontaxSavings", held: false },
      {
        key: "insOther",
        state: "available",
        remaining: "2,000만원",
        headline: "당행(방카) 일시납 보유 · 납입 여력",
        metrics: [
          { label: "당행 일시납", value: "8,000만원" },
          { label: "일시납 한도", value: "1억원" },
          { label: "남은 여력", value: "2,000만원" },
        ],
        note: "계약 10년 이상 유지 시 보험차익 비과세. 한도까지 2,000만원 추가 여력.",
      },
      {
        key: "isa",
        state: "recommend",
        cta: { to: "/isa", label: "ISA 상담 시작" },
        headline: "당행 ISA 미보유 · 가입 권유",
        metrics: [
          { label: "당행 가입", value: "없음" },
          { label: "권유 유형", value: "서민형(비과세 400만원)" },
        ],
        note: "비대상·가입 제한 없음 → 서민형 ISA로 순이익 비과세. 지금 화면에서 바로 잡을 대표 판매 기회.",
      },
      { key: "housing", held: true, monthly: "10만원" },
      { key: "noran", held: false },
    ],
  },

  "904176624": {
    customerNo: "904176624",
    name: "박○수",
    age: "59세",
    incomeType: "개인사업자",
    homeless: false,
    nontaxEligible: false,
    jonghap: {
      taxYear: 2025,
      isTarget: false,
      financialIncome: 1750,
      threshold: 2000,
      taxOffice: "남대구세무서",
      history: [
        { year: 2024, isTarget: false },
        { year: 2023, isTarget: true },
        { year: 2022, isTarget: false },
      ],
      restrictedByHistory: true,
    },
    products: [
      { key: "nontaxSavings", held: false },
      {
        key: "isa",
        state: "restricted",
        headline: "당행 ISA 보유 · 재가입/연장 제한",
        metrics: [{ label: "당행 가입", value: "보유(일반형)" }],
        note: "직전 3년 대상 이력(2023) → 재가입·연장 및 신규 비과세상품 가입 제한.",
      },
      { key: "housing", held: true, monthly: "10만원" },
      { key: "noran", held: true, monthly: "10만원" },
    ],
  },
};

export const INCOME_TYPES = ["근로소득자", "개인사업자", "기타"];

/* 상담 시 조정하는 값(소득 유형·무주택 세대주·비과세종합저축 자격)에 따라
   자격·소득공제가 달라지는 상품을 파생한다. 조회는 「가입 여부(held)」만, 자격 판단은 이 값으로. */
export function viewProduct(product, manual, restricted = false) {
  const { incomeType, homeless, nontaxEligible } = manual;

  if (product.key === "nontaxSavings") {
    const limitMetric = { label: "비과세 한도", value: "5,000만원(전금융기관 합산)" };
    if (nontaxEligible) {
      if (product.held) {
        return {
          ...product,
          state: "active",
          headline: "당행 가입 중",
          metrics: [limitMetric, { label: "당행 가입", value: "보유" }],
          note: "기초연금 수급자·장애인·만 65세 이상 등 비과세 대상. 타행 가입분은 합산 한도에서 별도 확인.",
        };
      }
      /* 자격은 있으나 종합과세 대상/이력이면 신규 가입 제한 상품 */
      if (restricted) {
        return {
          ...product,
          state: "restricted",
          headline: "자격 있음 · 가입 제한",
          metrics: [limitMetric, { label: "당행 가입", value: "없음" }],
          note: "비과세 자격은 있으나 종합과세 대상/직전 이력으로 신규 가입 제한.",
        };
      }
      return {
        ...product,
        state: "recommend",
        headline: "당행 미가입 · 가입 권유",
        metrics: [limitMetric, { label: "당행 가입", value: "없음" }],
        note: "기초연금 수급자·장애인·만 65세 이상 등 → 비과세 예적금 가입 권유. 타행 가입분은 별도 확인.",
      };
    }
    return {
      ...product,
      state: "none",
      headline: "가입 대상 아님",
      metrics: [limitMetric, { label: "당행 가입", value: "없음" }],
      note: "만 65세 이상 기초연금 수급자·장애인·독립유공자 등만 가입 가능.",
    };
  }

  if (product.key === "noran") {
    const eligible = incomeType === "개인사업자";
    if (product.held) {
      return {
        ...product,
        state: "active",
        headline: eligible ? "당행 가입 중 · 소득공제 적용" : "당행 가입 중",
        metrics: [
          { label: "당행 월 부금", value: product.monthly || "—" },
          { label: "소득공제", value: eligible ? "사업소득 규모별 한도" : "소득유형 변경 — 자격 재확인" },
        ],
        note: eligible
          ? "폐업·퇴임 시 공제금 수령. 사업소득자 소득공제 핵심 — 부금 증액 여력 점검."
          : "현재 소득유형 기준 신규 가입 대상은 아니나 기존 계좌는 유지. 사업 지속 여부 확인.",
      };
    }
    if (eligible) {
      return {
        ...product,
        state: "recommend",
        cta: { to: "/noran", label: "노란우산 상담 시작" },
        headline: "당행 미가입 · 가입 권유",
        metrics: [
          { label: "가입 자격", value: "소기업·소상공인" },
          { label: "혜택", value: "소득공제 + 폐업 대비" },
        ],
        note: "사업소득자 소득공제 핵심 수단 — 미보유, 가입 권유.",
      };
    }
    return {
      ...product,
      state: "none",
      headline: "가입 대상 아님",
      metrics: [{ label: "가입 자격", value: "소기업·소상공인" }],
      note: "근로소득자는 가입 대상 아님(사업소득 발생 시 재검토).",
    };
  }

  if (product.key === "housing") {
    const deductible = incomeType === "근로소득자" && homeless;
    return {
      ...product,
      state: "active",
      headline: "당행 가입 중",
      metrics: [
        { label: "당행 월 납입", value: product.monthly || "10만원" },
        { label: "소득공제", value: deductible ? "무주택 세대주 근로자 — 대상" : "대상 아님" },
      ],
      note: deductible
        ? "무주택 세대주 근로소득자 소득공제 대상(총급여 7천 이하). 납입 유지 권장."
        : "청약 자격 유지 목적. 소득공제는 무주택 세대주 근로소득자 한정.",
    };
  }

  return product;
}

/* 고객번호로 통합 조회. 없으면 null. */
export function queryGrossTax(customerNo) {
  const key = (customerNo || "").replace(/\D/g, "");
  return CUSTOMERS[key] || null;
}

export const SAMPLE_CUSTOMERS = Object.values(CUSTOMERS).map((c) => ({
  customerNo: c.customerNo,
  name: c.name,
  tag: c.jonghap.isTarget
    ? "종합과세 대상"
    : c.jonghap.restrictedByHistory
    ? "가입 제한(이력)"
    : "비대상 · 판매 기회",
}));

const cleanLabel = (label) => label.replace(" 가입 여부", "");

/* 절세 전략·상품 제안 = 조회된 사실에서 규칙으로 도출(하드코딩 아님).
   이 고객이 지금 어떻게 절세하는지 + 어떻게 더 유도하고 무슨 상품을 팔지를 우선순위로 만든다.
   실서비스에서도 이 함수 하나가 모든 고객의 제안을 결정론적으로 생성 — 근거가 규칙으로 추적된다.
   입력: jonghap(대상여부·기준근접·이력제한) + products(상태·남은한도·미보유). */
export function deriveStrategy(data, manual) {
  const j = data.jonghap;
  const incomeType = manual.incomeType;
  const ratio = j.threshold ? j.financialIncome / j.threshold : 0;
  const near = !j.isTarget && ratio >= 0.8;
  const won = (v) => v.toLocaleString();
  /* 수기 값(소득유형·무주택·비과세자격)에 따라 자격이 달라지는 상품을 반영해 전략을 도출 */
  const restricted = j.isTarget || j.restrictedByHistory;
  const products = data.products.map((p) => viewProduct(p, manual, restricted));
  const items = [];

  /* 1) 진단 헤드라인 */
  if (j.isTarget) {
    items.push({
      tag: "우선",
      kind: "warn",
      title: "종합과세 대상 — 신규 비과세·ISA 가입/연장 제한",
      detail: `당해 금융소득 ${won(j.financialIncome)}만원으로 기준(${won(
        j.threshold
      )}만원)을 초과했습니다. 신규 비과세·ISA 가입이 제한되니, 상품 판매보다 소득 분산·이연으로 방향을 잡으세요.`,
    });
  } else if (near) {
    items.push({
      tag: "우선",
      kind: "warn",
      title: `금융소득 ${won(j.financialIncome)}만원 — 기준에 근접`,
      detail: `기준(${won(j.threshold)}만원)의 ${Math.round(
        ratio * 100
      )}% 수준입니다. 이자 수령 시점을 조절해 당해 합산소득이 기준을 넘지 않게 관리하세요.`,
    });
  } else {
    items.push({
      tag: "양호",
      kind: "ok",
      title: "비대상 · 절세상품을 더 채울 여지",
      detail: `금융소득 ${won(
        j.financialIncome
      )}만원으로 종합과세 대상이 아닙니다. 가입 제한이 없으므로 비과세·분리과세 상품을 적극 제안하기 좋은 고객입니다.`,
    });
  }

  /* 2) 직전 3년 이력 제한(현재 비대상이라도) */
  if (!j.isTarget && j.restrictedByHistory) {
    items.push({
      tag: "제한 유의",
      kind: "warn",
      title: "직전 3년 대상 이력 → 비과세·ISA 가입/연장 제한",
      detail:
        "직전 3개 과세기간 중 대상 이력이 있어 비과세종합저축·ISA 신규가입·연장이 제한됩니다. 신규 제안은 세액공제·소득공제 상품 위주로 설계하세요.",
    });
  }

  /* 3) 미보유·가입 권유(신규 판매) — 제한이 없을 때 최우선 판매 기회 (소득유형 반영) */
  products.forEach((p) => {
    if (p.state === "recommend") {
      items.push({
        tag: "판매 기회",
        kind: "sell",
        title: `${cleanLabel(SOURCES[p.key]?.label ?? p.key)} 신규 가입 권유`,
        detail: p.note,
        cta: p.cta,
      });
    }
  });

  /* 4) 보유 상품 추가 납입 여력(추가 판매) */
  products.forEach((p) => {
    if (p.state === "available" && p.remaining) {
      const label = cleanLabel(SOURCES[p.key]?.label ?? p.key);
      items.push({
        tag: "추가 판매",
        kind: "action",
        title: `${label} 납입 여력(${p.remaining}) 활용`,
        detail: `보유 중인 ${label}의 남은 한도를 채워, 과세되는 예금 이자를 비과세 구조로 이전하도록 제안하세요.`,
      });
    }
  });

  /* 5) 세액공제·소득공제 — 소득 유형에 맞춰 제안 (가입 제한과 무관) */
  const noranActive = products.some((p) => p.key === "noran" && p.state === "active");
  if (incomeType === "근로소득자") {
    const housingDeduct = manual.homeless;
    items.push({
      tag: "세액공제",
      kind: "action",
      title: housingDeduct ? "IRP·연금저축 세액공제 + 주택청약 소득공제" : "IRP·연금저축 세액공제 제안",
      detail: housingDeduct
        ? "연말정산에서 연금계좌 세액공제(IRP·연금저축 합산 900만원)와 무주택 세대주 주택청약 소득공제를 함께 챙기도록 제안하세요."
        : "연말정산 연금계좌 세액공제(IRP·연금저축 합산 900만원)로 환급을 늘리도록 제안하세요.",
      cta: { to: "/pension", label: "연금 세액공제 계산" },
    });
  } else {
    items.push({
      tag: "세액공제",
      kind: "action",
      title: noranActive ? "노란우산 부금 증액 + 개인형 IRP·연금저축" : "개인형 IRP·연금저축 세액공제 제안",
      detail: noranActive
        ? "가입 제한이 없는 소득공제(노란우산)·세액공제(IRP·연금저축)로 절세를 확보하게 하세요. 사업소득 규모에 맞춰 부금 증액을 제안합니다."
        : "IRP·연금저축 세액공제(합산 900만원 한도)로 종합소득세 부담을 줄이도록 제안하세요.",
      cta: { to: "/pension", label: "연금 세액공제 계산" },
    });
  }

  /* 6) 소득 분산 — 대상자·기준근접·이력제한일 때 */
  if (j.isTarget || near || j.restrictedByHistory) {
    items.push({
      tag: "소득 분산",
      kind: "action",
      title: "배우자·자녀 사전 증여로 금융자산 명의 분산",
      detail:
        "배우자 6억, 자녀 5천만원(미성년 2천만원)까지 10년 단위 비과세 증여. 이자·배당 자산을 나눠 1인당 금융소득 기준을 낮춥니다.",
    });
  }

  /* 7) 시기 분산·과세 이연 — 이미 대상인 경우 강조 */
  if (j.isTarget) {
    items.push({
      tag: "시기 분산",
      kind: "action",
      title: "이자 수령 시기 분산 — 특정 연도 집중 회피",
      detail:
        "3년 만기 일시수령보다 매년 이자 수령·월이자지급식으로 옮겨, 특정 과세연도에 기준을 넘기는 것을 피하세요.",
    });
    items.push({
      tag: "과세 이연",
      kind: "action",
      title: "만기 도래 상품 해지 시점을 다음 해로 연기",
      detail:
        "당해 금융소득이 이미 기준을 초과했으므로, 만기 상품 해지·재예치 시점을 내년으로 넘겨 합산소득을 낮추는 것을 검토하세요.",
    });
  }

  return items;
}

/* ── 참고 자료(사진 반영) — 접이식 가이드 ─────────────────────────── */

/* 종합과세에서 제외되는 비과세·분리과세 상품 */
export const EXCLUDED_PRODUCTS = [
  { name: "비과세종합저축", detail: "만 65세 이상·장애인·독립유공자 등 / 전 금융기관 합산 1인당 5천만원" },
  { name: "10년 이상 장기저축성 보험", detail: "일시납 1억 한도, 월납 5년 이상 & 월 150만원 한도" },
  { name: "상장주식 매매차익(소액 개인투자자)", detail: "매도 시 차익 비과세(단, 배당금은 과세)" },
  { name: "국내주식형 펀드·ETF 매매차익", detail: "분배금·배당금은 과세" },
  { name: "개인종합자산관리계좌(ISA) 순이익", detail: "일반형 200만원·서민형/농어민 400만원 비과세, 초과분 9.9% 분리과세" },
  { name: "제2금융권 조합 예탁금", detail: "1인당 3천만원(농특세 1.4% 과세, 저율분리과세)" },
  { name: "브라질 국채 등", detail: "이자소득·환차익 비과세 / 외화현찰 매매·외화예금 이자는 과세" },
];

/* 금융소득 종합과세 시 불이익 */
export const DISADVANTAGES = [
  { title: "종합소득세 신고의무", detail: "매년 5월 말까지 주소지 관할세무서·홈택스에서 신고·납부(전년 1.1~12.31 소득)" },
  { title: "세금부담 증가", detail: "금융소득이 다른 소득과 합산 과세 — 높은 누진세율 구간 적용" },
  { title: "세제혜택 상품 가입 제한", detail: "비과세종합저축·ISA 등 가입·연장 제한(직전 3개 과세기간 중 1회 이상 대상자)" },
  { title: "인적·기본공제 배제", detail: "소득금액 100만원(근로만 있으면 총급여 500만원) 초과 시 인적·기본공제 대상에서 배제" },
  { title: "건강보험료 부담 증가", detail: "추가 납부 또는 피부양자 자격상실·지역가입자 전환 등" },
];

/* 절세 전략 프레임 */
export const STRATEGY_FRAME = {
  products: [
    { type: "비과세", items: "비과세종합저축, ISA" },
    { type: "세액공제", items: "개인형 IRP·연금저축" },
    { type: "분리과세", items: "ISA(비과세 초과분)" },
    { type: "소득공제", items: "주택청약종합저축 · 노란우산공제" },
  ],
  dispersion: [
    { title: "개인별 금융자산 분산", detail: "배우자(6억) 또는 자녀(5천만원/미성년 2천만원)에게 10년 단위 사전 증여" },
    { title: "소득 발생 시기 분산", detail: "3년 만기 상품보다 매년 이자 수령 또는 월이자지급식 상품 활용" },
    { title: "과세이연 활용", detail: "연금상품 가입 또는 만기 도래 상품의 해지 시점을 다음 해로 연기" },
  ],
};
