/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#132A2E",
        paper: "#F6F4EE",
        emerald: "#1F5D50",
        clay: "#B5622A",
        mist: "#DCE6E4",
        gold: "#C9A24B"
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"]
      },
      borderRadius: {
        card: "10px"
      }
    },
  },
  plugins: [],
}
