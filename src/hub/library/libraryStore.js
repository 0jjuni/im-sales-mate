/* 지식 라이브러리 저장소 — 현업 담당자가 직접 채널(게시판)을 열고 글을 올리고,
   직원은 원하는 채널을 구독해 몰아본다(에브리타임식 자율 게시판).
   부서 공지(위→아래 전달)와 달리 누구나 개설·발행하는 콘텐츠 플랫폼이다.

   데모 환경(백엔드 없음)이라 브라우저 localStorage에 저장한다. 실배포 시 이 어댑터를
   백엔드 API로 교체하면 되고, 호출부(useLibrary)는 이 함수 시그니처에만 의존한다.

   channel = { id, name, emoji, category, desc, author, subscribers, createdAt }
   post    = { id, channelId, title, body, author, cards?, images?, createdAt }
   subs    = [channelId] — 현재 로그인 직원의 구독 목록 */

import { buildLibrarySeed } from "./seedLibrary";

const K_CH = "salesbridge.library.channels";
const K_POST = "salesbridge.library.posts";
const K_SUB = "salesbridge.library.subs";

const canStore = () => typeof window !== "undefined" && !!window.localStorage;

const readKey = (key, fallback) => {
  if (!canStore()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return null; // 미초기화 신호
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return fallback;
  }
};

const writeKey = (key, val) => {
  if (!canStore()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* 저장 실패(용량 초과 등)는 데모에서 조용히 무시 */
  }
};

/* 최초 1회 시드. channels·posts가 비어 있으면 시드를 심고, 이후엔 저장소가 원본. */
function ensureSeeded() {
  const ch = readKey(K_CH, null);
  const posts = readKey(K_POST, null);
  if (ch == null || posts == null) {
    const seed = buildLibrarySeed();
    writeKey(K_CH, seed.channels);
    writeKey(K_POST, seed.posts);
    if (readKey(K_SUB, null) == null) writeKey(K_SUB, seed.subs);
    return seed;
  }
  return {
    channels: Array.isArray(ch) ? ch : [],
    posts: Array.isArray(posts) ? posts : [],
    subs: readKey(K_SUB, []) || [],
  };
}

export const libraryStore = {
  load() {
    const { channels, posts } = ensureSeeded();
    const subs = readKey(K_SUB, []) || [];
    return { channels, posts, subs: Array.isArray(subs) ? subs : [] };
  },
  saveChannels(channels) {
    writeKey(K_CH, channels);
  },
  savePosts(posts) {
    writeKey(K_POST, posts);
  },
  saveSubs(subs) {
    writeKey(K_SUB, subs);
  },
  reset() {
    const seed = buildLibrarySeed();
    writeKey(K_CH, seed.channels);
    writeKey(K_POST, seed.posts);
    writeKey(K_SUB, seed.subs);
    return seed;
  },
};
