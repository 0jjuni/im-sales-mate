import { useCallback, useEffect, useState } from "react";
import { fetchMorningBriefing } from "../data/morningBriefing";

/* 모닝 브리핑을 한 번만 fetch해서 마켓 보드·뉴스 카드가 공유하는 훅.
   status: "loading" | "ready" | "error" */
export function useMorningBriefing() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let alive = true;
    setStatus("loading");
    fetchMorningBriefing()
      .then((d) => {
        if (!alive) return;
        setData(d);
        setStatus("ready");
      })
      .catch(() => {
        if (!alive) return;
        setStatus("error");
      });
    return () => {
      alive = false;
    };
  }, [nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return { data, status, reload };
}
