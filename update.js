const fs = require('fs');

const CSS_PATH = "c:\\Users\\abdul\\OneDrive\\Desktop\\Projects\\git-hub\\smart_queue\\style.css";
const HTML_PATH = "c:\\Users\\abdul\\OneDrive\\Desktop\\Projects\\git-hub\\smart_queue\\index.html";
const JS_PATH = "c:\\Users\\abdul\\OneDrive\\Desktop\\Projects\\git-hub\\smart_queue\\main.js";

// 1. Update style.css
let css = fs.readFileSync(CSS_PATH, "utf-8");

css = css.replace(
`  /* --- Fon va yuzalar --- */
  --c-bg: #f4f2ee; /* Asosiy fon (krema rang) */
  --c-surface: #ffffff; /* Kartalar foni */
  --c-surface2: #eeece8; /* Ikkilamchi yuzalar */
  --c-surface3: #e5e2dc; /* Uchlamchi yuzalar */

  /* --- Matn ranglari --- */`,
`  /* --- Fon va yuzalar --- */
  --c-bg: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);
  --c-surface: rgba(255, 255, 255, 0.4);
  --c-surface2: rgba(255, 255, 255, 0.25);
  --c-surface3: rgba(255, 255, 255, 0.6);
  --blur: blur(20px);
  --glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);

  /* --- Matn ranglari --- */`
);

css = css.replace(
`  /* --- Chegaralar --- */
  --c-border: rgba(28, 26, 24, 0.1);
  --c-border2: rgba(28, 26, 24, 0.18);`,
`  /* --- Chegaralar --- */
  --c-border: rgba(255, 255, 255, 0.5);
  --c-border2: rgba(255, 255, 255, 0.7);`
);

css = css.replace(
`[data-theme="dark"] {
  --c-accent: #00c9a7;
  --c-accent2: #00e0bb;
  --c-accent-bg: #0d2d26;
  --c-amber: #f5a623;
  --c-amber-bg: #2d1f08;
  --c-danger: #e74c3c;
  --c-danger-bg: #2d100e;
  --c-info: #60a5fa;
  --c-info-bg: #0f1e3d;

  --c-bg: #131210;
  --c-surface: #1e1c19;
  --c-surface2: #272420;
  --c-surface3: #302d28;`,
`[data-theme="dark"] {
  --c-accent: #00e0bb;
  --c-accent2: #00c9a7;
  --c-accent-bg: rgba(0, 224, 187, 0.15);
  --c-amber: #f5a623;
  --c-amber-bg: rgba(245, 166, 35, 0.15);
  --c-danger: #ff4757;
  --c-danger-bg: rgba(255, 71, 87, 0.15);
  --c-info: #70a1ff;
  --c-info-bg: rgba(112, 161, 255, 0.15);

  --c-bg: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
  --c-surface: rgba(18, 18, 18, 0.4);
  --c-surface2: rgba(30, 30, 30, 0.4);
  --c-surface3: rgba(45, 45, 45, 0.6);
  --blur: blur(24px);
  --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.35);`
);

css = css.replace(
`  border: 0.5px solid var(--c-border);
  padding: 16px;
  margin-bottom: 12px;
  transition:
    background 0.3s ease,
    border-color 0.3s ease;
}`,
`  border: 1px solid var(--c-border);
  padding: 16px;
  margin-bottom: 12px;
  backdrop-filter: var(--blur);
  -webkit-backdrop-filter: var(--blur);
  box-shadow: var(--glass-shadow);
  transition: all 0.3s ease;
}`
);

css = css.replace(
`.topbar {
  background: var(--c-surface);
  border-bottom: 0.5px solid var(--c-border);`,
`.topbar {
  background: var(--c-surface);
  backdrop-filter: var(--blur);
  -webkit-backdrop-filter: var(--blur);
  border-bottom: 1px solid var(--c-border);`
);

css = css.replace(
`.bottomnav {
  background: var(--c-surface);
  border-top: 0.5px solid var(--c-border);`,
`.bottomnav {
  background: var(--c-surface);
  backdrop-filter: var(--blur);
  -webkit-backdrop-filter: var(--blur);
  border-top: 1px solid var(--c-border);`
);

