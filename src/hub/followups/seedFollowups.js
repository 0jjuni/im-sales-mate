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

/* 할 일(todo) — 지남·오늘·임박·예정·기한없음 골고루 */
const TODOS = [
  { customerNo: "841023391", memo: "정기예금 만기(지난주) 재예치 상담. 특판 금리 나오면 먼저 안내하기로 함", offset: -3, scope: "mine" },
  { customerNo: "772501180", memo: "노란우산 청약 서류(사업자등록증) 다시 받기로 함. 방문 시 챙길 것", offset: -1, scope: "branch", author: "이지현" },
  { customerNo: "904176624", memo: "ISA 만기 도래. 재가입 vs 연장 비교 원함. 오늘 오후 재방문 예정", offset: 0, scope: "mine" },
  { customerNo: "630084412", memo: "IRP 이전 절차·수수료 문의 전화 주기로 함", offset: 0, scope: "branch", author: "이지현", fresh: true },
  { customerNo: "519937705", memo: "연금저축 세액공제 한도 초과분 IRP 이체 설명 예정", offset: 2, scope: "mine" },
  { customerNo: "881642093", memo: "방카 만기자금 12월 초 나오면 재예치 상담 원함", offset: 5, scope: "mine" },
  { customerNo: "400218834", memo: "대출 만기 연장 서류 준비되면 연락 주기로 함(날짜 미정)", offset: null, scope: "mine" },
];

/* 고객 메모(note) — 날짜·완료 개념 없이 기억용 */
const NOTES = [
  { customerNo: "550123300", memo: "부부가 함께 방문하는 단골. 결정은 남편분, 실무는 사모님이 챙김", scope: "branch", author: "박준호" },
  { customerNo: "318759910", memo: "매장 확장 준비 중, 내년 초 자금 수요 예상. 노란우산 증액 여지 있음", scope: "mine" },
];

/* 지점 일정(휴가·연수 계획) — 기간(시작~종료), 동료가 올린 지점 공유. 알림 데모용 fresh. */
const STAFF = [
  { category: "branch", staffName: "월말 마감 점검 회의", author: "이지현", memo: "전 직원 참석", startOffset: 1, endOffset: 1, fresh: true },
  { category: "leave", staffName: "박준호", author: "박준호", memo: "연차 휴가", startOffset: 3, endOffset: 5, fresh: true },
  { category: "training", staffName: "이지현", author: "이지현", memo: "여신 심사 실무 연수(집합)", startOffset: 8, endOffset: 9, fresh: true },
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
      author: base.author ?? "나",
      customerNo: base.customerNo ?? "",
      staffName: base.staffName ?? "",
      memo: base.memo,
      followUpDate: null,
      startDate: null,
      endDate: null,
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
