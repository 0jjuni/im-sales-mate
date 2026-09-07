/* 신용카드 발급 요건 조회(넥스피아 4개 요건) — 데모 데이터.

   실제 발급 가능 여부는 계정계에서 여러 요건이 종합 필터링되어 결정된다.
   그중 넥스피아에서 「이 요건으로 발급 가능한지」를 조회할 수 있는 4개 요건만 여기서 보여 준다.
   화면에는 요건별 「가능/불가」 여부만 노출하고, 근거 수치는 표시하지 않는다.

   ⚠ 데모 목업이다. 실서비스에서는 queryEligibility(customerNo)를 넥스피아 조회로 대체한다. */

export const CARD_REQUIREMENTS = [
  {
    id: "asset_txn",
    name: "금융자산 거래자",
    criteria: "3개월 평잔 100만원 이상 · 입출금 거래 100만원 이상",
  },
  {
    id: "asset_hold",
    name: "금융자산 보유자",
    criteria: "6개월 수신 평잔 1,000만원 이상",
  },
  {
    id: "salary",
    name: "급여 소득자",
    criteria: "3개월 이상 월평균 100만원 이상 급여 입금",
  },
  {
    id: "check_card",
    name: "체크카드 거래자",
    criteria: "체크카드 신규발급 6개월 경과 · 사용 10만원 이상 · 만 30세 이상",
  },
];

/* 예시 고객 — 요건별 충족(met) 여부만. 고객번호는 고객 진단 3인과 통일 + 다양한 케이스 추가.
   met: { 요건id: true/false } */
const CUSTOMERS = {
  // 김우디 — 제조·도매업 대표: 예금·거래 활발, 사업자라 급여 없음
  "841023391": {
    name: "김우디",
    age: "52세",
    profile: "제조·도매업 대표",
    met: { asset_txn: true, asset_hold: true, salary: false, check_card: false },
  },
  // 이단디 — 맞벌이 근로소득자: 급여·입출금 활발
  "772501180": {
    name: "이단디",
    age: "48세",
    profile: "맞벌이 근로소득자",
    met: { asset_txn: true, asset_hold: false, salary: true, check_card: false },
  },
  // 박똑디 — 소매점·은퇴 준비: 수신 잔액은 크지만 급여·거래는 적음
  "904176624": {
    name: "박똑디",
    age: "59세",
    profile: "소매점 운영",
    met: { asset_txn: false, asset_hold: true, salary: false, check_card: false },
  },
  // 정새록 — 사회초년생 직장인: 급여는 있으나 만 30세 미만이라 체크카드 요건 불가
  "330561487": {
    name: "정새록",
    age: "27세",
    profile: "사회초년생 직장인",
    met: { asset_txn: false, asset_hold: false, salary: true, check_card: false },
  },
  // 한여울 — 프리랜서: 급여 불규칙·자산 적음. 체크카드는 오래 써 요건 충족
  "615230948": {
    name: "한여울",
    age: "34세",
    profile: "프리랜서",
    met: { asset_txn: false, asset_hold: false, salary: false, check_card: true },
  },
  // 오세찬 — 거래 소액·최근 유입 적음: 4개 요건 모두 미충족(발급 불가 케이스)
  "208874102": {
    name: "오세찬",
    age: "41세",
    profile: "거래 소액 고객",
    met: { asset_txn: false, asset_hold: false, salary: false, check_card: false },
  },
};

/* 고객번호로 요건 조회. 없으면 null. 요건별 met + 충족 개수·발급 가능 여부를 파생. */
export function queryEligibility(customerNo) {
  const key = (customerNo || "").replace(/\D/g, "");
  const c = CUSTOMERS[key];
  if (!c) return null;
  const requirements = CARD_REQUIREMENTS.map((r) => ({ ...r, met: !!c.met[r.id] }));
  const metCount = requirements.filter((r) => r.met).length;
  return {
    customerNo: key,
    name: c.name,
    age: c.age,
    profile: c.profile,
    requirements,
    metCount,
    eligible: metCount > 0,
  };
}

/* 조회 예시 칩용 */
export const ELIGIBILITY_SAMPLES = Object.entries(CUSTOMERS).map(([no, c]) => {
  const metCount = CARD_REQUIREMENTS.filter((r) => c.met[r.id]).length;
  return { customerNo: no, name: c.name, tag: metCount > 0 ? `${metCount}개 요건 충족` : "충족 요건 없음" };
});
