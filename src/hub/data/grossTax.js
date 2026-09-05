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
  cardPersonal: { code: "BC/당행", label: "개인 신용카드" },
  cardBiz: { code: "BC/당행", label: "개인사업자 신용카드" },
};

/* 상품 상태 → 색/의미.
   active=활용 중 · available=추가 납입 여력(추가 판매) · recommend=미보유·가입 권유(신규 판매)
   restricted=가입/연장 제한 · none=해당 없음 */
export const PRODUCT_STATE = {
  recommend: { label: "가입 권유", tone: "im", sell: true },
  available: { label: "추가 납입 여력", tone: "im", sell: true },
  active: { label: "활용 중", tone: "slate", sell: false },
  restricted: { label: "가입/연장 제한", tone: "rose", sell: false },
  none: { label: "해당 없음", tone: "slate", sell: false },
  unknown: { label: "상담 확인 필요", tone: "prompt", sell: false },
};

/* ── 대표 고객 3인(리치 목업) ─────────────────────────────────────────
   후속관리 seed 고객번호 재사용. 조회 데이터는 모두 「당행 보유 기준」.
   841023391 종합과세 대상자 / 772501180 비대상·ISA 미보유(판매 기회) / 904176624 경계(직전 3년 대상 이력) */
const CUSTOMERS = {
  "841023391": {
    customerNo: "841023391",
    name: "김우디",
    age: "52세",
    profile: "제조·도매업 대표 · 사업 20년차",
    persona:
      "사업이 자리 잡아 예금·채권 등 이자자산이 많아졌고, 그만큼 금융소득이 종합과세 기준을 넘겼습니다. 상품을 더 파는 것보다 소득 분산·비과세 전환으로 세부담을 낮추는 게 핵심인 고객입니다.",
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
        metrics: [
          { label: "남은 납입 여력", value: "월 70만원", strong: true },
          { label: "월 납입 / 한도", value: "80 / 150만원" },
        ],
        note: "계약 10년 이상·월 150만원 이내 유지 시 보험차익 비과세.",
      },
      {
        key: "insOther",
        state: "recommend",
        metrics: [{ label: "일시납 비과세 한도", value: "1억원", strong: true }],
        note: "일시납 저축성보험(계약 10년 이상)은 종합과세 제한이 없습니다. 과세 예금을 비과세로 이전하도록 권유하세요.",
      },
      {
        key: "isa",
        state: "restricted",
        metrics: [{ label: "당행 ISA", value: "보유(일반형)" }],
        note: "직전 3년 종합과세 이력 → 재가입·연장 제한. 현 계좌 유지 위주.",
      },
      /* 소득 유형에 따라 자격·소득공제가 달라지는 상품은 held/monthly만 두고 viewProduct로 파생 */
      { key: "housing", held: true, monthly: "10만원" },
      { key: "noran", held: true, monthly: "20만원" },
      {
        key: "cardPersonal",
        held: true,
        cards: [
          { name: "iM 세븐카드", brand: "BC", type: "신용", monthly: 85 },
          { name: "iM 트래블카드", brand: "VISA", type: "신용", monthly: 40 },
        ],
      },
      { key: "cardBiz", held: false },
    ],
  },

  "772501180": {
    customerNo: "772501180",
    name: "이단디",
    age: "48세",
    profile: "맞벌이 근로소득자 · 총급여 6천만원대",
    persona:
      "목돈은 모았는데 절세계좌가 비어 있는 근로소득자입니다. 종합과세 비대상이고 가입 제한도 없어, 서민형 ISA·연금계좌·주택청약 소득공제로 절세를 채워 주기 좋은 대표 판매 기회 고객입니다.",
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
        metrics: [
          { label: "남은 납입 여력", value: "2,000만원", strong: true },
          { label: "일시납 / 한도", value: "8,000만원 / 1억원" },
        ],
        note: "계약 10년 이상 유지 시 보험차익 비과세.",
      },
      {
        key: "isa",
        state: "recommend",
        cta: { to: "/isa", label: "ISA 상담 시작" },
        metrics: [{ label: "비과세 한도(서민형)", value: "400만원", strong: true }],
        note: "비대상·가입 제한 없음 → 서민형 ISA로 순이익 비과세. 대표 판매 기회.",
      },
      { key: "housing", held: true, monthly: "10만원" },
      { key: "noran", held: false },
      { key: "cardPersonal", held: false },
      { key: "cardBiz", held: false },
    ],
  },

  "904176624": {
    customerNo: "904176624",
    name: "박똑디",
    age: "59세",
    profile: "소매점 운영 · 내년 은퇴 준비",
    persona:
      "직전 3년 중 종합과세 대상 이력이 있어 신규 비과세·ISA가 막혔고, 금융소득도 기준에 근접한 경계 고객입니다. 노란우산 부금 증액·연금 세액공제 같은 소득공제·세액공제와 이자 수령 시기 분산으로 관리해야 합니다.",
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
        key: "insOther",
        state: "recommend",
        metrics: [{ label: "일시납 비과세 한도", value: "1억원", strong: true }],
        note: "일시납 저축성보험(계약 10년 이상)은 종합과세 제한이 없습니다. 과세 예금을 비과세로 이전하도록 권유하세요.",
      },
      {
        key: "isa",
        state: "restricted",
        metrics: [{ label: "당행 ISA", value: "보유(일반형)" }],
        note: "직전 3년 대상 이력(2023) → 재가입·연장 및 신규 비과세상품 가입 제한.",
      },
      { key: "housing", held: true, monthly: "10만원" },
      { key: "noran", held: true, monthly: "10만원" },
      {
        key: "cardPersonal",
        held: true,
        cards: [{ name: "iM K-패스카드", brand: "Master", type: "신용", monthly: 55 }],
      },
      { key: "cardBiz", held: false },
    ],
  },
};

