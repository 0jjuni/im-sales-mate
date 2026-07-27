/* ISA 모듈 도구 매니페스트 — 허브 도구 레지스트리가 집계.
   노란과 동일 구조. 도구 id는 사용자 저장소에 기록되므로 배포 후 변경 금지. */
export const ISA_MODULE = {
  id: "isa",
  name: "ISA",
  accent: "emerald",
};

export const ISA_TOOLS = [
  {
    id: "isa.calc.tax",
    name: "세제 절세 계산기",
    desc: "ISA vs 일반계좌 세부담 비교 + 상담 자료 인쇄",
    to: "/isa/calculator",
    icon: "Percent",
    group: "세일즈 계산기",
  },
  {
    id: "isa.faq",
    name: "세제 FAQ 검색",
    desc: "비과세·손익통산·의무기간 등 조특법 근거 FAQ",
    to: "/isa/faq",
    icon: "HelpCircle",
    group: "상담 지원",
  },
];
