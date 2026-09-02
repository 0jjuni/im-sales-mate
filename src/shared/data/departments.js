/* 부서(담당 부서) 레지스트리 — 각 상품 모듈을 어느 부서가 소유하는지 정의한다.
   실제 은행에서 상품 콘텐츠·공지는 담당 부서가 관리하므로, 「부서 → 상품」 소유 관계를
   명시적으로 둔다. 공지사항 시스템과 부서 관리자 화면이 이 레지스트리를 기준으로 동작한다.

   ※ 부서명은 데모용 예시값이다. 실제 조직도에 맞게 바꿔 쓰면 된다.
   accent: 모듈 아이덴티티 컬러 키(노란=amber, ISA=fuchsia, 연금=violet, 투자=emerald, 카드=rose, 진단/세무=im). */

export const MODULES = {
  noran: { label: "노란우산공제", to: "/noran", accent: "amber" },
  isa: { label: "ISA", to: "/isa", accent: "fuchsia" },
  pension: { label: "연금계좌", to: "/pension", accent: "violet" },
  wealth: { label: "투자상품", to: "/wealth", accent: "emerald" },
  card: { label: "카드", to: "/card", accent: "rose" },
};

export const DEPARTMENTS = [
  { id: "wm", name: "WM사업부", manager: "김성우 대리", modules: ["noran", "wealth"] },
  { id: "trustpension", name: "신탁연금부", manager: "이지현 대리", modules: ["pension", "isa"] },
  { id: "card", name: "카드사업부", manager: "박준호 대리", modules: ["card"] },
];

export const MODULE_IDS = Object.keys(MODULES);

export const getModule = (id) => MODULES[id] ?? null;
export const getDepartment = (id) => DEPARTMENTS.find((d) => d.id === id) ?? null;

/* 상품 모듈을 소유한 부서 */
export const deptOfModule = (moduleId) =>
  DEPARTMENTS.find((d) => d.modules.includes(moduleId)) ?? null;
