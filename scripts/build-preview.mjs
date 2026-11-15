// 見た目の確認用ページ preview.html を生成する（コミットしない）。
// tokens.css / base.css はリンクで読み、パレットは src/palettes.ts から埋め込む。
// 実行: npm run preview
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { categorical, colorStops, diverging, sequential } from "../src/palettes.ts";

const gradient = (colors) =>
  `linear-gradient(to right, ${colorStops(colors, 0, 100)
    .map(([p, c]) => `${c} ${p}%`)
    .join(", ")})`;

const ramp = (label, colors, lo, hi) => `
  <div class="ramp">
    <div class="label">${label}</div>
    <div class="ramp-bar" style="background:${gradient(colors)}"></div>
    <div class="ramp-range"><span>${lo}</span><span>${hi}</span></div>
  </div>`;

const SURFACES = ["page", "surface", "surface-2"];
const TEXTS = ["text-primary", "text-secondary", "text-muted", "accent", "status-error", "status-warning", "status-success"];

function column(theme) {
  const cat = categorical[theme];
  const div = diverging[theme];
  const seq = sequential[theme];
  return `
<section class="theme" data-theme="${theme}">
  <h2>${theme}</h2>

  <h3>文字と面</h3>
  <p class="note">各行の右の数値は、その面に対するコントラスト比（基準 4.5）。</p>
  ${SURFACES.map(
    (s) => `
  <div class="plate" style="background:var(--${s})">
    <div class="label">--${s}</div>
    ${TEXTS.map((t) => `<div class="row" style="color:var(--${t})"><span>--${t} 地図と凡例 Map legend 123</span><span class="ratio" data-min="4.5"></span></div>`).join("")}
  </div>`,
  ).join("")}

  <h3>境界とコントロール</h3>
  <div class="grid">
    <div class="card">カード（--border）</div>
    <div class="card" style="border-color:var(--border-strong)">強調（--border-strong）</div>
    <input class="input" value="入力欄（--border-control）" aria-label="入力欄の見本">
    <div class="card" style="border-color:var(--divider)">区切り（--divider）</div>
  </div>
  <div class="grid">
    <button class="btn">レイヤを表示</button>
    <button class="btn btn-primary">地点を検索</button>
    <button class="btn focus-demo">フォーカス中の見本</button>
    <a href="#" class="link">リンク（--accent）</a>
  </div>

  <h3>状態</h3>
  <div class="status" style="color:var(--status-error)"><span aria-hidden="true">✕</span>タイルを取得できません。接続を確認してください。</div>
  <div class="status" style="color:var(--status-warning)"><span aria-hidden="true">!</span>データが30分以上更新されていません。</div>
  <div class="status" style="color:var(--status-success)"><span aria-hidden="true">✓</span>最新のデータを表示しています。</div>

  <h3>カテゴリ（5色）</h3>
  <p class="note">地図の背景（--page）の上で、塗り・線・点のすべてが見分けられるか。</p>
  <div class="map with-legend">
    <svg viewBox="0 0 500 150" role="img" aria-label="カテゴリ色の見本">
      ${cat.map((c, i) => `<rect x="${10 + i * 98}" y="10" width="88" height="40" fill="${c}"/>`).join("")}
      ${cat.map((c, i) => `<polyline points="${10 + i * 98},90 ${40 + i * 98},66 ${68 + i * 98},92 ${98 + i * 98},70" fill="none" stroke="${c}" stroke-width="2"/>`).join("")}
      ${cat.map((c, i) => [0, 1, 2].map((k) => `<circle cx="${24 + i * 98 + k * 30}" cy="${124 + (k % 2) * 8}" r="4" fill="${c}"/>`).join("")).join("")}
    </svg>
    <div class="overlay">
      <div class="label">レイヤ種別</div>
      ${cat.map((c, i) => `<div class="legend-row"><span class="swatch" style="background:${c}"></span>分類 ${i + 1}</div>`).join("")}
    </div>
  </div>

  <h3>連続（viridis）</h3>
  <div class="map pad">
    ${ramp(`sequential.${theme}（線・点、端も読ませる）— 降水強度 mm/h`, seq, "0", "80+")}
    ${ramp("sequential.full（面の塗り）— 降水強度 mm/h", sequential.full, "0", "80+")}
    <svg viewBox="0 0 500 40" role="img" aria-label="連続色の線と点の見本">
      ${seq.map((c, i) => `<line x1="${10 + i * (480 / seq.length)}" y1="12" x2="${10 + (i + 0.8) * (480 / seq.length)}" y2="12" stroke="${c}" stroke-width="2"/><circle cx="${10 + (i + 0.4) * (480 / seq.length)}" cy="30" r="4" fill="${c}"/>`).join("")}
    </svg>
  </div>

  <h3>発散</h3>
  <div class="map pad">
    ${ramp(`diverging.${theme} — 平年差 ℃`, div, "−3", "+3")}
    <p class="note">中点（偏差なし）が背景に沈み、両端が目立つか。</p>
  </div>

  <h3>タイポグラフィ</h3>
  ${[["xl", "22"], ["lg", "18"], ["base", "16"], ["md", "14"], ["sm", "13"], ["xs", "12"]]
    .map(([k, px]) => `<div style="font-size:var(--text-${k})">${px}px 降水ナウキャスト Rainfall nowcast</div>`)
    .join("")}
  <div class="mono">35.6812°N 139.7671°E · 2026-11-15 14:30 JST · 出典: 合成データ</div>
  <div class="serif">Serif — a quiet voice for long-form reading.</div>
  <div style="font-weight:var(--weight-medium)">ウェイト 500 Medium</div>
</section>`;
}

