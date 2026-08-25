/* 데모 예시 데이터 — 후속 관리 화면이 비어 보이지 않도록 첫 진입 시 한 번만 채운다.
   storage.js가 「아직 시드한 적 없고 비어 있을 때」만 불러 쓰고, 이후 삭제하면 다시 생기지 않는다.

   ⚠ 개인정보 최소화 원칙 준수: 고객번호(가상)와 메모만. 이름·연락처·주민번호 없음.
   날짜는 오늘 기준 상대값으로 생성 — 지남/오늘/임박 배지가 실제처럼 보인다. */

const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/* 오늘 기준 offset일 뒤의 YYYY-MM-DD */
const rel = (offset) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return toISO(d);
};

/* 후속 연락(type: followup) — 지남·오늘·임박·예정·기한없음이 골고루 섞이도록 */
const FOLLOWUPS = [
  {
    customerNo: "841023391",
    memo: "정기예금 만기(지난주) 재예치 상담 — 특판 금리 나오면 먼저 안내하기로 함",
    offset: -3,
    products: ["deposit"],
    scope: "mine",
  },
  {
    customerNo: "772501180",
    memo: "노란우산 청약 서류(사업자등록증) 다시 받기로 함. 방문 시 챙길 것",
    offset: -1,
    products: ["noran"],
    scope: "branch",
  },
  {
    customerNo: "904176624",
    memo: "ISA 만기 도래 — 재가입 vs 연장 비교 원함. 오늘 오후 재방문 예정",
    offset: 0,
    products: ["isa"],
    scope: "mine",
  },
  {
    customerNo: "630084412",
    memo: "IRP 이전 절차·수수료 문의 전화 주기로 함",
    offset: 0,
    products: ["irp"],
    scope: "branch",
  },
  {
    customerNo: "519937705",
    memo: "연금저축 세액공제 한도 초과분 IRP 이체 설명 예정",
    offset: 2,
    products: ["pension", "irp"],
    scope: "mine",
  },
  {
    customerNo: "881642093",
    memo: "방카 만기자금 12월 초 나오면 재예치 상담 원함",
    offset: 5,
    products: ["banca", "deposit"],
    scope: "mine",
  },
  {
    customerNo: "723405567",
    memo: "펀드 평가손 회복 여부 보고 재상담 — 다음 주 재방문 약속",
    offset: 12,
    products: ["fund"],
    scope: "branch",
  },
  {
    customerNo: "400218834",
    memo: "대출 만기 연장 서류 준비되면 연락 주기로 함(날짜 미정)",
    offset: null,
    products: ["deposit"],
    scope: "mine",
  },
];

/* 고객 메모(type: note) — 날짜·완료 개념 없이 다음에 알아보기 위한 기록 */
const NOTES = [
  {
    customerNo: "550123300",
    memo: "부부가 함께 방문하는 단골 — 결정은 남편분, 실무는 사모님이 챙김",
    products: [],
    scope: "branch",
  },
  {
    customerNo: "318759910",
    memo: "매장 확장 준비 중, 내년 초 자금 수요 예상 — 노란우산 증액 여지 있음",
    products: ["noran"],
    scope: "mine",
  },
];

export function buildSeedItems() {
  const now = Date.now();
  let seq = 0;
  const mk = (base) => {
    seq += 1;
    return {
      id: `seed_${seq}`,
      customerNo: base.customerNo,
      memo: base.memo,
      products: base.products ?? [],
      scope: base.scope === "branch" ? "branch" : "mine",
      status: "open",
      /* 최근 등록순 정렬이 자연스럽도록 약간씩 과거로 */
      createdAt: now - seq * 60000,
    };
  };

  const followups = FOLLOWUPS.map((f) => ({
    ...mk(f),
    type: "followup",
    followUpDate: f.offset === null ? null : rel(f.offset),
  }));

  const notes = NOTES.map((n) => ({
    ...mk(n),
    type: "note",
    followUpDate: null,
  }));

  return [...followups, ...notes];
}
