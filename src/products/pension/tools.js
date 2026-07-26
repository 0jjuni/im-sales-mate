/* 연금계좌 모듈 도구 매니페스트 — 허브 도구 레지스트리가 집계.
   도구 id는 사용자 저장소(핀·최근 사용)에 기록되므로 배포 후 변경 금지. */
export const PENSION_MODULE = {
  id: "pension",
  name: "연금계좌",
  accent: "violet",
};

export const PENSION_TOOLS = [
  {
    id: "pension.calc.credit",
    name: "IRP 세액공제 계산기",
    desc: "연말정산 환급액 계산 + 타사 연금저축 초과분 IRP 유치 포인트",
    to: "/pension/calculator",
    icon: "Coins",
    group: "세일즈 계산기",
  },
  {
    id: "pension.faq",
    name: "연금 FAQ 검색",
    desc: "세액공제·연금수령·중도해지 등 소득세법 근거 FAQ",
    to: "/pension/faq",
    icon: "HelpCircle",
    group: "상담 지원",
  },
];
