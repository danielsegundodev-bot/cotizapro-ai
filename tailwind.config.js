/** Tailwind build config: compiles a static tailwind.css instead of running the CDN script in the browser. */
module.exports = {
  content: ['./index.html', './app.js'],
  theme: { extend: {} },
  plugins: []
};
