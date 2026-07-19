/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* iM뱅크 브랜드 컬러 (2024 리브랜딩: 민트 + 라임).
           아래 값은 근사치 — 사내 CI 가이드의 정확한 hex가 확인되면 이 팔레트만 교체하면
           허브 전체에 반영된다. 상품 모듈(노란=amber 등)의 아이덴티티 색과는 분리. */
        im: {
          50: "#e9faf6",
          100: "#c9f2e9",
          200: "#98e6d6",
          300: "#5fd4bf",
          400: "#2dbca4",
          500: "#06a189", // primary 민트
          600: "#008671", // hover·강조 텍스트
          700: "#036b5b",
          800: "#0a5548",
          900: "#0b463c",
          lime: "#9fca2a", // 라임 액센트
        },
      },
    },
  },
  plugins: [],
}
