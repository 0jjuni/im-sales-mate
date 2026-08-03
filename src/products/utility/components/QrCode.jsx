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

/* size — CSS 크기 문자열(예: "200px", "32mm"). 전표는 mm로 지정한다 */
export const QrSvg = ({ text, size = "200px", className }) => {
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
    </svg>
  );
};
