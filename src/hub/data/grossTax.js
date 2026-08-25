/* 금융소득 종합과세 관리 — 데이터 계층.

   목적: 지금은 계정계·보험·노란우산 등 여러 내부 화면(0192-1, 0192-74/75, 0192-8 …)에서
   따로 조회해야 하는 「비과세·분리과세 상품 현황」과 「종합과세 대상 여부」를,
   고객번호 하나로 이 사이트 한 곳에서 통합 조회하기 위한 스캐폴드.

   ⚠ 데모 목업이다. 실서비스에서는 각 항목의 source(내부 조회)를 실제 계정계 API로 대체한다.
   호출부는 queryGrossTax(customerNo)의 반환 형태에만 의존한다. */

/* 통합 조회 소스 — 각 데이터가 「원래 어느 화면에서 오는지」이자, 이 사이트가 통합하는 대상.
   출처 각주가 아니라, "흩어진 조회를 여기로 모은다"는 의도를 드러내는 라벨로 쓴다. */
export const SOURCES = {
  jonghap: { code: "0192-8", label: "종합과세 대상자 조회" },
  nontaxSavings: { code: "0192-1", label: "비과세종합저축 한도" },
  insMonthly: { code: "0192-74", label: "저축성보험(월적립식)" },
  insOther: { code: "0192-75", label: "저축성보험(월적립식 외)" },
  isa: { code: "계정계", label: "ISA 순이익·한도" },
  housing: { code: "전금융기관", label: "주택청약 가입조회" },
  noran: { code: "노란우산", label: "노란우산공제 조회" },
};

/* 상품 상태 → 색/의미.
   active=활용 중 · available=여력 있음(권유) · restricted=가입·연장 제한 · none=미가입/대상 아님 */
export const PRODUCT_STATE = {
  active: { label: "활용 중", tone: "im" },
  available: { label: "여력 있음", tone: "amber" },
  restricted: { label: "가입 제한", tone: "rose" },
  none: { label: "미보유", tone: "slate" },
};

/* ── 대표 고객 3인(리치 목업) ─────────────────────────────────────────
   기존 후속관리 seed 고객번호를 재사용해 화면 간 일관성 유지.
   841023391 종합과세 대상자 / 772501180 비대상·절세 잘 활용 / 904176624 경계(직전 3년 중 1회 대상) */
