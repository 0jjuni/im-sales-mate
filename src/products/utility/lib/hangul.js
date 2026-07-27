/* 한글 → 로마자 변환 엔진.
   근거: 국어의 로마자 표기법 (문화체육관광부 고시 제2014-42호)

   ⚠ 한계 — 로마자 표기법은 「표준 발음법」에 따른 발음을 옮기는 방식이라,
     같은 글자라도 단어에 따라 발음이 달라지면 결과가 달라진다.
     이 엔진은 실무에서 자주 쓰이는 음운 변화(연음·비음화·유음화·구개음화)만
     반영하므로, 결과는 「후보」로 다루고 최종 확인은 여권·공식 영문주소로 해야 한다. */

const BASE = 0xac00;
const LAST = 0xd7a3;

/* 초성 19 — 로마자 표기법 제2장 */
const CHO = [
  "g", "kk", "n", "d", "tt", "r", "m", "b", "pp",
  "s", "ss", "", "j", "jj", "ch", "k", "t", "p", "h",
];
/* 중성 21 */
const JUNG = [
  "a", "ae", "ya", "yae", "eo", "e", "yeo", "ye",
  "o", "wa", "wae", "oe", "yo", "u", "wo", "we", "wi", "yu",
  "eu", "ui", "i",
];
/* 종성 28 (0 = 받침 없음) — 받침 위치에서의 대표음 */
const JONG = [
  "", "k", "k", "k", "n", "n", "n", "t", "l", "k", "m", "l", "l", "l",
  "p", "l", "m", "p", "p", "t", "t", "ng", "t", "t", "k", "t", "p", "t",
];

/* 받침이 다음 음절 첫소리로 넘어갈 때(연음)의 소리.
   빈 문자열은 소리가 사라지는 경우(ㅎ 탈락 등) */
const JONG_LINK = [
  "", "g", "kk", "ks", "n", "nj", "nh", "d", "r", "lg", "lm", "lb", "ls",
  "lt", "lp", "rh", "m", "b", "ps", "s", "ss", "ng", "j", "ch", "k", "t", "p", "h",
];

/* 자음군 분류 — 음운 변화 판정용 */
const K_GROUP = [1, 2, 3, 9, 24]; // ㄱ ㄲ ㄳ ㄺ ㅋ
const T_GROUP = [7, 19, 20, 22, 23, 25, 27]; // ㄷ ㅅ ㅆ ㅈ ㅊ ㅌ ㅎ
const P_GROUP = [17, 18, 26, 14]; // ㅂ ㅄ ㅍ ㄿ

const isSyllable = (ch) => {
  const c = ch.charCodeAt(0);
  return c >= BASE && c <= LAST;
};

const decompose = (ch) => {
  const c = ch.charCodeAt(0) - BASE;
  return {
    cho: Math.floor(c / 588),
    jung: Math.floor((c % 588) / 28),
    jong: c % 28,
  };
};

/* 음절 배열에 음운 변화를 적용해 [초성음, 중성음, 종성음] 문자열로 만든다.
   linkAcross=false 이면 음절 경계를 넘는 변화를 적용하지 않는다(도로명 등 붙임표 앞뒤). */
const romanizeSyllables = (chars, { linkAcross = true } = {}) => {
  const syls = chars.map(decompose);
  const out = syls.map((s) => ({
    cho: CHO[s.cho],
    jung: JUNG[s.jung],
    jong: JONG[s.jong],
    _raw: s,
  }));

  if (!linkAcross) return out;

  for (let i = 0; i < syls.length - 1; i++) {
    const cur = syls[i];
    const next = syls[i + 1];
    if (cur.jong === 0) continue;

    /* 연음 — 받침 + 초성 ㅇ(11): 받침이 다음 음절 첫소리로 넘어간다 */
    if (next.cho === 11) {
      const link = JONG_LINK[cur.jong];
      if (link.length === 2 && cur.jong !== 21) {
        /* 겹받침: 앞소리는 남고 뒷소리가 넘어간다 (예: 읽어 → ilg-eo) */
        out[i].jong = link[0] === "r" ? "l" : link[0];
        out[i + 1].cho = link.slice(1);
      } else if (cur.jong === 21) {
        out[i].jong = "ng"; // ㅇ 받침은 넘어가지 않는다
      } else if (cur.jong === 27) {
        out[i].jong = ""; // ㅎ 탈락
      } else {
        out[i].jong = "";
        out[i + 1].cho = link;
      }
      continue;
    }

    /* 비음화 — ㄱ/ㄷ/ㅂ 받침 + ㄴ·ㅁ 초성 */
    if (next.cho === 2 || next.cho === 6) {
      if (K_GROUP.includes(cur.jong)) out[i].jong = "ng";
      else if (T_GROUP.includes(cur.jong)) out[i].jong = "n";
      else if (P_GROUP.includes(cur.jong)) out[i].jong = "m";
    }

    /* ㄹ 초성 앞에서 일어나는 변화 */
    if (next.cho === 5) {
      if (cur.jong === 4 || cur.jong === 8) {
        /* 유음화 — ㄴ+ㄹ, ㄹ+ㄹ → ll (신라 Silla, 대관령 Daegwallyeong) */
        out[i].jong = "l";
        out[i + 1].cho = "l";
      } else if (cur.jong === 21 || cur.jong === 16) {
        /* ㄹ의 비음화 — ㅇ·ㅁ 받침 뒤 ㄹ은 ㄴ으로 (종로 Jongno, 강릉 Gangneung) */
        out[i + 1].cho = "n";
      } else if (K_GROUP.includes(cur.jong)) {
        /* ㄱ 받침 + ㄹ → ㅇ+ㄴ (백로 Baengno) */
        out[i].jong = "ng";
        out[i + 1].cho = "n";
      } else if (P_GROUP.includes(cur.jong)) {
        /* ㅂ 받침 + ㄹ → ㅁ+ㄴ (협력 hyeomnyeok) */
        out[i].jong = "m";
        out[i + 1].cho = "n";
      }
    } else if (cur.jong === 8 && next.cho === 2) {
      /* 유음화 — ㄹ+ㄴ → ll (칼날 kallal) */
      out[i + 1].cho = "l";
    }
  }

  return out;
};

/* 한글 단어 하나를 로마자로. 첫 글자 대문자 옵션 */
export const romanizeWord = (word, { capitalize = true, linkAcross = true } = {}) => {
  const chars = [...word];
  if (!chars.length) return "";
  if (!chars.every(isSyllable)) {
    /* 한글이 아닌 문자(숫자·영문)는 그대로 둔다 */
    return word;
  }
  const parts = romanizeSyllables(chars, { linkAcross });
  const s = parts.map((p) => p.cho + p.jung + p.jong).join("");
  return capitalize ? s.charAt(0).toUpperCase() + s.slice(1) : s;
};

/* 음절 단위 로마자 배열 — 이름에서 음절별 후보를 만들 때 사용 */
export const romanizeEachSyllable = (word) => {
  const chars = [...word].filter(isSyllable);
  const parts = romanizeSyllables(chars, { linkAcross: true });
  return parts.map((p) => p.cho + p.jung + p.jong);
};

export const isHangul = (s) => [...s].some(isSyllable);
export const isAllHangul = (s) => [...s].length > 0 && [...s].every(isSyllable);
