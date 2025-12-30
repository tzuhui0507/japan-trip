// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        "milk-bg": "#F7F1EB",
        "milk-tea": "#C6A087",
        "milk-coffee": "#8C6A4F",
        "milk-foam": "#E5D5C5",
      },

      fontFamily: {
        sans: [
          '"Noto Sans JP"',
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        serif: [
          '"Noto Serif JP"',
          '"Times New Roman"',
          "serif",
        ],
      },
      // ⭐ 新增這一段
      fontSize: {
          input: "16px",     // 所有輸入框
          body: "14px",      // 一般內文
          note: "12px",      // 輔助說明
          tiny: "11px",      // caption / hint
      },
    },
  },

  plugins: [],
};