const CUSTOMERS = {
  "841023391": {
    customerNo: "841023391",
    name: "김○호",
    profile: "개인사업자 · 52세",
    jonghap: {
      taxYear: 2025,
      isTarget: true,
      financialIncome: 3120, // 만원
      threshold: 2000,
      taxOffice: "동대구세무서",
      history: [
        { year: 2024, isTarget: true },
        { year: 2023, isTarget: false },
        { year: 2022, isTarget: false },
      ],
      restrictedByHistory: true, // 직전 3개 과세기간 중 1회 이상 대상 → 비과세종합저축·ISA 가입/연장 제한
    },
    products: [
      {
        key: "nontaxSavings",
        state: "none",
        headline: "가입 대상 아님",
        metrics: [
          { label: "한도(전금융기관 합산)", value: "5,000만원" },
          { label: "사용", value: "0원" },
        ],
        note: "만 65세 이상·장애인·독립유공자 등만 가입 가능 — 현재 요건 미해당.",
      },
      {
        key: "insMonthly",
        state: "available",
        remaining: "월 70만원",
        headline: "월적립식 가입 · 납입 여력 있음",
        metrics: [
          { label: "월 납입", value: "80만원" },
          { label: "월 한도", value: "150만원" },
          { label: "남은 여력", value: "월 70만원" },
        ],
        note: "계약 10년 이상·월 150만원 이내 유지 시 보험차익 비과세.",
      },
      {
        key: "isa",
        state: "restricted",
        headline: "일반형 보유 · 연장·재가입 제한",
        metrics: [
          { label: "납입", value: "1,400 / 2,000만원" },
          { label: "비과세 한도", value: "200만원(일반형)" },
        ],
        note: "직전 3년 중 종합과세 대상 이력 → 만기 후 재가입·연장 제한 대상. 현 계좌 유지 위주로 안내.",
      },
      {
        key: "housing",
        state: "active",
        headline: "가입 중",
        metrics: [
          { label: "월 납입", value: "10만원" },
          { label: "소득공제", value: "사업소득자 — 대상 아님" },
        ],
        note: "무주택 세대주 근로소득자만 소득공제. 청약 자격 유지 목적으로 활용.",
      },
      {
        key: "noran",
        state: "active",
        headline: "가입 중 · 소득공제 적용",
        metrics: [
          { label: "월 부금", value: "20만원" },
          { label: "소득공제", value: "연 최대 500만원(사업소득 규모별)" },
        ],
        note: "폐업·퇴임 시 공제금 수령. 사업소득자 소득공제 핵심 수단 — 부금 증액 여력 점검.",
      },
    ],
  },

  "772501180": {
    customerNo: "772501180",
    name: "이○희",
    profile: "근로소득자 · 48세",
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
      {
        key: "nontaxSavings",
        state: "none",
        headline: "가입 대상 아님",
        metrics: [
          { label: "한도(전금융기관 합산)", value: "5,000만원" },
          { label: "사용", value: "0원" },
        ],
        note: "만 65세 이상·장애인 등 요건 미해당(48세).",
      },
      {
        key: "insOther",
        state: "available",
        remaining: "2,000만원",
        headline: "일시납 보유 · 납입 여력 있음",
        metrics: [
          { label: "일시납 보험료", value: "8,000만원" },
          { label: "일시납 한도", value: "1억원" },
          { label: "남은 여력", value: "2,000만원" },
        ],
        note: "계약 10년 이상 유지 시 보험차익 비과세. 한도까지 2,000만원 추가 여력.",
      },
      {
        key: "isa",
        state: "available",
        remaining: "200만원",
        headline: "서민형 보유 · 납입 여력 있음",
        metrics: [
          { label: "납입", value: "1,800 / 2,000만원" },
          { label: "비과세 한도", value: "400만원(서민형)" },
          { label: "남은 납입", value: "200만원" },
        ],
        note: "서민형(비과세 400) 활용 우수. 올해 납입 여력 200만원을 마저 채우면 유리.",
      },
      {
        key: "housing",
        state: "active",
        headline: "가입 중 · 소득공제 대상",
        metrics: [
          { label: "월 납입", value: "10만원" },
          { label: "소득공제", value: "총급여 7천 이하 — 대상" },
        ],
        note: "무주택 세대주 근로소득자 소득공제 대상. 납입 유지 권장.",
      },
      {
        key: "noran",
        state: "none",
        headline: "가입 대상 아님",
        metrics: [{ label: "가입 자격", value: "소기업·소상공인" }],
        note: "근로소득자는 가입 대상 아님(사업소득 발생 시 재검토).",
      },
    ],
  },

  "904176624": {
    customerNo: "904176624",
    name: "박○수",
    profile: "개인사업자 · 59세",
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
      {
        key: "nontaxSavings",
        state: "none",
        headline: "가입 대상 아님",
        metrics: [
          { label: "한도(전금융기관 합산)", value: "5,000만원" },
          { label: "사용", value: "0원" },
        ],
        note: "만 65세 이상 등 요건 미해당(59세).",
      },
      {
        key: "isa",
        state: "restricted",
        headline: "일반형 보유 · 재가입·연장 제한",
        metrics: [
          { label: "납입", value: "600 / 2,000만원" },
          { label: "비과세 한도", value: "200만원(일반형)" },
        ],
        note: "직전 3년 중 대상 이력(2023) → 만기 후 재가입·연장 제한. 신규 비과세상품 가입도 제한.",
      },
      {
        key: "housing",
        state: "active",
        headline: "가입 중",
        metrics: [
          { label: "월 납입", value: "10만원" },
          { label: "소득공제", value: "사업소득자 — 대상 아님" },
        ],
        note: "청약 자격 유지 목적. 소득공제는 근로소득자 한정.",
      },
      {
        key: "noran",
        state: "active",
        headline: "가입 중 · 소득공제 적용",
        metrics: [
          { label: "월 부금", value: "10만원" },
          { label: "소득공제", value: "사업소득 규모별 한도" },
        ],
        note: "부금 증액 시 소득공제 확대 여지 — 사업소득 규모 확인 후 안내.",
      },
    ],
  },
};

/* 절세 전략 = 조회된 사실에서 규칙으로 도출한다(하드코딩 아님).
   실서비스에서도 이 함수 하나가 모든 고객의 전략을 결정론적으로 생성한다 —
   "왜 이 전략이 나왔나"가 규칙으로 추적되어 컴플라이언스에도 부합.
   입력: jonghap(대상여부·기준근접·이력제한) + products(상태·남은한도) + 소득유형 */
