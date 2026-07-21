/* iM 금융그룹 CI 심볼 — 제공받은 공식 CI 이미지를 기반으로 벡터 재현.
   구성: 왼쪽 스템(짧은 세로 바) + 두 개의 아치, 교차부에 민트→라임 그라데이션.
   원본 CI 파일(SVG/AI)을 확보하면 이 재현본 대신 원본 경로로 교체 권장. (README 「브랜딩」)
   favicon(public/favicon.svg)과 동일 도안 — 수정 시 두 파일을 함께. */
export const IMSymbol = ({ className }) => (
  <svg viewBox="0 0 120 76" className={className} role="img" aria-label="iM">
    <defs>
      <linearGradient id="imArc" gradientUnits="userSpaceOnUse" x1="30" y1="34" x2="64" y2="70">
        <stop offset="0" stopColor="#00C4A4" />
        <stop offset="0.5" stopColor="#5ECB6F" />
        <stop offset="1" stopColor="#A5CE39" />
      </linearGradient>
    </defs>
    {/* 스템 */}
    <rect x="0" y="43" width="17" height="29" fill="#00C4A4" />
    {/* 왼쪽 아치 — 교차부로 갈수록 라임 */}
    <path d="M24 28 A44 44 0 0 1 68 72 L49 72 A25 25 0 0 0 24 47 Z" fill="url(#imArc)" />
    {/* 오른쪽 아치 */}
    <path d="M96 28 A44 44 0 0 0 52 72 L71 72 A25 25 0 0 1 96 47 Z" fill="#00C4A4" />
  </svg>
);
