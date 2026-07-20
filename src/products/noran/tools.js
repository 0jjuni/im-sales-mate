/* 노란우산공제 모듈의 도구 매니페스트.
   허브의 도구 레지스트리(src/hub/registry/toolRegistry.js)가 이 배열을 집계해
   「내 도구」 등록·최근 사용 추적·도구 라이브러리에 노출한다.

   새 모듈을 추가할 때는 이 파일과 같은 형태의 매니페스트를 만들고
   레지스트리의 MODULE_MANIFESTS에 한 줄 추가하면 된다. (README 참고)

   ToolShape:
   { id:       "모듈id.도구id" 전역 유일 키 (저장소에 기록되므로 변경 금지),
     name, desc, to(라우트 경로), icon(lucide 아이콘 이름 — 허브 ICON 맵에 등록 필요),
     group:    라이브러리에서 묶어 보여줄 소그룹 라벨 } */
export const NORAN_MODULE = {
  id: "noran",
  name: "노란우산공제",
  accent: "amber",
};

export const NORAN_TOOLS = [
  {
    id: "noran.calc.tax",
    name: "소득공제 절세효과 계산기",
    desc: "월 부금액 기준 연간 추정 절세액 + 고객 전달용 출력",
    to: "/noran/calculator/tax",
    icon: "Coins",
    group: "세일즈 계산기",
  },
  {
    id: "noran.calc.refund",
    name: "해약환급금 시나리오",
    desc: "해약 시점별 환급금 추정 + 유지 시 비교",
    to: "/noran/calculator/refund",
    icon: "TrendingDown",
    group: "세일즈 계산기",
  },
  {
    id: "noran.calc.compare",
    name: "상품 비교 계산기",
    desc: "노란우산 vs 적금 vs 연금저축 추정 비교",
    to: "/noran/calculator/compare",
    icon: "Scale",
    group: "세일즈 계산기",
  },
  {
    id: "noran.simulator",
    name: "상담 시뮬레이터",
    desc: "고객 상황 트리 분류 → 안내·구비서류 도달, 세일즈 코치 모드",
    to: "/noran/simulator",
    icon: "MessageSquare",
    group: "상담 지원",
  },
  {
    id: "noran.checklist",
    name: "구비서류 체크리스트",
    desc: "11개 사유별 구비서류 + 고객 안내 스크립트 생성",
    to: "/noran/checklist",
    icon: "CheckSquare",
    group: "상담 지원",
  },
  {
    id: "noran.faq",
    name: "FAQ 즉시 검색",
    desc: "약관·법령 근거 FAQ 60건 검색",
    to: "/noran/faq",
    icon: "HelpCircle",
    group: "상담 지원",
  },
];
