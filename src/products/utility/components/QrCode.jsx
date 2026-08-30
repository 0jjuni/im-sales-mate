import { useMemo } from "react";
import QRCode from "qrcode";

/* QR 코드를 SVG로 그린다.

   라이브러리가 만들어 주는 SVG 문자열을 그대로 삽입하지 않고 모듈 배열만 받아
   직접 그린다. 인쇄에서 흐려지지 않도록 비트맵 대신 벡터로 뽑고, 크기도
   화면용·전표용을 각각 지정할 수 있어야 하기 때문이다.

   QUIET_ZONE은 QR 규격이 요구하는 여백(4모듈)이다. 이게 없으면 스캐너가
   코드 경계를 못 잡는다. */

const QUIET_ZONE = 4;

/* 오류정정 M — 25% 손상까지 복원. 전표를 접거나 조금 번져도 읽힌다 */
const EC_LEVEL = "M";

export const buildQrPath = (text) => {
  const qr = QRCode.create(text, { errorCorrectionLevel: EC_LEVEL });
  const { size, data } = qr.modules;
  let d = "";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (data[r * size + c]) d += `M${c} ${r}h1v1h-1z`;
    }
  }
  return { size, d };
};

/* 워터마크 iM 로고 — 흰 배경 없이 코드 위에 크게, 반투명으로 은은하게 얹는다.
   반투명이라 아래 모듈이 비쳐 스캔에 지장이 없고(오류정정 M), 로고는 연하게 보인다.
   gradient id는 QR별로 유일해야 한다. */
const CenterLogo = ({ modules, uid }) => {
  const c = modules / 2;
  /* 심볼 도안은 viewBox(120×76) 안에서 실제 내용이 x 0~96, y 28~72에 있다.
     내용 실제 중심(48,50)을 QR 중앙에 맞춰야 시각적으로 가운데로 온다. */
  const CX = 48;
  const CY = 50;
  const CW = 96; // 내용 실제 폭
  const contentW = modules * 0.66; // 코드 폭 대비 로고 크기
  const s = contentW / CW;
  const gid = `qr-im-${uid}`;
  return (
    <g opacity="0.22">
      <defs>
        <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="30" y1="34" x2="64" y2="70">
          <stop offset="0" stopColor="#00C4A4" />
          <stop offset="0.5" stopColor="#5ECB6F" />
          <stop offset="1" stopColor="#A5CE39" />
        </linearGradient>
      </defs>
      <g transform={`translate(${c - CX * s} ${c - CY * s}) scale(${s})`}>
        <rect x="0" y="43" width="17" height="29" fill="#00C4A4" />
        <path d="M24 28 A44 44 0 0 1 68 72 L49 72 A25 25 0 0 0 24 47 Z" fill={`url(#${gid})`} />
        <path d="M96 28 A44 44 0 0 0 52 72 L71 72 A25 25 0 0 1 96 47 Z" fill="#00C4A4" />
      </g>
    </g>
  );
};

/* size — CSS 크기 문자열(예: "200px", "32mm"). 전표는 mm로 지정한다.
   logo=true면 중앙에 iM 심볼을 얹는다(작은 QR엔 권장하지 않음). */
export const QrSvg = ({ text, size = "200px", className, logo = false }) => {
  const qr = useMemo(() => {
    if (!text) return null;
    try {
      return buildQrPath(text);
    } catch {
      /* 내용이 너무 길어 QR 용량을 넘긴 경우 */
      return null;
    }
  }, [text]);

  if (!qr) return null;
  const box = qr.size + QUIET_ZONE * 2;
  /* gradient id 충돌 방지용 — 텍스트 기반 짧은 해시 */
  const uid = useMemo(() => {
    let h = 0;
    for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) >>> 0;
    return h.toString(36);
  }, [text]);

  return (
    <svg
      className={className}
      style={{ width: size, height: size }}
      viewBox={`${-QUIET_ZONE} ${-QUIET_ZONE} ${box} ${box}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label="QR 코드"
    >
      <rect x={-QUIET_ZONE} y={-QUIET_ZONE} width={box} height={box} fill="#fff" />
      <path d={qr.d} fill="#000" />
      {logo && <CenterLogo modules={qr.size} uid={uid} />}
    </svg>
  );
};
