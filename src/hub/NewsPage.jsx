import { useEffect } from "react";
import { HubShell } from "./HubShell";
import { useMorningBriefing } from "./hooks/useMorningBriefing";
import { MorningNews } from "./components/MorningNews";

/* 뉴스 전체 화면 — 홈의 모닝 브리핑 섹션을 독립 탭으로도 연다.
   같은 useMorningBriefing 데이터를 쓰므로 홈과 내용이 일치한다. */
export default function NewsPage() {
  const { data, status, reload } = useMorningBriefing();

  useEffect(() => {
    const prev = document.title;
    document.title = "뉴스 · iM 세일즈메이트";
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <HubShell>
      <MorningNews data={data} status={status} onReload={reload} />
    </HubShell>
  );
}