export function deriveStrategy(data) {
  const j = data.jonghap;
  const ratio = j.threshold ? j.financialIncome / j.threshold : 0;
  const near = !j.isTarget && ratio >= 0.8;
  const won = (v) => v.toLocaleString();
  const items = [];

  /* 1) 진단 헤드라인 — 대상 / 기준근접 / 비대상 */
  if (j.isTarget) {
    items.push({
      tag: "우선",
      kind: "warn",
      title: "종합과세 대상 — 신규 비과세·ISA 가입/연장 제한",
      detail: `당해 금융소득 ${won(j.financialIncome)}만원으로 기준(${won(
        j.threshold
      )}만원)을 초과했습니다. 비과세종합저축·ISA 신규가입·연장이 제한되니, 상품 가입보다 소득 분산·이연으로 방향을 잡으세요.`,
    });
  } else if (near) {
    items.push({
      tag: "우선",
      kind: "warn",
      title: `금융소득 ${won(j.financialIncome)}만원 — 기준에 근접`,
      detail: `기준(${won(j.threshold)}만원)의 ${Math.round(
        ratio * 100
      )}% 수준입니다. 남은 기간 이자 수령 시점을 조절해 당해 합산소득이 기준을 넘지 않게 관리하세요.`,
    });
  } else {
    items.push({
      tag: "양호",
      kind: "ok",
      title: "비대상 · 현 절세 구조 유지",
      detail: `금융소득 ${won(
        j.financialIncome
      )}만원으로 종합과세 대상이 아닙니다. 보유 중인 비과세·분리과세 상품을 유지하며 남은 한도를 활용하세요.`,
    });
  }

  /* 2) 직전 3년 이력 제한(현재 비대상이라도 상품 가입 제한) */
  if (!j.isTarget && j.restrictedByHistory) {
    items.push({
      tag: "제한 유의",
      kind: "warn",
      title: "직전 3년 대상 이력 → 비과세·ISA 가입/연장 제한",
      detail:
        "직전 3개 과세기간 중 종합과세 대상 이력이 있어 비과세종합저축·ISA 신규가입·연장이 제한됩니다. 신규 절세는 세액공제·소득공제 상품 위주로 설계하세요.",
    });
  }

  /* 3) 보유 상품 납입 여력 — 제한 대상이 아닌 비과세 상품의 남은 한도 채우기 */
  data.products.forEach((p) => {
    if (p.state === "available" && p.remaining) {
      const label = SOURCES[p.key]?.label ?? p.key;
      items.push({
        tag: "상품",
        kind: "action",
        title: `${label} 납입 여력(${p.remaining}) 활용`,
        detail: `제한 대상이 아닌 ${label}의 남은 한도를 채워, 과세되는 예금 이자를 비과세 구조로 이전할 수 있습니다.`,
      });
    }
  });

  /* 4) 세액공제·소득공제 — 가입 제한과 무관하므로 항상 권유. 노란우산 보유 시 증액 우선 */
  const noranActive = data.products.some((p) => p.key === "noran" && p.state === "active");
  items.push({
    tag: "세액공제",
    kind: "action",
    title: noranActive
      ? "노란우산 부금 증액 + 개인형 IRP·연금저축 세액공제"
      : "개인형 IRP·연금저축 세액공제 활용",
    detail: noranActive
      ? "가입 제한이 없는 소득공제(노란우산)·세액공제(IRP·연금저축)로 절세를 확보하세요. 사업소득 규모에 맞춰 부금 증액 여력을 점검합니다."
      : "연금계좌 세액공제(합산 900만원 한도)로 연말정산·종합소득세 부담을 줄일 수 있습니다. 연금계좌 모듈에서 환급액을 계산해 제시하세요.",
  });

  /* 5) 소득 분산 — 대상자·기준근접·이력제한일 때 */
  if (j.isTarget || near || j.restrictedByHistory) {
    items.push({
      tag: "소득 분산",
      kind: "action",
      title: "배우자·자녀 사전 증여로 금융자산 명의 분산",
      detail:
        "배우자 6억, 자녀 5천만원(미성년 2천만원)까지 10년 단위 비과세 증여. 이자·배당 자산을 나눠 1인당 금융소득 기준을 낮춥니다.",
    });
  }

  /* 6) 시기 분산·과세 이연 — 이미 대상인 경우 강조 */
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

/* 고객번호로 통합 조회. 없으면 null(→ 화면에서 '조회 결과 없음' + 대표번호 안내). */
export function queryGrossTax(customerNo) {
  const key = (customerNo || "").replace(/\D/g, "");
  return CUSTOMERS[key] || null;
}

/* 데모 안내용 — 리치데이터가 있는 대표 고객번호 목록 */
export const SAMPLE_CUSTOMERS = Object.values(CUSTOMERS).map((c) => ({
  customerNo: c.customerNo,
  name: c.name,
  tag: c.jonghap.isTarget ? "종합과세 대상" : c.jonghap.restrictedByHistory ? "가입 제한(이력)" : "비대상",
}));

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
