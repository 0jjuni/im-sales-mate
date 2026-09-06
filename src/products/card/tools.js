/* 카드 모듈 도구 매니페스트 — 허브 도구 레지스트리가 집계해
   「내 도구」·도구 라이브러리·최근 사용에 노출한다. (형식은 noran/tools.js 참고) */
export { CARD_MODULE } from "./data/cards";

export const CARD_TOOLS = [
  {
    id: "card.catalog",
    name: "카드 탐색",
    desc: "혜택·태그로 카드를 찾고 상세·상품설명서 확인",
    to: "/card",
    icon: "CreditCard",
    group: "카드",
  },
  {
    id: "card.promo",
    name: "가입 QR 발급",
    desc: "eBiz 가입 링크를 QR 전표로 인쇄해 고객에게 전달",
    to: "/card/promo",
    icon: "QrCode",
    group: "카드",
  },
];
