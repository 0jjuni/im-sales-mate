/* 상품 모듈 레지스트리 — 허브 카드 그리드의 소스.
   status: "active"(진입 가능) | "coming"(준비 중)
   accent: 상품 아이덴티티 컬러 키. 실제 클래스는 ProductCard의 ACCENT 맵에서 정적으로 매핑.
   모듈이 늘어나면 여기에 항목만 추가하면 된다. */
export const PRODUCTS = [
  {
    id: "noran",
    name: "노란우산공제",
    tagline: "소기업·소상공인 공제",
    desc: "상담 시뮬레이터 · 절세/환급 계산기 · FAQ · 구비서류 체크리스트",
    to: "/noran",
    status: "active",
    accent: "amber",
    icon: "Umbrella",
  },
  {
    id: "isa",
    name: "ISA",
    tagline: "개인종합자산관리계좌",
    desc: "세제 절세 계산기 · 세제 한눈에 · 조특법 근거 FAQ (데모)",
    to: "/isa",
    status: "active",
    accent: "emerald",
    icon: "PiggyBank",
  },
  {
    id: "pension",
    name: "연금저축",
    tagline: "세액공제 연금계좌",
    desc: "노후 설계 · 세액공제 한도 · 연금수령 과세",
    status: "coming",
    accent: "violet",
    icon: "Landmark",
  },
  {
    id: "irp",
    name: "IRP",
    tagline: "개인형 퇴직연금",
    desc: "퇴직급여 이전 · 세액공제 · 운용 규제",
    status: "coming",
    accent: "sky",
    icon: "Wallet",
  },
];
