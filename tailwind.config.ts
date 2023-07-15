import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        grow: "grow 200ms",
        shrink: "shrink 200ms",
      },
      keyframes: {
        grow: {
          from: { transform: "scale(0.75)", opacity: "0.25" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        shrink: {
          from: { transform: "scale(1)", opacity: "1" },
          to: { transform: "scale(0.75)", opacity: "0.25" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
} satisfies Config;
