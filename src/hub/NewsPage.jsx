import { useEffect } from "react";
import { Newspaper } from "lucide-react";
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
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-im-600" />
          <h1 className="text-xl font-bold tracking-tight text-slate-900 md:text-2xl">뉴스</h1>
        </div>
        <p className="mt-1 text-[13px] text-slate-500">
          매일 아침 창구에 영향을 줄 뉴스·시황과 다가오는 일정을 정리합니다.
        </p>
      </div>

      <MorningNews data={data} status={status} onReload={reload} full />
    </HubShell>
  );
}
