import { useEffect, useRef, useState } from "react";
import { fetchEtfQuotes } from "../data/wealthEtfLive";

/* ETF 실시간 시세 폴링 훅.
   대상 ETF 목록을 받아 주기적으로 시세를 갱신한다(데모 10초).
   반환: { quotes: {id: {price,changePct,volume,series}}, live, asOf }.
   live=false면 모의 실시간(키/프록시 없음). */
export function useEtfLive(etfs, intervalMs = 10000) {
  const [state, setState] = useState({ quotes: {}, live: false, asOf: null });
  const ids = (etfs || []).map((e) => e.id).join(",");
  const etfsRef = useRef(etfs);
  etfsRef.current = etfs;

  useEffect(() => {
    if (!etfs || etfs.length === 0) {
      setState({ quotes: {}, live: false, asOf: null });
      return;
    }
    let alive = true;
    const tick = async () => {
      const { live, quotes } = await fetchEtfQuotes(etfsRef.current || []);
      if (alive) setState({ quotes, live, asOf: new Date() });
    };
    tick();
    const timer = setInterval(tick, intervalMs);
    return () => {
      alive = false;
      clearInterval(timer);
    };
    // ids로 대상 집합이 바뀔 때만 재구독
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, intervalMs]);

  return state;
}
