module.exports = {
  content: [
    "./templates/**/*.html",
    "./**/templates/**/*.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        silkscreen: ["Silkscreen", "sans-serif"],
        spaceMono: ["Space Mono", "monospace"],
        mono: ["Fira Code", "monospace"],
      },
      screens: {
        sm: "640px", // Adds responsive breakpoint
      },
      keyframes: {
        moveToTop: {
          "0%": { top: "94%", opacity: "0" },
          "50%": { top: "30%", opacity: "0.5" },
          "100%": { top: "40%", opacity: "1" },
        },
        appear: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        disappear: {
          "0%": { opacity: "1" },
          "100%": { opacity: "0" },
        },
      },
      animation: {
        moveToTop: "moveToTop 2s ease-in-out forwards",
        appear: "appear 1s ease-in-out forwards",
        disappear: "disappear 2s ease-in-out forwards",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("tailwind-scrollbar"),
  ],
};