css = css.replace(
`.modal {
  background: var(--c-surface);
  border-radius: 24px 24px 0 0;`,
`.modal {
  background: var(--c-surface);
  backdrop-filter: var(--blur);
  -webkit-backdrop-filter: var(--blur);
  border-top: 1px solid var(--c-border);
  box-shadow: var(--glass-shadow);
  border-radius: 24px 24px 0 0;`
);

css = css.replace(
`.place-card {
  background: var(--c-surface);
  border-radius: var(--r);
  border: 0.5px solid var(--c-border);`,
`.place-card {
  background: var(--c-surface);
  backdrop-filter: var(--blur);
  -webkit-backdrop-filter: var(--blur);
  border-radius: var(--r);
  border: 1px solid var(--c-border);
  box-shadow: var(--glass-shadow);`
);

css = css.replace(
`html,
body {
  height: 100%;
  font-family: var(--font);
  background: var(--c-bg);`,
`html,
body {
  height: 100%;
  font-family: var(--font);
  background: var(--c-bg);
  background-attachment: fixed;`
);

css = css.replace(
`#screen-display {
  background: #0a1f1a;`,
`#screen-display {
  background: var(--c-bg);`
);

fs.writeFileSync(CSS_PATH, css, "utf-8");

// 2. Update index.html
let html = fs.readFileSync(HTML_PATH, "utf-8");

if (!html.includes("unpkg.com/@phosphor-icons")) {
    html = html.replace("</head>", '  <script src="https://unpkg.com/@phosphor-icons/web"></script>\n</head>');
}

const emoji_map = {
    "🌙": '<i class="ph-fill ph-moon"></i>',
    "⚡": '<i class="ph-fill ph-lightning"></i>',
    "👤": '<i class="ph-fill ph-user"></i>',
    "🏢": '<i class="ph-fill ph-buildings"></i>',
    "🏠": '<i class="ph-fill ph-house"></i>',
    "🔍": '<i class="ph-fill ph-magnifying-glass"></i>',
    "📋": '<i class="ph-fill ph-clipboard-text"></i>',
    "📍": '<i class="ph-fill ph-map-pin"></i>',
    "⭐": '<i class="ph-fill ph-star"></i>',
    "🕐": '<i class="ph-fill ph-clock"></i>',
    "✂️": '<i class="ph-fill ph-scissors"></i>',
    "🏥": '<i class="ph-fill ph-hospital"></i>',
    "🏦": '<i class="ph-fill ph-bank"></i>',
    "🚗": '<i class="ph-fill ph-car"></i>',
    "🏛": '<i class="ph-fill ph-bank"></i>',
    "🗺": '<i class="ph-fill ph-map-trifold"></i>',
    "✅": '<i class="ph-bold ph-check"></i>',
    "🔔": '<i class="ph-fill ph-bell"></i>',
    "💳": '<i class="ph-fill ph-credit-card"></i>',
    "🚪": '<i class="ph-bold ph-sign-out"></i>',
    "📺": '<i class="ph-fill ph-television"></i>',
    "▶": '<i class="ph-bold ph-play"></i>',
    "☀️": '<i class="ph-fill ph-sun"></i>'
};

for (const [emoji, tag] of Object.entries(emoji_map)) {
    html = html.split(emoji).join(tag);
}

fs.writeFileSync(HTML_PATH, html, "utf-8");

// 3. Update main.js
let js = fs.readFileSync(JS_PATH, "utf-8");

for (const [emoji, tag] of Object.entries(emoji_map)) {
    js = js.split(`"${emoji}"`).join(`\`${tag}\``);
    js = js.split(`'${emoji}'`).join(`\`${tag}\``);
    js = js.split(emoji).join(tag);
}

js = js.replace('document.body.dataset.theme = STATE.isDark ? "dark" : "";',
                'document.documentElement.dataset.theme = STATE.isDark ? "dark" : "";\n  document.body.dataset.theme = STATE.isDark ? "dark" : "";');

js = js.replace("btn.textContent = icon;", "btn.innerHTML = icon;");

fs.writeFileSync(JS_PATH, js, "utf-8");

console.log("Done");
