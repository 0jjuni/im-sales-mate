import { useCallback, useEffect, useMemo, useState } from "react";
import { useLibrary } from "../library/useLibrary";
import { useFollowups, ME } from "../followups/useFollowups";

/* 통합 알림 — 상단바 벨에서 확인한다. 소스:
   · 지식 라이브러리: 내가 구독한 채널에 올라온 「남이 쓴」 새 글(최근 7일)
   · 일정 관리: 동료가 올린 지점 공유 일정(새 소식)

   읽음 상태는 알림별로 localStorage에 저장(읽으면 연해지고 뱃지 감소).
   최초 진입 시엔 「구독 채널별 최신 글 + 최근 지점 공유 2건」만 안 읽음으로 두어
   실제 사이트처럼 몇 건의 새 알림이 보이게 한다. */

const KEY = "salesbridge.notif.read.v1";
const DAY = 86400000;

const loadRead = () => {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw == null ? null : new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
};
const saveRead = (set) => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify([...set]));
  } catch {
    /* 무시 */
  }
};

const branchLabel = (i) => {
  if (i.category === "leave") return `${i.staffName || "담당자"} 휴가 계획`;
  if (i.category === "training") return `${i.staffName || "담당자"} 연수 계획`;
  if (i.category === "branch") return i.staffName || "지점 일정";
  return i.memo || `고객 ${i.customerNo || ""}`;
};

export function useNotifications() {
  const lib = useLibrary();
  const { branchNew } = useFollowups();
  const [readIds, setReadIds] = useState(() => loadRead() || new Set());
  const [ready, setReady] = useState(() => loadRead() != null);

  const notifs = useMemo(() => {
    const out = [];
    lib.feedPosts.forEach((p) => {
      if (p.author === ME) return;
      if (Date.now() - p.createdAt > 7 * DAY) return;
      const ch = lib.channelById(p.channelId);
      out.push({
        id: `post:${p.id}`,
        kind: "library",
        channel: ch,
        title: `${ch?.name ?? "채널"} · 새 글`,
        text: p.title,
        ts: p.createdAt,
        to: "/library",
      });
    });
    branchNew.slice(0, 6).forEach((i) => {
      out.push({
        id: `fu:${i.id}`,
        kind: "followup",
        title: `${i.author} · 지점 공유`,
        text: branchLabel(i),
        ts: i.createdAt,
        to: "/followups",
      });
    });
    return out.sort((a, b) => b.ts - a.ts).slice(0, 20);
  }, [lib.feedPosts, branchNew, lib]);

  /* 최초 기준선 — 구독 채널별 최신글 + 지점 공유 최근 2건만 안 읽음 */
  const baselineUnread = useMemo(() => {
    const set = new Set();
    const seenCh = new Set();
    notifs
      .filter((n) => n.kind === "library")
      .forEach((n) => {
        const cid = n.channel?.id;
        if (!seenCh.has(cid)) {
          seenCh.add(cid);
          set.add(n.id);
        }
      });
    notifs
      .filter((n) => n.kind === "followup")
      .slice(0, 2)
      .forEach((n) => set.add(n.id));
    return set;
  }, [notifs]);

  /* 기준선을 읽음 상태로 1회 저장 */
  useEffect(() => {
    if (ready || notifs.length === 0) return;
    const r = new Set(notifs.map((n) => n.id).filter((id) => !baselineUnread.has(id)));
    saveRead(r);
    setReadIds(r);
    setReady(true);
  }, [ready, notifs, baselineUnread]);

  const isUnread = useCallback(
    (id) => (ready ? !readIds.has(id) : baselineUnread.has(id)),
    [ready, readIds, baselineUnread]
  );

  const unread = useMemo(() => notifs.filter((n) => isUnread(n.id)), [notifs, isUnread]);

  const markRead = useCallback((id) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveRead(next);
      return next;
    });
    setReady(true);
  }, []);

  const markAllRead = useCallback(() => {
    setReadIds(() => {
      const next = new Set(notifs.map((n) => n.id));
      saveRead(next);
      return next;
    });
    setReady(true);
  }, [notifs]);

  return { notifs, unread, unreadCount: unread.length, isUnread, markRead, markAllRead };
}
