import { useCallback, useEffect, useMemo, useState } from "react";
import { PRODUCT_BY_ID } from "../data/wealthProducts";

/* 투자상품 관심(watchlist) + 가입 고객 관리 상태.
   데모는 localStorage. 실서비스에서는 직원 계정별 서버 저장으로 이 어댑터만 교체한다. */

const STORAGE_KEY = "salesbridge.wealth";
const VERSION = 1;

/* 첫 진입 시 화면이 비지 않도록 예시 가입 몇 건 */
const SEED_ENROLLMENTS = [
  { id: "e1", customerNo: "841023391", productId: "etf-nasdaq", principal: 2000, joinedAt: "2025-03-14", targetReturn: 20 },
  { id: "e2", customerNo: "772501180", productId: "fund-value", principal: 1000, joinedAt: "2025-06-02", targetReturn: 15 },
  { id: "e3", customerNo: "904176624", productId: "etf-battery", principal: 500, joinedAt: "2025-01-20", targetReturn: 10 },
  { id: "e4", customerNo: "881642093", productId: "trust-elt", principal: 3000, joinedAt: "2025-08-01", targetReturn: 6 },
];

const load = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (!raw || raw.version !== VERSION) return { version: VERSION, watchlist: [], enrollments: SEED_ENROLLMENTS };
    return {
      version: VERSION,
      watchlist: Array.isArray(raw.watchlist) ? raw.watchlist : [],
      enrollments: Array.isArray(raw.enrollments) ? raw.enrollments : SEED_ENROLLMENTS,
    };
  } catch {
    return { version: VERSION, watchlist: [], enrollments: SEED_ENROLLMENTS };
  }
};

/* 가입 건에 상품·평가 정보를 붙여 화면용으로 계산.
   currentReturn은 데모상 상품 1년 수익률을 그대로 쓴다(실서비스는 평가금액 조회). */
export const enrichEnrollment = (e) => {
  const product = PRODUCT_BY_ID[e.productId];
  const ret = product ? product.return1y : 0;
  const currentValue = Math.round(e.principal * (1 + ret / 100));
  let alert = "progress";
  if (ret <= -10) alert = "loss";
  else if (ret >= e.targetReturn) alert = "target";
  return { ...e, product, currentReturn: ret, currentValue, gain: currentValue - e.principal, alert };
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
