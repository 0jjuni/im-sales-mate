import { useCallback, useEffect, useMemo, useState } from "react";
import { PRODUCT_BY_ID, pricingOf } from "../data/wealthProducts";
import { navAt, currentNav, addBusinessDays } from "../data/wealthDetail";

/* 투자상품 관심(watchlist) + 가입 고객 관리 상태.
   데모는 localStorage. 실서비스에서는 직원 계정별 서버 저장으로 이 어댑터만 교체한다. */

const STORAGE_KEY = "salesbridge.wealth";
const VERSION = 2; // v2: 매입 기준가·보유기간 수익률·기준가 대기 상태 반영

/* 첫 진입 시 화면이 비지 않도록 예시 가입 몇 건.
   e5는 오늘 신청한 해외펀드 — 기준가(T+2) 확정 전 '대기' 상태를 보여 준다. */
const SEED_ENROLLMENTS = [
  { id: "e1", customerNo: "841023391", productId: "etf-nasdaq", principal: 2000, joinedAt: "2025-03-14", targetReturn: 20 },
  { id: "e2", customerNo: "772501180", productId: "fund-value", principal: 1000, joinedAt: "2025-06-02", targetReturn: 15 },
  { id: "e3", customerNo: "904176624", productId: "etf-battery", principal: 500, joinedAt: "2025-01-20", targetReturn: 10 },
  { id: "e4", customerNo: "881642093", productId: "trust-elt", principal: 3000, joinedAt: "2025-08-01", targetReturn: 6 },
  { id: "e5", customerNo: "830511042", productId: "fund-india", principal: 800, joinedAt: "2026-08-28", targetReturn: 20 },
];

const load = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (!raw) return { version: VERSION, watchlist: [], enrollments: SEED_ENROLLMENTS };
    /* 버전이 낮으면 가입 예시는 새 시드로 교체하되 관심 목록은 보존 */
    if (raw.version !== VERSION) {
      return { version: VERSION, watchlist: Array.isArray(raw.watchlist) ? raw.watchlist : [], enrollments: SEED_ENROLLMENTS };
    }
    return {
      version: VERSION,
      watchlist: Array.isArray(raw.watchlist) ? raw.watchlist : [],
      enrollments: Array.isArray(raw.enrollments) ? raw.enrollments : SEED_ENROLLMENTS,
    };
  } catch {
    return { version: VERSION, watchlist: [], enrollments: SEED_ENROLLMENTS };
  }
};

/* 가입 건에 상품·매입가·평가 정보를 붙여 화면용으로 계산.
   - 매입가는 상품 유형별 기준가 확정 방식(pricingOf)을 반영한다:
     ETF는 체결일(즉시), 펀드·신탁은 신청일 + 확정 영업일(lagDays)의 기준가.
   - 아직 기준가 확정일 전이면 '대기'로 두고 수익률을 계산하지 않는다.
   - 확정 뒤에는 매입 기준가와 현재 기준가로 보유기간 실제 수익률을 낸다
     (기존처럼 상품 1년 수익률을 모두에게 붙이지 않는다). */
export const enrichEnrollment = (e) => {
  const product = PRODUCT_BY_ID[e.productId];
  if (!product) {
    return { ...e, product: null, pricing: null, status: "확정", currentReturn: 0, currentValue: e.principal, gain: 0, alert: "progress" };
  }
  const pricing = pricingOf(product);
  const joined = new Date(e.joinedAt);
  /* 매입가 확정일 = ETF는 신청 당일 체결, 그 외는 신청일 + 확정 영업일 */
  const confirmAt = pricing.lagDays === 0 ? joined : addBusinessDays(joined, pricing.lagDays);

  if (Date.now() < confirmAt.getTime()) {
    /* 기준가/설정 확정 전 — 평가 불가, 원금만 잡고 대기 표시 */
    return {
      ...e, product, pricing, status: "대기", confirmAt,
      entryNav: null, nowNav: null, units: null,
      currentReturn: null, currentValue: e.principal, gain: 0, alert: "pending",
    };
  }

  const entryNav = navAt(product, confirmAt);
  const nowNav = currentNav(product);
  const ratio = nowNav / entryNav;
  const ret = Math.round((ratio - 1) * 1000) / 10;
  const currentValue = Math.round(e.principal * ratio);
  let alert = "progress";
  if (ret <= -10) alert = "loss";
  else if (ret >= e.targetReturn) alert = "target";
  return {
    ...e, product, pricing, status: "확정", confirmAt,
    entryNav, nowNav, units: Math.round((e.principal * 10000) / entryNav),
    currentReturn: ret, currentValue, gain: currentValue - e.principal, alert,
  };
};

export function useWealth() {
  const [state, setState] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* 저장 실패(시크릿 모드 등) 무시 */
    }
  }, [state]);

  const isWatched = useCallback((id) => state.watchlist.includes(id), [state.watchlist]);

  const toggleWatch = useCallback((id) => {
    setState((s) => ({
      ...s,
      watchlist: s.watchlist.includes(id) ? s.watchlist.filter((x) => x !== id) : [id, ...s.watchlist],
    }));
  }, []);

  const enroll = useCallback(({ customerNo, productId, principal, targetReturn }) => {
    setState((s) => ({
      ...s,
      enrollments: [
        {
          id: `e${Date.now()}`,
          customerNo,
          productId,
          principal: Number(principal) || 0,
          joinedAt: new Date().toISOString().slice(0, 10),
          targetReturn: Number(targetReturn) || 10,
        },
        ...s.enrollments,
      ],
    }));
  }, []);

  const removeEnroll = useCallback((id) => {
    setState((s) => ({ ...s, enrollments: s.enrollments.filter((e) => e.id !== id) }));
  }, []);

  const setTarget = useCallback((id, targetReturn) => {
    setState((s) => ({
      ...s,
      enrollments: s.enrollments.map((e) => (e.id === id ? { ...e, targetReturn: Number(targetReturn) || 0 } : e)),
    }));
  }, []);

  const enrollments = useMemo(() => state.enrollments.map(enrichEnrollment), [state.enrollments]);

  return { watchlist: state.watchlist, isWatched, toggleWatch, enrollments, enroll, removeEnroll, setTarget };
}
