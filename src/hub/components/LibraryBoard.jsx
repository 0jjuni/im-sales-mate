import { Link } from "react-router-dom";
import { ArrowRight, Rss } from "lucide-react";
import { useLibrary } from "../library/useLibrary";
import { cn } from "@shared/lib/format";

/* 홈 대시보드 위젯 — 지식 라이브러리에서 「내가 구독한 채널의 최신 글」을 몰아 보여 준다.
   구독이 없으면 인기 채널을 구독하도록 안내. 상세 열람·작성은 /library 에서. */

const DAY = 86400000;
const fmtWhen = (ts) => {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${Math.max(1, min)}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(diff / DAY);
  if (day < 7) return `${day}일 전`;
  const d = new Date(ts);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
};

export function LibraryBoard() {
  const lib = useLibrary();
  const feed = lib.feedPosts.slice(0, 4);

  if (feed.length === 0) {
    /* 구독 없음 → 인기 채널 구독 유도 */
    const top = [...lib.channels].sort((a, b) => (b.subscribers || 0) - (a.subscribers || 0)).slice(0, 3);
    return (
      <div className="space-y-3">
        <p className="text-[12.5px] text-slate-500">구독한 채널이 없습니다. 관심 있는 채널을 구독하면 새 글이 여기 모입니다.</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {top.map((c) => (
            <Link
              key={c.id}
              to="/library"
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 transition-colors hover:border-im-300"
            >
              <span className="text-[18px]">{c.emoji}</span>
              <span className="min-w-0">
                <span className="block truncate text-[12.5px] font-bold text-slate-800">{c.name}</span>
                <span className="block text-[10.5px] text-slate-400">구독 {(c.subscribers || 0).toLocaleString()}</span>
              </span>
            </Link>
          ))}
        </div>
        <Link to="/library" className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-im-700 hover:underline">
          지식 라이브러리 열기 <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div>
      <ul className="divide-y divide-slate-100">
        {feed.map((p) => {
          const ch = lib.channelById(p.channelId);
          return (
            <li key={p.id}>
              <Link to="/library" className="flex items-start gap-2.5 py-2.5 transition-colors hover:bg-slate-50">
                <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[16px]">
                  {ch?.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-[11px]">
                    <span className="font-bold text-im-700">{ch?.name}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-400">{fmtWhen(p.createdAt)}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-[13px] font-semibold text-slate-800">{p.title}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <Link
        to="/library"
        className={cn(
          "mt-1 flex items-center justify-center gap-1 border-t border-slate-100 pt-2.5 text-[12.5px] font-semibold text-slate-500 transition-colors hover:text-im-700"
        )}
      >
        <Rss className="h-3.5 w-3.5" /> 구독 피드 전체 보기 <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
