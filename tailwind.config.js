export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },

      colors: {
        bgMain: "#0f1115",
        bgPanel: "#151922",
        bgSoft: "#1c2230",
        bgHover: "#232a3a",

        borderMain: "#2a3142",

        textMain: "#e6e9ef",
        textDim: "#9aa4b2",

        accent: "#ff6b2d",
        accentSoft: "#ff8a4d",
      },
    },
  },
  plugins: [],
}