import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        mist: "#f7f8f5",
        moss: "#6f7f55",
        ember: "#c65d3a",
        lagoon: "#0f766e",
        plum: "#6d4c7d"
      },
      boxShadow: {
        soft: "0 20px 70px rgba(17, 24, 39, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
