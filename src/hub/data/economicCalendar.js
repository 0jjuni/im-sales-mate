/* 이번 주 경제·금융 일정 — 담당자가 주간으로 수동 갱신하는 예시 데이터.
   뉴스 자동수집과 달리 일정은 사람이 관리한다(발표 일정은 기관 캘린더로 확인).
   실제 일정으로 교체해 쓸 것. 데모가 비지 않도록 날짜는 오늘 기준 상대값으로 생성한다.

   kind: 국내 / 해외 / 상품 */

const toISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const rel = (offset) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return toISO(d);
};

const EVENTS = [
  { offset: 1, kind: "국내", label: "통계청 「고용동향」 발표" },
  { offset: 3, kind: "해외", label: "미 FOMC 의사록 공개" },
  { offset: 6, kind: "국내", label: "한국은행 금융통화위원회 (기준금리 결정)" },
  { offset: 8, kind: "국내", label: "통계청 「소비자물가동향」 발표" },
];

/* 다가오는 순으로. 지난 항목(offset<0으로 편집 시)은 제외 */
export function getEconomicCalendar() {
  const today = rel(0);
  return EVENTS.map((e) => ({ date: rel(e.offset), kind: e.kind, label: e.label }))
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
}
