import { NORAN_MODULE, NORAN_TOOLS } from "@noran/tools";
import { ISA_MODULE, ISA_TOOLS } from "@isa/tools";
import { PENSION_MODULE, PENSION_TOOLS } from "@pension/tools";

/* 도구 레지스트리 — 각 상품 모듈의 도구 매니페스트를 집계하는 단일 지점.
   새 모듈 추가 시: ① 모듈에 tools.js 매니페스트 작성 → ② 아래 배열에 한 줄 추가.
   허브(내 도구·도구 라이브러리·최근 사용)와 모듈(핀 버튼·방문 기록)은
   모두 이 레지스트리를 통해서만 도구를 참조한다. */
const MODULE_MANIFESTS = [
  { module: NORAN_MODULE, tools: NORAN_TOOLS },
  { module: ISA_MODULE, tools: ISA_TOOLS },
  { module: PENSION_MODULE, tools: PENSION_TOOLS },
];

/* 평탄화된 전체 도구 목록 — 각 도구에 소속 모듈 정보를 부착 */
export const ALL_TOOLS = MODULE_MANIFESTS.flatMap(({ module, tools }) =>
  tools.map((t) => ({ ...t, moduleId: module.id, moduleName: module.name, accent: module.accent }))
);

/* 라이브러리 표시용 — 모듈 단위 그룹 */
export const TOOLS_BY_MODULE = MODULE_MANIFESTS.map(({ module, tools }) => ({
  module,
  tools: tools.map((t) => ({ ...t, moduleId: module.id, moduleName: module.name, accent: module.accent })),
}));

const byId = new Map(ALL_TOOLS.map((t) => [t.id, t]));
const byPath = new Map(ALL_TOOLS.map((t) => [t.to, t]));

export const getToolById = (id) => byId.get(id) ?? null;

/* 현재 라우트 경로로 도구를 역조회 — 모듈 쪽에서 핀 버튼·방문 기록에 사용 */
export const findToolByPath = (path) => byPath.get(path) ?? null;
