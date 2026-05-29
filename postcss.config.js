module.exports = {
  plugins: [
    // Tailwind's PostCSS plugin moved to a separate package
    require('@tailwindcss/postcss'),
    require('autoprefixer'),
  ],
}

