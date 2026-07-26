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

/* 도구 이름에는 상품명을 넣지 않는다 — 허브의 타일·라이브러리·최근사용 칩이
   모두 소속 모듈명(노란우산공제)을 함께 보여주므로 중복이 된다.
   이름은 「무엇을 하는 도구인지」만 담는다. (ISA·연금계좌 모듈도 같은 규칙) */
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
    name: "해약환급금 계산기",
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
    /* 11개 사유는 폐업·사망·노령급부·재해 등 「공제금 지급사유」가 대부분이고
       임의해약은 그중 1건 — 「해약 서류」로 좁히면 나머지 10개를 못 담는다 */
    name: "공제금 청구 서류 체크리스트",
    desc: "폐업·사망·노령 등 11개 지급사유별 구비서류 + 행정정보 자동조회 안내",
    to: "/noran/checklist",
    icon: "CheckSquare",
    group: "상담 지원",
  },
  {
    id: "noran.faq",
    name: "약관·법령 FAQ 검색",
    desc: "약관·법령 근거 FAQ 61건 즉시 검색",
    to: "/noran/faq",
    icon: "HelpCircle",
    group: "상담 지원",
  },
];
