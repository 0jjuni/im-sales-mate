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
    desc: "예금 절세 비교 계산기 · 세제 한눈에 · 조특법 근거 FAQ (데모)",
    to: "/isa",
    status: "active",
    accent: "emerald",
    icon: "PiggyBank",
  },
  {
    /* 연금저축과 IRP는 세액공제 한도(900만원)를 공유하므로 한 모듈로 묶는다.
       따로 만들면 계산기가 반쪽이 된다. */
    id: "pension",
    name: "연금계좌",
    tagline: "연금저축 · IRP",
    desc: "세액공제 계산기(배분 최적화) · 가입 시기별 과세 판별 · 소득세법 근거 FAQ (데모)",
    to: "/pension",
    status: "active",
    accent: "violet",
    icon: "Landmark",
  },
  {
    id: "banca",
    name: "방카슈랑스",
    tagline: "연금보험 · 저축성보험",
    desc: "예금 대비 비교 · 비과세 요건 · 사업비 안내",
    status: "coming",
    accent: "sky",
    icon: "Shield",
  },
];
