/* 데모 예시 데이터 — 후속 관리 화면이 비어 보이지 않도록 첫 진입 시 한 번만 채운다.
   storage.js가 「아직 시드한 적 없고 비어 있을 때」만 불러 쓰고, 이후 삭제하면 다시 생기지 않는다.

   ⚠ 개인정보 최소화 원칙 준수: 고객번호(가상)와 메모만. 이름·연락처·주민번호 없음.
   날짜는 오늘 기준 상대값으로 생성 — 지남/오늘/임박 배지가 실제처럼 보인다.

   category: "todo"(할 일·후속 연락) | "note"(고객 메모) | "leave"(휴가 계획) | "training"(연수 계획)
   author: 작성자. "나" = 현재 로그인 직원(가정), 그 외 = 동료(지점 공유 알림 대상). */

const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const rel = (offset) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return toISO(d);
};

/* 할 일(todo) — 대표 고객 3인(진단 화면과 동일 고객번호) 중심 + 배경 고객 소수.
   각 메모는 그 고객의 재무 상태·권유 전략과 앞뒤가 맞게(진단→일정 연결).

   날짜(offset) 판단 기준:
   · 날짜 있음 = 약속이 잡혔거나(재방문 예정), 만기·이탈 위험 같은 마감이 있는 건
   · 기한 없음(offset:null) = 다음 방문 때 하면 되는 자료 준비, 고객이 연락 주기로 한 대기 건 */
const TODOS = [
  /* 841023391 김단디 — 제조·도매업 대표, 종합과세 대상 → 판매보다 소득 분산·비과세 전환 */
  {
    /* 만기 지나 재예치 이탈 위험 → 마감 성격, 날짜 필요(지남) */
    customerNo: "841023391",
    memo: "18일 뒤 예금 8,000만원 만기. 자금 사용 계획과 재예치 의사 확인 후 기존 보험 추가 납입 비교",
    offset: -3,
    scope: "mine",
  },
  {
    /* 다음 방문 때 쓸 자료 준비 → 특정일 없음, 기한 없음 */
    customerNo: "841023391",
    memo: "노란우산 월 20만원 납입 유지 중. 연금계좌 납입 현황을 확인하고 계산기로 추가 납입 검토",
    offset: null,
    scope: "mine",
  },
  /* 772501180 이똑디 — 맞벌이 근로소득자, 판매 기회 → 서민형 ISA·청약·IRP */
  {
    /* 대표 판매 기회 → 놓치지 않게 이번 주 목표일 지정, 날짜 필요 */
    customerNo: "772501180",
    memo: "타행 ISA 보유 여부와 가입 유형 확인 후 ISA 상담. 청약은 무주택·총급여 조건 확인",
    offset: 1,
    scope: "mine",
  },
  {
    /* 상담 때 쓸 시뮬레이션 준비 → 특정일 없음, 기한 없음 */
    customerNo: "772501180",
    memo: "연금계좌 기존 납입액 확인 후 세액공제 계산. 만기자금 3,000만원의 사용 시점도 확인",
    offset: null,
    scope: "mine",
  },
  /* 904176624 박우디 — 소매점, 은퇴 준비, 이력 제한 → 소득공제·세액공제·시기 분산 */
  {
    /* 오늘 오후 재방문 약속 → 날짜 필요(오늘) */
    customerNo: "904176624",
    memo: "ISA 신규·연장 제한 이력 확인. 기존 계좌 처리 조건을 확인하고 노란우산 신규 상담으로 연결",
    offset: 0,
    scope: "mine",
  },
  {
    /* 오늘 재방문 자리에서 함께 꺼낼 제안 → 별도 마감 없음, 기한 없음 */
    customerNo: "904176624",
    memo: "노란우산 당행 미보유. 타기관 가입 여부 확인 후 신규 납입 계산, 사업자카드와 국민은행 결제계좌 전환 상담",
    offset: null,
    scope: "mine",
  },
  /* 배경 고객 — 진단 프로필은 없지만 실제 지점처럼 다양한 후속 존재 */
  {
    /* 고객이 연락 주기로 한 대기 건 → 내가 잡은 날짜 아님, 기한 없음(지점 공유) */
    customerNo: "630084412",
    memo: "타행 IRP 이전 절차·수수료 문의 전화 주기로 함",
    offset: null,
    scope: "branch",
    author: "이지현 대리",
    fresh: true,
  },
  { customerNo: "400218834", memo: "대출 만기 연장 서류 준비되면 연락 주기로 함(날짜 미정)", offset: null, scope: "mine" },
];

