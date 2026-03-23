/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./hooks/**/*.{js,jsx}",
    "./services/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0E1726",
        cloud: "#F6F3EE",
        ember: "#FF7A18",
        lagoon: "#15616D",
        gold: "#DDA15E"
      },
      boxShadow: {
        soft: "0 20px 60px rgba(14, 23, 38, 0.18)"
      }
    }
  },
  plugins: []
};
