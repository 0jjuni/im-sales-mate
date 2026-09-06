import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CalendarClock, Check } from "lucide-react";
import { useNotifications } from "../notifications/useNotifications";
import { ChannelAvatar } from "../library/channelStyle";
import { cn } from "@shared/lib/format";

/* 상단바 알림 벨 — 클릭하면 드롭다운으로 새 알림 목록. 항목을 누르면 읽음(연해짐) + 이동.
   구독 채널 새 글 · 지점 공유 새 일정을 모아 보여 준다. */

const DAY = 86400000;
const fmtWhen = (ts) => {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(diff / DAY);
  if (day < 7) return `${day}일 전`;
  const d = new Date(ts);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
};

const NotifIcon = ({ n }) =>
  n.kind === "library" && n.channel ? (
    <ChannelAvatar icon={n.channel.icon} color={n.channel.color} image={n.channel.image} size="sm" />
  ) : (
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
      <CalendarClock className="h-4 w-4" />
    </div>
  );

export function NotificationBell() {
  const { notifs, unreadCount, isUnread, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const nav = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const onItem = (n) => {
    markRead(n.id);
    setOpen(false);
    nav(n.to);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`알림${unreadCount > 0 ? ` ${unreadCount}건` : ""}`}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-md border transition-colors",
          open ? "border-im-400 bg-im-50 text-im-700" : "border-slate-300 bg-white text-slate-500 hover:border-im-400 hover:text-im-700"
        )}
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[340px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
            <div className="flex items-center gap-1.5 text-[13px] font-bold text-slate-900">
              알림
              {unreadCount > 0 && (
                <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-600">{unreadCount}</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-slate-500 hover:text-im-700">
                <Check className="h-3.5 w-3.5" /> 모두 읽음
              </button>
            )}
          </div>

          {notifs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <Bell className="h-6 w-6 text-slate-300" />
              <p className="text-[12.5px] font-semibold text-slate-500">새 알림이 없습니다</p>
              <p className="text-[11px] text-slate-400">구독한 채널에 글이 올라오거나 지점 일정이 공유되면 여기에 표시됩니다.</p>
            </div>
          ) : (
            <ul className="max-h-[420px] divide-y divide-slate-100 overflow-y-auto">
              {notifs.map((n) => {
                const unread = isUnread(n.id);
                return (
                  <li key={n.id}>
                    <button
                      onClick={() => onItem(n)}
                      className={cn(
                        "flex w-full items-start gap-2.5 px-4 py-3 text-left transition-colors hover:bg-slate-50",
                        unread ? "bg-im-50/40" : "opacity-60"
                      )}
                    >
                      <NotifIcon n={n} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-[12px] font-bold text-slate-800">{n.title}</span>
                          <span className="ml-auto flex-shrink-0 text-[10.5px] text-slate-400">{fmtWhen(n.ts)}</span>
                        </div>
                        <div className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-slate-600">{n.text}</div>
                      </div>
                      {unread && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-rose-500" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
