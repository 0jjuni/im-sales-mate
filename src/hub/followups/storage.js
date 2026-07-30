/* 고객 후속 관리(팔로업) 메모 저장소 어댑터.
   대시보드 개인화와 별도 키로 분리 — 고객 관련 데이터라 이후 서버 저장·암호화·접근통제를
   붙일 때 이 파일만 교체하면 되도록 격리한다. (데모는 localStorage)

   ⚠ 개인정보 최소화 원칙: 고객번호와 메모만 저장하며,
   이름·주민번호·연락처 등 민감 개인정보는 입력받지 않는다(UI에서 안내·차단). */

const STORAGE_KEY = "salesbridge.followups";
const SCHEMA_VERSION = 1;

/* FollowupItem:
   { id, type: "followup"|"note"(고객 메모 — 없으면 followup으로 간주),
     scope: "mine"|"branch"(지점 공유 — 없으면 mine으로 간주),
     customerNo, memo, followUpDate(YYYY-MM-DD|null), products(string[]),
     status: "open"|"done", createdAt(epoch ms) }

   지점 공유(scope: "branch")는 데모에서 표시만 되고 실제로 공유되지 않는다.
   서버 저장으로 옮길 때 지점 코드 기준 조회·권한 분리를 여기에 붙인다. */
const DEFAULT_STATE = {
  version: SCHEMA_VERSION,
  items: [],
};

const migrate = (raw) => {
  if (raw?.version !== SCHEMA_VERSION) return null;
  return raw;
};

export const followupStore = {
  load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
      const migrated = migrate(raw);
      if (!migrated) return { ...DEFAULT_STATE };
      return { ...DEFAULT_STATE, ...migrated, version: SCHEMA_VERSION };
    } catch {
      return { ...DEFAULT_STATE };
    }
  },

  save(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* 저장 실패(시크릿 모드 등)는 조용히 무시 */
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
