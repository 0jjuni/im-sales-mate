/* 보조 도구 매니페스트 — 특정 상품에 매이지 않고 창구 업무 전반에서 쓰는 도구들.
   도구 id는 사용자 저장소(핀·최근 사용)에 기록되므로 배포 후 변경 금지. */
export const UTILITY_MODULE = {
  id: "utility",
  name: "보조 도구",
  accent: "sky",
};

export const UTILITY_TOOLS = [
  {
    id: "utility.name",
    name: "영문 이름 변환기",
    desc: "한글 이름을 영문 표기로 변환",
    to: "/tools/name",
    icon: "UserRound",
    group: "창구 업무",
  },
  {
    id: "utility.address",
    name: "영문 주소 변환기",
    desc: "도로명주소를 영문 표기로 변환",
    to: "/tools/address",
    icon: "MapPin",
    group: "창구 업무",
  },
];
