import { useCallback, useMemo, useState } from "react";
import { libraryStore } from "./libraryStore";
import { ME } from "../followups/useFollowups";

/* 지식 라이브러리 상태 훅 — 채널/글/구독을 localStorage에 저장.
   현재 로그인 직원(ME)이 개설자·작성자·구독자 기준. 실서비스에선 세션 사용자로 대체. */

const uid = (p) => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

export function useLibrary() {
  const initial = libraryStore.load();
  const [channels, setChannels] = useState(initial.channels);
  const [posts, setPosts] = useState(initial.posts);
  const [subs, setSubs] = useState(initial.subs);

  const persistChannels = (next) => {
    setChannels(next);
    libraryStore.saveChannels(next);
  };
  const persistPosts = (next) => {
    setPosts(next);
    libraryStore.savePosts(next);
  };
  const persistSubs = (next) => {
    setSubs(next);
    libraryStore.saveSubs(next);
  };

  const channelById = useCallback((id) => channels.find((c) => c.id === id) || null, [channels]);

  const postsOf = useCallback(
    (channelId) => posts.filter((p) => p.channelId === channelId).sort((a, b) => b.createdAt - a.createdAt),
    [posts]
  );

  const latestOf = useCallback(
    (channelId) => postsOf(channelId)[0] || null,
    [postsOf]
  );

  const countOf = useCallback(
    (channelId) => posts.filter((p) => p.channelId === channelId).length,
    [posts]
  );

  const isSubscribed = useCallback((channelId) => subs.includes(channelId), [subs]);

  /* 구독자 수(데모) — 나를 제외한 기준값(subscribers) + 내가 구독 중이면 +1 */
  const subCountOf = useCallback(
    (channelId) => (channelById(channelId)?.subscribers ?? 0) + (subs.includes(channelId) ? 1 : 0),
    [channelById, subs]
  );

  const toggleSubscribe = useCallback(
    (channelId) =>
      persistSubs(subs.includes(channelId) ? subs.filter((id) => id !== channelId) : [channelId, ...subs]),
    [subs]
  );

  const addChannel = useCallback(
    ({ name, icon, color, category, desc }) => {
      const ch = {
        id: uid("ch"),
        name: (name || "").trim(),
        icon: icon || "news",
        color: color || "im",
        category: (category || "").trim() || "일반",
        desc: (desc || "").trim(),
        author: ME,
        subscribers: 0,
        createdAt: Date.now(),
      };
      persistChannels([ch, ...channels]);
      persistSubs([ch.id, ...subs]); // 개설자는 자동 구독
      return ch;
    },
    [channels, subs]
  );

  const addPost = useCallback(
    ({ channelId, title, body, images, tags }) => {
      const post = {
        id: uid("p"),
        channelId,
        title: (title || "").trim(),
        body: (body || "").trim(),
        author: ME,
        images: images || [],
        tags: tags || [],
        createdAt: Date.now(),
      };
      persistPosts([post, ...posts]);
      return post;
    },
    [posts]
  );

  const removePost = useCallback((id) => persistPosts(posts.filter((p) => p.id !== id)), [posts]);

  const removeChannel = useCallback(
    (id) => {
      persistChannels(channels.filter((c) => c.id !== id));
      persistPosts(posts.filter((p) => p.channelId !== id));
      persistSubs(subs.filter((s) => s !== id));
    },
    [channels, posts, subs]
  );

  /* 구독 피드 — 구독한 채널의 글을 최신순으로 */
  const feedPosts = useMemo(
    () => posts.filter((p) => subs.includes(p.channelId)).sort((a, b) => b.createdAt - a.createdAt),
    [posts, subs]
  );

  return {
    me: ME,
    channels,
    posts,
    subs,
    channelById,
    postsOf,
    latestOf,
    countOf,
    isSubscribed,
    subCountOf,
    toggleSubscribe,
    addChannel,
    addPost,
    removePost,
    removeChannel,
    feedPosts,
  };
}