/* 고객 메모(note) — 날짜·완료 개념 없이 「이 고객 어떤 사람인지」 기억용. 진단 페르소나와 결이 같게. */
const NOTES = [
  {
    customerNo: "841023391",
    memo: "제조·도매업 대표. 노란우산·청약·개인카드 보유. 종합과세 이력에 따른 제한을 먼저 안내하고 기존 상품 관리 중심 상담",
    scope: "mine",
  },
  {
    customerNo: "772501180",
    memo: "근로소득자. ISA·청약·개인 신용카드 당행 미보유. 만기자금 사용 시점 확인 후 ISA와 연금 상담",
    scope: "branch",
    author: "박준호 대리",
  },
  {
    customerNo: "904176624",
    memo: "소매점 운영. 노란우산·사업자카드 당행 미보유, 가맹점 결제은행은 국민은행. 예금 만기 상담에서 신규 상품·결제계좌 전환으로 연결",
    scope: "mine",
  },
];

/* 지점 일정(휴가·연수 계획) — 기간(시작~종료), 동료가 올린 지점 공유. 알림 데모용 fresh. */
const STAFF = [
  {
    category: "branch",
    staffName: "지점 정례 회의",
    author: "이지현 대리",
    time: "08:30",
    memo: "오전 8시 30분까지 도착 부탁드립니다. 회의 후 바로 개점 준비합니다.",
    startOffset: 2,
    endOffset: 2,
    fresh: true,
  },
  {
    category: "branch",
    staffName: "방카슈랑스 교육",
    author: "박준호 대리",
    time: "17:00",
    memo: "오후 5시 방카 교육이 있어 지점 분들 빠른 마감 부탁드립니다.",
    startOffset: 4,
    endOffset: 4,
    fresh: true,
  },
  {
    category: "branch",
    staffName: "월말 실적 마감 워크숍",
    author: "이지현 대리",
    time: "17:30",
    memo: "5시 30분 회의실 집합. 월말 실적 마감·다음 달 목표 공유합니다.",
    startOffset: 5,
    endOffset: 5,
  },
  {
    category: "branch",
    staffName: "전산 정기점검",
    author: "박준호 대리",
    time: "18:00",
    memo: "18시 이후 전산 점검이 있으니 마감 업무를 서둘러 마무리해 주세요.",
    startOffset: 7,
    endOffset: 7,
  },
  {
    category: "branch",
    staffName: "소방 대피 훈련",
    author: "이지현 대리",
    time: "14:00",
    memo: "오후 2시 소방 대피 훈련. 진행 중 고객 안내 협조 부탁드립니다.",
    startOffset: 11,
    endOffset: 11,
  },
  { category: "leave", staffName: "박준호 대리", author: "박준호 대리", memo: "연차 휴가", startOffset: 6, endOffset: 8, fresh: true },
  {
    category: "training",
    staffName: "이지현 대리",
    author: "이지현 대리",
    memo: "본점 집합교육(여신 심사 실무). 이틀간 자리 비웁니다.",
    startOffset: 9,
    endOffset: 10,
    fresh: true,
  },
];

export function buildSeedItems() {
  const now = Date.now();
  let seq = 0;
  const mk = (base, extra) => {
    seq += 1;
    return {
      id: `seed_${seq}`,
      category: base.category ?? "todo",
      scope: base.scope === "branch" ? "branch" : "mine",
      author: base.author ?? "이현수 계장",
      customerNo: base.customerNo ?? "",
      staffName: base.staffName ?? "",
      memo: base.memo,
      followUpDate: null,
      startDate: null,
      endDate: null,
      time: base.time ?? "",
      status: "open",
      /* fresh(동료가 방금 올린 지점 공유) = 아주 최근, 나머지는 과거로 */
      createdAt: base.fresh ? now - seq * 1000 : now - (seq + 200) * 60000,
      ...extra,
    };
  };

  const todos = TODOS.map((t) => mk(t, { category: "todo", followUpDate: t.offset === null ? null : rel(t.offset) }));
  const notes = NOTES.map((n) => mk(n, { category: "note" }));
  const staff = STAFF.map((s) =>
    mk(s, { scope: "branch", startDate: rel(s.startOffset), endDate: rel(s.endOffset) })
  );

  return [...staff, ...todos, ...notes];
}
