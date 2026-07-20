import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { personalizationStore, DEFAULT_STATE } from "./storage";
import { SECTION_IDS } from "../sections";

/* 대시보드 개인화 상태 — 섹션 순서·숨김, 핀 도구, 최근 사용 도구.
   허브 컴포넌트와 상품 모듈(핀 버튼·방문 기록)이 함께 사용하므로
   라우터 전체(App)를 감싸는 위치에 Provider를 둔다. */

const PersonalizationContext = createContext(null);

const MAX_RECENT = 8;

/* 저장된 섹션 순서를 현재 섹션 정의와 동기화 —
   새로 생긴 섹션은 뒤에 붙이고, 삭제된 섹션 id는 걸러낸다 */
const reconcileOrder = (stored) => {
  const known = stored.filter((id) => SECTION_IDS.includes(id));
  const missing = SECTION_IDS.filter((id) => !known.includes(id));
  return [...known, ...missing];
};

export function PersonalizationProvider({ children }) {
  const [state, setState] = useState(() => {
    const loaded = personalizationStore.load();
    return { ...loaded, sectionOrder: reconcileOrder(loaded.sectionOrder) };
  });

  /* 상태가 바뀔 때마다 저장 — 어댑터 뒤가 localStorage든 API든 여기는 동일 */
  useEffect(() => {
    personalizationStore.save(state);
  }, [state]);

  const togglePin = useCallback((toolId) => {
    setState((s) => ({
      ...s,
      pinnedTools: s.pinnedTools.includes(toolId)
        ? s.pinnedTools.filter((id) => id !== toolId)
        : [...s.pinnedTools, toolId],
    }));
  }, []);

  const reorderPinnedTools = useCallback((nextIds) => {
    setState((s) => ({ ...s, pinnedTools: nextIds }));
  }, []);

  const recordToolVisit = useCallback((toolId) => {
    setState((s) => ({
      ...s,
      recentTools: [
        { id: toolId, at: Date.now() },
        ...s.recentTools.filter((r) => r.id !== toolId),
      ].slice(0, MAX_RECENT),
    }));
  }, []);

  const toggleSectionHidden = useCallback((sectionId) => {
    setState((s) => ({
      ...s,
      hiddenSections: s.hiddenSections.includes(sectionId)
        ? s.hiddenSections.filter((id) => id !== sectionId)
        : [...s.hiddenSections, sectionId],
    }));
  }, []);

  const reorderSections = useCallback((nextOrder) => {
    setState((s) => ({ ...s, sectionOrder: nextOrder }));
  }, []);

  const resetDashboard = useCallback(() => {
    personalizationStore.clear();
    setState({ ...DEFAULT_STATE, sectionOrder: reconcileOrder(DEFAULT_STATE.sectionOrder) });
  }, []);

  const value = useMemo(
    () => ({
      sectionOrder: state.sectionOrder,
      hiddenSections: state.hiddenSections,
      pinnedTools: state.pinnedTools,
      recentTools: state.recentTools,
      isPinned: (toolId) => state.pinnedTools.includes(toolId),
      isSectionHidden: (sectionId) => state.hiddenSections.includes(sectionId),
      togglePin,
      reorderPinnedTools,
      recordToolVisit,
      toggleSectionHidden,
      reorderSections,
      resetDashboard,
    }),
    [state, togglePin, reorderPinnedTools, recordToolVisit, toggleSectionHidden, reorderSections, resetDashboard]
  );

  return (
    <PersonalizationContext.Provider value={value}>
      {children}
    </PersonalizationContext.Provider>
  );
}

export function usePersonalization() {
  const ctx = useContext(PersonalizationContext);
  if (!ctx) {
    throw new Error("usePersonalization은 PersonalizationProvider 안에서만 사용할 수 있습니다.");
  }
  return ctx;
}