export const INCOME_TYPES = ["근로소득자", "개인사업자", "기타"];

/* 비과세종합저축 가입 자격(조특법 §88의2). '해당 없음'이면 대상 아님 */
export const NONTAX_QUALS = [
  "해당 없음",
  "만 65세 이상·기초연금 수급자",
  "장애인",
  "기초생활수급자",
  "독립유공자·유족",
  "국가유공자 상이자",
];

/* 상담 시 조정하는 값(소득 유형·무주택 세대주·비과세종합저축 자격)에 따라
   자격·소득공제가 달라지는 상품을 파생한다. 조회는 「가입 여부(held)」만, 자격 판단은 이 값으로. */
export function viewProduct(product, manual, restricted = false) {
  const { incomeType, homeless, nontaxQual, salaryUnder7000 } = manual;

  if (product.key === "nontaxSavings") {
    const remain = { label: "남은 비과세 한도", value: "5,000만원", strong: true };
    if (nontaxQual == null) {
      return { ...product, state: "unknown", metrics: [remain], note: "비과세종합저축 자격을 확인하세요." };
    }
    if (nontaxQual === "해당 없음") {
      return {
        ...product,
        state: "none",
        metrics: [{ label: "비과세 한도", value: "5,000만원" }],
        note: "만 65세 이상·장애인·기초생활수급자·독립유공자 등만 가입 가능.",
      };
    }
    if (product.held) {
      return { ...product, state: "active", metrics: [remain], note: `${nontaxQual} · 가입 중 (전금융기관 합산, 타행 별도 확인).` };
    }
    if (restricted) {
      return {
        ...product,
        state: "restricted",
        metrics: [{ label: "비과세 한도", value: "5,000만원" }],
        note: `${nontaxQual} 자격은 있으나 종합과세 대상/이력으로 신규 가입 제한.`,
      };
    }
    return { ...product, state: "recommend", metrics: [remain], note: `${nontaxQual} → 남은 한도까지 비과세 예적금 권유 (전금융기관 합산, 타행 별도 확인).` };
  }

  if (product.key === "noran") {
    if (incomeType == null) {
      return { ...product, state: "unknown", metrics: [{ label: "소득공제", value: "소득 유형 확인" }], note: "소득 유형을 확인하세요." };
    }
    const eligible = incomeType === "개인사업자";
    if (product.held) {
      return {
        ...product,
        state: "active",
        metrics: [
          { label: "월 부금", value: product.monthly || "—" },
          { label: "소득공제", value: eligible ? "사업소득 규모별" : "자격 재확인" },
        ],
        note: eligible ? "소득공제 적용 · 부금 증액 여력 점검." : "가입 중(소득유형 변경 시 자격 재확인).",
      };
    }
    if (eligible) {
      return {
        ...product,
        state: "recommend",
        cta: { to: "/noran", label: "노란우산 상담" },
        metrics: [{ label: "혜택", value: "소득공제 + 폐업 대비", strong: true }],
        note: "사업소득자 소득공제 핵심 상품입니다. 미보유 상태라 가입을 권유하세요.",
      };
    }
    return { ...product, state: "none", metrics: [{ label: "가입 자격", value: "소기업·소상공인" }], note: "사업소득자(소기업·소상공인)만 가입 대상이라 해당 없음." };
  }

  if (product.key === "housing") {
    if (incomeType == null || homeless == null || salaryUnder7000 == null) {
      return {
        ...product,
        state: "active",
        metrics: [{ label: "월 납입", value: product.monthly || "10만원" }, { label: "소득공제", value: "확인 필요" }],
        note: "소득 유형·무주택 세대주·총급여(7천만원 이하)를 확인하세요.",
      };
    }
    const deductible = incomeType === "근로소득자" && homeless && salaryUnder7000;
    return {
      ...product,
      state: "active",
      metrics: [
        { label: "월 납입", value: product.monthly || "10만원" },
        { label: "소득공제", value: deductible ? "대상(무주택·총급여 7천↓)" : "대상 아님" },
      ],
      note: deductible
        ? "무주택 세대주 근로자(총급여 7천만원 이하) 소득공제 대상. 유지 권장."
        : "청약 자격 유지 목적. 소득공제는 무주택·근로·총급여 7천만원 이하만.",
    };
  }

  if (product.key === "cardPersonal") {
    if (product.held) {
      const cards = product.cards || [];
      const monthlyTotal = cards.reduce((s, c) => s + (c.monthly || 0), 0);
      const annual = monthlyTotal * 12;
      return {
        ...product,
        state: "active",
        cards,
        metrics: cards.length
          ? [
              { label: "연간 카드 이용금액(추정)", value: `${annual.toLocaleString()}만원`, strong: true },
              { label: "월 이용금액 합계", value: `${monthlyTotal.toLocaleString()}만원` },
            ]
          : [{ label: "보유", value: "개인 신용카드" }],
        note: "소득공제 최저사용금액(총급여 25%)과 비교해 초과분이 적으면 캐시백·공제율 높은 카드 추가 권유를 검토하세요. 아래 신용카드 소득공제 참고.",
      };
    }
    return {
      ...product,
      state: "recommend",
      cta: { to: "/card", label: "카드 권유" },
      metrics: [{ label: "미보유", value: "개인 신용카드", strong: true }],
      note: "개인 신용카드 미보유. 최저사용금액 초과분 소득공제·캐시백 카드 신규 권유.",
    };
  }

  if (product.key === "cardBiz") {
    if (incomeType && incomeType !== "개인사업자") {
      return {
        ...product,
        state: "none",
        metrics: [{ label: "가입 대상", value: "개인사업자" }],
        note: "개인사업자 전용 기업카드라 해당 없음.",
      };
    }
    if (product.held) {
      return {
        ...product,
        state: "active",
        metrics: [{ label: "보유", value: "개인사업자 신용카드" }],
        note: "기업카드 보유 중. 사업지원·경비관리 서비스 활용을 점검하세요.",
      };
    }
    if (incomeType == null) {
      return {
        ...product,
        state: "unknown",
        metrics: [{ label: "가입 대상", value: "개인사업자" }],
        note: "소득 유형(개인사업자) 확인 후 기업카드 권유.",
      };
    }
    return {
      ...product,
      state: "recommend",
      cta: { to: "/card", label: "기업카드 권유" },
      metrics: [{ label: "미보유", value: "개인사업자 신용카드", strong: true }],
      note: "개인사업자이고 기업 신용카드 미보유. 사업지원·부가세환급·경비관리 카드 권유.",
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

  /* ── 진단 ── */
  if (j.isTarget) {
    items.push({
      group: "진단",
      tag: "우선",
      kind: "warn",
      title: "종합과세 대상, 신규 비과세·ISA 가입/연장 제한",
      detail: `당해 금융소득 ${won(j.financialIncome)}만원으로 기준(${won(
        j.threshold
      )}만원)을 초과했습니다. 신규 비과세·ISA 가입이 제한되니, 상품 판매보다 소득 분산·이연으로 방향을 잡으세요.`,
    });
  } else if (near) {
    items.push({
      group: "진단",
      tag: "우선",
      kind: "warn",
      title: `금융소득 ${won(j.financialIncome)}만원, 기준에 근접`,
      detail: `기준(${won(j.threshold)}만원)의 ${Math.round(
        ratio * 100
      )}% 수준입니다. 이자 수령 시점을 조절해 당해 합산소득이 기준을 넘지 않게 관리하세요.`,
    });
  } else {
    items.push({
      group: "진단",
      tag: "양호",
      kind: "ok",
      title: "비대상 · 절세상품을 더 채울 여지",
      detail: `금융소득 ${won(
        j.financialIncome
      )}만원으로 종합과세 대상이 아닙니다. 가입 제한이 없으므로 비과세·분리과세 상품을 적극 제안하기 좋은 고객입니다.`,
    });
  }

  if (!j.isTarget && j.restrictedByHistory) {
    items.push({
      group: "진단",
      tag: "제한 유의",
      kind: "warn",
      title: "직전 3년 대상 이력 → 비과세·ISA 가입/연장 제한",
      detail:
        "직전 3개 과세기간 중 대상 이력이 있어 비과세종합저축·ISA 신규가입·연장이 제한됩니다. 신규 제안은 세액공제·소득공제 상품 위주로 설계하세요.",
    });
  }

  if (!incomeType) {
    items.push({
      group: "진단",
      tag: "확인",
      kind: "prompt",
      title: "소득 유형을 확인하면 제안이 완성됩니다",
      detail: "근로/사업 여부에 따라 노란우산·주택청약·세액공제 제안이 달라집니다. 위 「고객에게 확인」에서 선택하세요.",
    });
  }

  /* ── 상품 제안 (판매) ── */
  products.forEach((p) => {
    if (p.state === "recommend") {
      items.push({
        group: "제안",
        tag: "판매 기회",
        kind: "sell",
        title: `${cleanLabel(SOURCES[p.key]?.label ?? p.key)} 신규 가입 권유`,
        detail: p.note,
        cta: p.cta,
      });
    }
  });

  products.forEach((p) => {
    if (p.state === "available" && p.remaining) {
      const label = cleanLabel(SOURCES[p.key]?.label ?? p.key);
      items.push({
        group: "제안",
        tag: "추가 판매",
        kind: "action",
        title: `${label} 납입 여력(${p.remaining}) 활용`,
        detail: `보유 중인 ${label}의 남은 한도를 채워, 과세되는 예금 이자를 비과세 구조로 이전하도록 제안하세요.`,
      });
    }
  });

  const noranActive = products.some((p) => p.key === "noran" && p.state === "active");
  if (incomeType === "근로소득자") {
    const housingDeduct = manual.homeless && manual.salaryUnder7000;
    items.push({
      group: "제안",
      tag: "세액공제",
      kind: "action",
      title: housingDeduct ? "IRP·연금저축 세액공제와 주택청약 소득공제" : "IRP·연금저축 세액공제 제안",
      detail: housingDeduct
        ? "연말정산에서 연금계좌 세액공제(IRP·연금저축 합산 900만원)와 무주택 세대주 주택청약 소득공제(총급여 7천만원 이하)를 함께 챙기도록 제안하세요."
        : "연말정산 연금계좌 세액공제(IRP·연금저축 합산 900만원)로 환급을 늘리도록 제안하세요.",
      cta: { to: "/pension", label: "연금 세액공제 계산" },
    });
  } else if (incomeType) {
    items.push({
      group: "제안",
      tag: "세액공제",
      kind: "action",
      title: noranActive ? "노란우산 부금 증액과 개인형 IRP·연금저축" : "개인형 IRP·연금저축 세액공제 제안",
      detail: noranActive
        ? "가입 제한이 없는 소득공제(노란우산)·세액공제(IRP·연금저축)로 절세를 확보하게 하세요. 사업소득 규모에 맞춰 부금 증액을 제안합니다."
        : "IRP·연금저축 세액공제(합산 900만원 한도)로 종합소득세 부담을 줄이도록 제안하세요.",
      cta: { to: "/pension", label: "연금 세액공제 계산" },
    });
  }

  /* ── 소득 분산·이연 (대상·근접·이력 시) ── */
  if (j.isTarget || near || j.restrictedByHistory) {
    items.push({
      group: "분산",
      tag: "소득 분산",
      kind: "action",
      title: "배우자·자녀 사전 증여로 금융자산 명의 분산",
      detail:
        "배우자 6억, 자녀 5천만원(미성년 2천만원)까지 10년 단위 비과세 증여. 이자·배당 자산을 나눠 1인당 금융소득 기준을 낮춥니다.",
    });
    items.push({
      group: "분산",
      tag: "비과세 전환",
      kind: "action",
      title: "국내주식형 펀드·ETF로 이자·배당 → 매매차익(비과세) 전환",
      detail:
        "국내 상장주식·주식형 펀드·ETF의 매매차익은 비과세입니다(분배금·배당은 과세). 과세되는 이자·배당 자산 일부를 매매차익 중심으로 옮겨 금융소득을 낮출 수 있습니다.",
    });
    items.push({
      group: "분산",
      tag: "비과세 전환",
      kind: "action",
      title: "외화예금·해외채권 환차익 비과세 활용",
      detail:
        "외화예금·외화채권의 환차익은 비과세입니다(예금이자는 과세). 브라질 국채 등은 이자·환차익 모두 비과세이므로, 과세 이자자산의 대체 수단으로 검토하세요.",
    });
  }

  if (j.isTarget) {
    items.push({
      group: "분산",
      tag: "시기 분산",
      kind: "action",
      title: "이자 수령 시기 분산으로 특정 연도 집중 회피",
      detail:
        "3년 만기 일시수령보다 매년 이자 수령·월이자지급식으로 옮겨, 특정 과세연도에 기준을 넘기는 것을 피하세요.",
    });
    items.push({
      group: "분산",
      tag: "과세 이연",
      kind: "action",
      title: "만기 도래 상품 해지 시점을 다음 해로 연기",
      detail:
        "당해 금융소득이 이미 기준을 초과했으므로, 만기 상품 해지·재예치 시점을 내년으로 넘겨 합산소득을 낮추는 것을 검토하세요.",
    });
  }

  return items;
}

/* 종합과세 대상 고객에게 상담 시 반드시 안내할 사항 (사진 「종합과세 시 불이익」 반영) */
export function targetGuidance(data) {
  const j = data.jonghap;
  return [
    { title: "5월 종합소득세 신고 의무", detail: `매년 5월 말까지 ${j.taxOffice}·홈택스에서 신고·납부(전년 1.1~12.31 소득).` },
    { title: "합산 누진과세로 세부담 증가", detail: "금융소득이 다른 소득과 합산돼 높은 누진세율 구간이 적용됩니다." },
    { title: "세제혜택 상품 가입 제한", detail: "비과세종합저축·ISA 등 신규가입·연장이 제한됩니다(직전 3개 과세기간 중 1회 이상 대상)." },
    { title: "인적·기본공제 배제 가능", detail: "부양가족의 소득금액 100만원(근로만 있으면 총급여 500만원) 초과 시 인적공제 대상에서 빠집니다." },
    { title: "건강보험료 부담 증가", detail: "지역가입자 보험료 인상 또는 피부양자 자격상실·지역가입자 전환이 생길 수 있습니다." },
  ];
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
  { title: "세금부담 증가", detail: "금융소득이 다른 소득과 합산 과세되어 높은 누진세율 구간 적용" },
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
