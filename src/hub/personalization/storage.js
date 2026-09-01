/* 대시보드 개인화 저장소 어댑터.
   데모에서는 localStorage(브라우저별 저장)를 쓰고, 실서비스에서 직원 계정별
   서버 저장으로 전환할 때는 이 파일의 load/save 구현만 API 호출로 교체하면 된다.
   (Context·컴포넌트는 이 어댑터의 인터페이스에만 의존 — README 「확장 가이드」 참고)

   스키마를 바꿀 때는 SCHEMA_VERSION을 올리고 migrate()에 이전 버전 → 새 버전
   변환을 추가한다. 버전 불일치 데이터는 기본값으로 초기화된다. */

/* 키는 초기 가제(salesbridge) 시절 값 유지 — 바꾸면 기존 사용자 저장분이 초기화된다 */
const STORAGE_KEY = "salesbridge.dashboard";
const SCHEMA_VERSION = 1;

export const DEFAULT_STATE = {
  version: SCHEMA_VERSION,
  /* 섹션 순서 — src/hub/sections.js의 id. 새 섹션은 로드 시 자동으로 뒤에 붙는다.
     아침에 열면 시황부터 훑고, 바로 쓰는 도구(내 도구·상품 상담·보조 도구)와
     고객 후속 관리가 이어지고, 읽을거리(뉴스·지식 라이브러리)를 아래에 둔다. */
  sectionOrder: ["notices", "market", "wealth", "mytools", "products", "utility", "followups", "news", "knowledge"],
  /* 상품 상담은 상단 네비 모듈 드롭다운과 중복이라 기본 숨김(대시보드 편집에서 켤 수 있음) */
  hiddenSections: ["products"],
  /* 첫 실행 기본 핀 — 데모에서 빈 화면을 피하기 위한 추천 구성 */
  pinnedTools: ["noran.calc.tax", "noran.simulator"],
  /* [{ id, at(epoch ms) }] 최신순 */
  recentTools: [],
};

const migrate = (raw) => {
  /* 향후: if (raw.version === 1) { ...v1 → v2 변환... } */
  if (raw?.version !== SCHEMA_VERSION) return null;
  return raw;
};

export const personalizationStore = {
  load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      const migrated = migrate(raw);
      if (!migrated) return { ...DEFAULT_STATE };
      /* 필드 단위 병합 — 새 필드가 추가돼도 기존 저장분과 안전하게 합쳐진다 */
      return { ...DEFAULT_STATE, ...migrated, version: SCHEMA_VERSION };
    } catch {
      return { ...DEFAULT_STATE };
    }
  },

  save(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* 저장 실패(시크릿 모드 등)는 조용히 무시 — 세션 내 상태로만 동작 */
    }
  },

  clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
  },
};
