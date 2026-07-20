/* iM 세일즈메이트 로고 마크.
   콘셉트: 말풍선(상담 옆자리) 안의 상승 화살표(세일즈) — 민트 그라데이션 + 라임 포인트.
   크기는 className(w-9 h-9 등)으로 제어. favicon(public/favicon.svg)과 동일 도안. */
export const SalesMateMark = ({ className }) => (
  <svg viewBox="0 0 48 48" className={className} role="img" aria-label="iM 세일즈메이트">
    <defs>
      <linearGradient id="smBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#06a189" />
        <stop offset="1" stopColor="#036b5b" />
      </linearGradient>
    </defs>
    {/* 배경 타일 */}
    <rect x="1" y="1" width="46" height="46" rx="12" fill="url(#smBg)" />
    {/* 말풍선 */}
    <path
      d="M10 15 a5 5 0 0 1 5-5 h18 a5 5 0 0 1 5 5 v12 a5 5 0 0 1-5 5 H22 l-7 6 v-6 h0 a5 5 0 0 1-5-5 z"
      fill="#ffffff"
    />
    {/* 상승 라인 */}
    <polyline
      points="15,26 21,20.5 25,23.5 31.5,16.5"
      fill="none"
      stroke="#008671"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* 화살촉 — 라임 포인트 */}
    <path d="M33.5 14.5 l-6 1.2 4.8 4.8 z" fill="#9fca2a" />
  </svg>
);