const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>geo-ui preview</title>
<!-- 確認用ページに限り CDN からフォントを読む。アプリでは自前配信（DESIGN-SYSTEM.md §4） -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500&family=IBM+Plex+Sans+JP:wght@400;500&family=IBM+Plex+Serif:wght@400;500&display=swap">
<link rel="stylesheet" href="./tokens.css">
<link rel="stylesheet" href="./base.css">
<style>
  body { margin: 0; }
  .cols { display: grid; grid-template-columns: 1fr 1fr; }
  @media (max-width: 900px) { .cols { grid-template-columns: 1fr; } }
  .theme { background: var(--page); color: var(--text-primary); padding: var(--space-6); min-width: 0; }
  h2 { font-size: var(--text-xl); font-weight: var(--weight-medium); margin: 0 0 var(--space-4); }
  h3 { font-size: var(--text-md); font-weight: var(--weight-medium); margin: var(--space-8) 0 var(--space-2); }
  .note, .label { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-muted); margin: 0 0 var(--space-2); }
  .plate { padding: var(--space-3) var(--space-4); border: var(--border-width) solid var(--border); margin-bottom: var(--space-2); border-radius: var(--radius-md); }
  .row { display: flex; justify-content: space-between; gap: var(--space-4); font-size: var(--text-md); line-height: 1.7; }
  .ratio { font-family: var(--font-mono); font-size: var(--text-xs); white-space: nowrap; }
  .ratio.bad { text-decoration: underline wavy; }
  .grid { display: flex; flex-wrap: wrap; gap: var(--space-3); align-items: center; margin-bottom: var(--space-3); }
  .card { background: var(--surface); border: var(--border-width) solid var(--border); border-radius: var(--radius-card); padding: var(--space-3) var(--space-4); font-size: var(--text-sm); }
  .input { background: var(--surface); color: var(--text-primary); border: var(--border-solid) solid var(--border-control); border-radius: var(--radius-md); padding: var(--space-2) var(--space-3); font: inherit; font-size: var(--text-sm); }
  .btn { background: transparent; color: var(--text-primary); border: var(--border-solid) solid var(--border-control); border-radius: var(--radius-md); padding: var(--space-2) var(--space-4); font: inherit; font-size: var(--text-sm); cursor: pointer; transition: background var(--duration-fast) var(--ease-standard); }
  .btn:hover { background: var(--surface-2); }
  .btn-primary, .btn-primary:hover { background: var(--accent); color: var(--accent-text); border-color: var(--accent); }
  .focus-demo { outline: var(--focus-ring-width) solid var(--focus-ring); outline-offset: var(--focus-ring-offset); }
  .link { color: var(--accent); font-size: var(--text-sm); }
  .status { display: flex; gap: var(--space-2); font-size: var(--text-sm); margin-bottom: var(--space-1); }
  .status span { font-family: var(--font-mono); }
  .map { position: relative; isolation: isolate; background: var(--page); border: var(--border-width) solid var(--border); border-radius: var(--radius-md); overflow: hidden; }
  .map.pad { padding: var(--space-4); }
  .map svg { display: block; width: 100%; height: auto; }
  .map.with-legend svg { width: calc(100% - 96px); }
  .overlay { position: absolute; right: var(--space-3); top: var(--space-3); z-index: var(--z-map-control); background: var(--map-overlay-surface); border: var(--map-overlay-border-width) solid var(--map-overlay-border); border-radius: var(--radius-sm); padding: var(--space-2) var(--space-3); font-size: var(--text-xs); }
  .legend-row { display: flex; align-items: center; gap: var(--space-2); line-height: 1.7; }
  .swatch { width: 12px; height: 12px; border-radius: 2px; }
  .ramp { margin-bottom: var(--space-4); }
  .ramp-bar { height: 12px; border-radius: 2px; }
  .ramp-range { display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-secondary); margin-top: var(--space-1); }
  .mono { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-muted); margin-top: var(--space-3); }
  .serif { font-family: var(--font-serif); font-size: var(--text-lg); margin-top: var(--space-2); }
</style>
</head>
<body>
<div class="cols">${column("light")}${column("dark")}</div>
<script>
  // 表示中の実際の色からコントラスト比を計算して添える
  const rgb = (s) => s.match(/[\\d.]+/g).slice(0, 3).map(Number);
  const lum = (c) => { const [r, g, b] = c.map((v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  for (const el of document.querySelectorAll(".ratio")) {
    const fg = lum(rgb(getComputedStyle(el).color));
    const bg = lum(rgb(getComputedStyle(el.closest(".plate")).backgroundColor));
    const ratio = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
    el.textContent = ratio.toFixed(2);
    if (ratio < Number(el.dataset.min)) el.classList.add("bad");
  }
</script>
</body>
</html>
`;

const out = new URL("../preview.html", import.meta.url);
writeFileSync(out, html);
console.log(`wrote ${fileURLToPath(out)}`);
