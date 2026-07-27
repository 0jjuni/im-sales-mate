/* 도로명주소 → 영문주소 변환.
   근거: 도로명주소법 시행규칙 별표(로마자 표기 방법) + 국어의 로마자 표기법

   변환 원칙
   1. 한국식은 큰 단위부터, 영문은 작은 단위부터 적는다(순서 뒤집기).
   2. 도로 유형은 붙임표로 붙인다. 대로 -daero, 로 -ro, 길 -gil
   3. 행정구역도 붙임표로. 시 -si, 군 -gun, 구 -gu, 읍 -eup, 면 -myeon, 동 -dong, 리 -ri
   4. 붙임표 앞뒤에서는 음운 변화를 표기에 반영하지 않는다.

   ⚠ 한계 — 정확한 공식 영문주소는 도로명주소 안내시스템(juso.go.kr)의 영문 검색 결과가
     기준이다. 이 도구는 그 조회 전에 형태를 빠르게 잡아 주는 보조 수단이다. */

import { romanizeWord } from "./hangul";

/* 광역자치단체 영문 표기 — 행정안전부 표기 기준 */
export const PROVINCES = [
  { ko: "서울특별시", en: "Seoul", short: "서울" },
  { ko: "부산광역시", en: "Busan", short: "부산" },
  { ko: "대구광역시", en: "Daegu", short: "대구" },
  { ko: "인천광역시", en: "Incheon", short: "인천" },
  { ko: "광주광역시", en: "Gwangju", short: "광주" },
  { ko: "대전광역시", en: "Daejeon", short: "대전" },
  { ko: "울산광역시", en: "Ulsan", short: "울산" },
  { ko: "세종특별자치시", en: "Sejong-si", short: "세종" },
  { ko: "경기도", en: "Gyeonggi-do", short: "경기" },
  { ko: "강원특별자치도", en: "Gangwon-do", short: "강원" },
  { ko: "충청북도", en: "Chungcheongbuk-do", short: "충북" },
  { ko: "충청남도", en: "Chungcheongnam-do", short: "충남" },
  { ko: "전북특별자치도", en: "Jeonbuk-do", short: "전북" },
  { ko: "전라북도", en: "Jeollabuk-do", short: "전북" },
  { ko: "전라남도", en: "Jeollanam-do", short: "전남" },
  { ko: "경상북도", en: "Gyeongsangbuk-do", short: "경북" },
  { ko: "경상남도", en: "Gyeongsangnam-do", short: "경남" },
  { ko: "제주특별자치도", en: "Jeju-do", short: "제주" },
];

/* 접미사 → 붙임표 표기. 긴 것부터 검사해야 「대로」가 「로」로 잘리지 않는다 */
const SUFFIXES = [
  { ko: "대로", en: "daero" },
  { ko: "로", en: "ro" },
  { ko: "길", en: "gil" },
];
const ADMIN_SUFFIXES = [
  { ko: "특별자치시", en: "si" },
  { ko: "특별자치도", en: "do" },
  { ko: "광역시", en: "si" },
  { ko: "특별시", en: "si" },
  { ko: "시", en: "si" },
  { ko: "군", en: "gun" },
  { ko: "구", en: "gu" },
  { ko: "읍", en: "eup" },
  { ko: "면", en: "myeon" },
  { ko: "동", en: "dong" },
  { ko: "리", en: "ri" },
  { ko: "가", en: "ga" },
];

/* 「테헤란로」 → Teheran-ro 처럼 접미사를 분리해 붙임표로 잇는다 */
const withSuffix = (token, table) => {
  for (const s of table) {
    if (token.length > s.ko.length && token.endsWith(s.ko)) {
      const stem = token.slice(0, -s.ko.length);
      /* 숫자가 섞인 도로명(예: 국회대로62길)은 숫자를 그대로 둔다 */
      /* 붙임표 앞뒤(=접미사 경계)에서는 음운 변화를 반영하지 않지만,
         접미사를 뗀 어간 안에서는 반영한다. 종로구 → Jongno-gu */
      const m = stem.match(/^(.*?)(\d+)$/);
      if (m) {
        return `${romanizeWord(m[1])}${m[2]}-${s.en}`;
      }
      return `${romanizeWord(stem)}-${s.en}`;
    }
  }
  return null;
};

const findProvince = (token) =>
  PROVINCES.find((p) => p.ko === token) ||
  PROVINCES.find((p) => token === p.short) ||
  PROVINCES.find((p) => p.ko.startsWith(token) && token.length >= 2);

/* 한글 도로명주소 문자열을 파싱해 영문 주소로 조립한다 */
export const convertAddress = (input) => {
  const raw = (input || "").trim();
  if (!raw) return null;

  /* 우편번호(5자리)와 괄호 안 참고항목(법정동 등)은 따로 뗀다 */
  let zip = null;
  let text = raw.replace(/\b(\d{5})\b/, (m) => {
    zip = m;
    return " ";
  });
  const parenthetical = [];
  text = text.replace(/\(([^)]*)\)/g, (_, inner) => {
    parenthetical.push(inner.trim());
    return " ";
  });

  const tokens = text.split(/\s+/).filter(Boolean);
  if (!tokens.length) return null;

  const parts = {
    province: null, // 시/도
    city: [], // 시/군/구 (2단계까지 가능: 경기도 성남시 분당구)
    town: null, // 읍/면/동/리
    road: null, // 도로명
    buildingNo: null, // 건물번호
    detail: [], // 상세주소 (동·호 등)
    unmatched: [],
  };

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];

    /* 시/도 — 맨 앞에서만 인정 */
    if (!parts.province && i === 0) {
      const p = findProvince(t);
      if (p) {
        parts.province = p;
        continue;
      }
    }

    /* 건물번호 — 도로명 바로 뒤의 숫자(또는 12-3 형태) */
    if (parts.road && !parts.buildingNo && /^\d+(-\d+)?$/.test(t)) {
      parts.buildingNo = t;
      continue;
    }

    /* 도로명 */
    const road = withSuffix(t, SUFFIXES);
    if (road && !parts.road) {
      parts.road = road;
      continue;
    }

    /* 행정구역 */
    const admin = withSuffix(t, ADMIN_SUFFIXES);
    if (admin) {
      if (/(시|군|구)$/.test(t) && !parts.road) parts.city.push(admin);
      else if (/(읍|면|동|리)$/.test(t) && !parts.road) parts.town = admin;
      else parts.detail.push(admin);
      continue;
    }

    /* 그 외 — 도로명 이후면 상세주소, 이전이면 미매칭 */
    if (parts.road) parts.detail.push(romanizeWord(t));
    else parts.unmatched.push(t);
  }

  /* 영문 주소 조립: 작은 단위 → 큰 단위 */
  const line = [];
  if (parts.detail.length) line.push(parts.detail.join(" "));
  if (parts.buildingNo && parts.road) line.push(`${parts.buildingNo}, ${parts.road}`);
  else if (parts.road) line.push(parts.road);
  if (parts.town) line.push(parts.town);
  parts.city.slice().reverse().forEach((c) => line.push(c));
  if (parts.province) line.push(parts.province.en);

  const english = line.filter(Boolean).join(", ");
  const full = [english, zip ? `${zip}` : null, "Republic of Korea"]
    .filter(Boolean)
    .join(", ");

  return {
    english,
    full,
    zip,
    parenthetical,
    parts,
    /* 도로명·건물번호를 못 찾으면 지번주소이거나 형식이 다른 경우 */
    incomplete: !parts.road || !parts.province,
  };
};
