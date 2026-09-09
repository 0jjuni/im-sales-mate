/* 투자상품 도구 매니페스트 — 허브 도구 레지스트리가 집계해
   「내 도구」·도구 라이브러리·최근 사용에 노출한다. (형식은 noran/tools.js 참고) */
export const WEALTH_MODULE = {
  id: "wealth",
  name: "투자상품",
  accent: "sky",
};

export const WEALTH_TOOLS = [
  {
    id: "wealth.explore",
    name: "투자상품 탐색",
    desc: "펀드·ETF·신탁 검색·비교, 위험등급·투자성향 필터",
    to: "/wealth",
    icon: "LineChart",
    group: "투자상품",
  },
  {
    id: "wealth.customers",
    name: "내 가입 고객 관리",
    desc: "가입 고객의 목표수익률·수익 알림 관리",
    to: "/wealth?tab=customers",
    icon: "Users",
    group: "투자상품",
  },
];
