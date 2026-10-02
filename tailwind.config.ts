import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        vinho: "#4C0016",
        laranja: "#EF6F2E",
        vermelho: "#E3121B",
        amarelo: "#FFC614",
        creme: "#F5E3CD",
        tinta: "#1B1B1B",
        verde: "#60A905",
      },
      fontFamily: {
        disp: ["Modak", "ui-rounded", "Arial Rounded MT Bold", "system-ui", "sans-serif"],
        cond: ["Mouse Memoirs", "Arial Narrow", "system-ui", "sans-serif"],
        txt: ["Poppins", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        dura: "5px 5px 0 #1B1B1B",
        "dura-sm": "3px 3px 0 #1B1B1B",
        "dura-lg": "8px 8px 0 #1B1B1B",
        "dura-xl": "10px 10px 0 #1B1B1B",
      },
      transitionTimingFunction: {
        mola: "cubic-bezier(.34,1.56,.64,1)",
        suave: "cubic-bezier(.25,1,.5,1)",
      },
    },
  },
  plugins: [],
} satisfies Config;
