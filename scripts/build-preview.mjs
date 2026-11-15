// 見た目の確認用ページ preview.html を生成する（コミットしない）。
// tokens.css / base.css はリンクで読み、配色は src/palettes.ts から埋め込む。
// 実行: npm run preview
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  attribution,
  categorical,
  colorStops,
  convention,
  diverging,
  image,
  jmaRainFor,
  optional,
  sequential,
} from "../src/palettes.ts";

const gradient = (colors) =>
  `linear-gradient(to right, ${colorStops(colors, 0, 100)
    .map(([p, c]) => `${c} ${p}%`)
    .join(", ")})`;

/** 連続の配色。色帯と両端の値 */
const ramp = (label, colors, lo, hi) => `
  <div class="ramp">
    <div class="legend-title">${label}</div>
    <div class="ramp-bar" style="background:${gradient(colors)}"></div>
    <div class="ramp-range data"><span>${lo}</span><span>${hi}</span></div>
  </div>`;

/** 階級のある配色。色見本と階級の範囲 */
const classes = (label, colors, labels) => `
  <div class="ramp">
    <div class="legend-title">${label}</div>
    <div class="classes">${colors
      .map((c, i) => `<div><span class="swatch wide" style="background:${c}"></span><span class="data">${labels?.[i] ?? ""}</span></div>`)
      .join("")}</div>
  </div>`;

const classLabels = ({ edges }, from = null) => [
  from === null ? `${edges[0]} 未満` : `${from} – ${edges[0]}`,
  ...edges.map((e, i) => (i === edges.length - 1 ? `${e} 以上` : `${e} – ${edges[i + 1]}`)),
];

const SURFACES = ["page", "surface", "surface-2"];
const TEXTS = ["text-primary", "text-secondary", "text-muted", "status-error", "status-warning", "status-success"];

function column(theme) {
  const cat = categorical[theme];
  const rain = jmaRainFor(theme);
  return `
<section class="theme" data-theme="${theme}">
  <h2>${theme}</h2>

  <h3>文字と面</h3>
  <p class="note">各行の右の数値は、その面に対するコントラスト比（基準 4.5）。</p>
  ${SURFACES.map(
    (s) => `
  <div class="plate" style="background:var(--${s})">
    <div class="note">--${s}</div>
    ${TEXTS.map((t) => `<div class="row" style="color:var(--${t})"><span>--${t} 地図と凡例 Map legend 123</span><span class="ratio data" data-min="4.5"></span></div>`).join("")}
  </div>`,
  ).join("")}

  <h3>境界と操作部品</h3>
  <div class="grid">
    <div class="panel">区切り（--border）</div>
    <div class="panel" style="border-color:var(--border-strong)">強調（--border-strong）</div>
    <input class="input" value="入力欄（--border-control）" aria-label="入力欄の見本">
  </div>
  <div class="grid">
    <button class="btn">レイヤを表示</button>
    <button class="btn" aria-pressed="true">選択中</button>
    <button class="btn focus-demo">フォーカス中の見本</button>
    <a href="#" class="link">リンクは下線</a>
  </div>

  <h3>状態</h3>
  <div class="status" style="color:var(--status-error)"><span aria-hidden="true">✕</span>タイルを取得できません。接続を確認してください。</div>
  <div class="status" style="color:var(--status-warning)"><span aria-hidden="true">!</span>データが30分以上更新されていません。</div>
  <div class="status" style="color:var(--status-success)"><span aria-hidden="true">✓</span>最新のデータを表示しています。</div>

  <h3>基図とカテゴリ（5色）</h3>
  <p class="note">左が水域、右が陸。塗り・線・点は地の色で縁取る。右端の点は選択中。</p>
  <div class="sheet">
    <svg viewBox="0 0 500 150" role="img" aria-label="基図とカテゴリ色の見本">
      <rect width="500" height="150" fill="var(--map-water)"/>
      <path d="M120 0 L150 60 L110 150 L500 150 L500 0 Z" fill="var(--map-land)" stroke="var(--map-coast)"/>
      ${cat.map((c, i) => `<rect x="${12 + i * 98}" y="12" width="84" height="34" fill="${c}" stroke="var(--map-casing)"/>`).join("")}
      ${cat.map((c, i) => { const pts = `${12 + i * 98},88 ${40 + i * 98},64 ${68 + i * 98},90 ${96 + i * 98},68`; return `<polyline points="${pts}" fill="none" stroke="var(--map-casing)" stroke-width="${4.5 + i * 0.5}"/><polyline points="${pts}" fill="none" stroke="${c}" stroke-width="${1.5 + i * 0.5}"/>`; }).join("")}
      ${cat.map((c, i) => [0, 1, 2].map((k) => `<circle cx="${24 + i * 98 + k * 30}" cy="${122 + (k % 2) * 8}" r="5" fill="${c}" stroke="var(--map-casing)" stroke-width="1.5"/>`).join("")).join("")}
      <circle cx="476" cy="122" r="8" fill="none" stroke="var(--map-selection)" stroke-width="1.5"/>
    </svg>
  </div>
  <div class="legend">${cat.map((c, i) => `<div class="legend-row"><span class="swatch" style="background:${c}"></span>分類 ${i + 1}</div>`).join("")}</div>

  <h3>慣例の配色</h3>
  <div class="sheet pad">
    ${classes(`降水強度 ${rain.unit}（jmaRainFor("${theme}")）`, rain.colors, classLabels(rain, rain.drawFrom))}
    ${classes(`気温 ${convention.jmaTemperature.unit}`, convention.jmaTemperature.colors, classLabels(convention.jmaTemperature))}
    ${classes("平年比（平均気温）低い → 高い", convention.jmaAnomalyTemperature)}
    ${classes("平年比（降水量）少ない → 多い", convention.jmaAnomalyPrecipitation)}
    ${ramp("標高 m（Hypsometric Tint）", convention.hypsometric, "0", "2,500 以上")}
    <p class="source">${attribution.jma}。${attribution.hypsometric}。</p>
  </div>

  <h3>連続・発散・画像</h3>
  <div class="sheet pad">
    ${ramp(`件数（sequential.${theme}）小さい値が地の色に近い`, sequential[theme], "0", "70 以上")}
    ${classes("前年比 %（diverging）減少 → 増加", diverging)}
    ${ramp("SAR の強度（image.grayC）テーマで向きを変えない", image.grayC, "弱い", "強い")}
    ${ramp("optional.turbo（既定にしない）", optional.turbo, "", "")}
  </div>

  <h3>タイポグラフィ</h3>
  ${[["xl", "22"], ["lg", "18"], ["base", "16"], ["sm", "14"]]
    .map(([k, px]) => `<div style="font-size:var(--text-${k})">${px}px 降水ナウキャスト Rainfall nowcast</div>`)
    .join("")}
  <div class="data" style="font-size:var(--text-sm)">読み取り値 3,448 m　35°22′N 138°44′E</div>
  <div class="source">12px は目盛・縮尺・出典だけ。出典：合成データ</div>
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
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500&family=IBM+Plex+Sans+Condensed:wght@400;500&family=IBM+Plex+Sans+JP:wght@400;500&display=swap">
<link rel="stylesheet" href="./tokens.css">
<link rel="stylesheet" href="./base.css">
<style>
  body { margin: 0; }
  .cols { display: grid; grid-template-columns: 1fr 1fr; }
  @media (max-width: 900px) { .cols { grid-template-columns: 1fr; } }
  .theme { background: var(--page); color: var(--text-primary); padding: var(--space-6); min-width: 0; }
  h2 { font-size: var(--text-xl); font-weight: var(--weight-medium); margin: 0 0 var(--space-4); }
  h3 { font-size: var(--text-lg); font-weight: var(--weight-medium); margin: var(--space-8) 0 var(--space-2); }
  .data { font-family: var(--font-data); font-variant-numeric: tabular-nums; }
  .note { font-size: var(--text-sm); color: var(--text-secondary); margin: 0 0 var(--space-2); }
  .source { font-family: var(--font-data); font-size: var(--text-map); color: var(--text-secondary); margin: var(--space-2) 0 0; }
  .plate { padding: var(--space-3) var(--space-4); border: var(--border-width) solid var(--border); margin-bottom: var(--space-2); }
  .row { display: flex; justify-content: space-between; gap: var(--space-4); font-size: var(--text-sm); line-height: 1.7; }
  .ratio { white-space: nowrap; }
  .ratio.bad { text-decoration: underline wavy; }
  .grid { display: flex; flex-wrap: wrap; gap: var(--space-3); align-items: center; margin-bottom: var(--space-3); }
  .panel { background: var(--surface); border: var(--border-width) solid var(--border); padding: var(--space-3) var(--space-4); font-size: var(--text-sm); }
  .input { background: var(--surface); color: var(--text-primary); border: var(--border-width) solid var(--border-control); border-radius: var(--radius-control); padding: var(--space-2) var(--space-3); font: inherit; font-size: var(--text-sm); }
  .btn { background: transparent; color: var(--text-primary); border: var(--border-width) solid var(--border-control); border-radius: var(--radius-control); padding: var(--space-2) var(--space-4); font: inherit; font-size: var(--text-sm); cursor: pointer; transition: background var(--duration-fast) var(--ease-standard); }
  .btn:hover { background: var(--surface-2); }
  .btn[aria-pressed="true"] { background: var(--text-primary); color: var(--page); border-color: var(--text-primary); }
  .focus-demo { outline: var(--focus-ring-width) solid var(--focus-ring); outline-offset: var(--focus-ring-offset); box-shadow: 0 0 0 calc(var(--focus-ring-offset) + var(--focus-ring-width) * 2) var(--focus-ring-halo); }
  .link { color: inherit; font-size: var(--text-sm); text-decoration: underline; }
  .status { display: flex; gap: var(--space-2); font-size: var(--text-sm); margin-bottom: var(--space-1); }
  .sheet { isolation: isolate; border: var(--border-width) solid var(--text-primary); background: var(--map-land); }
  .sheet.pad { padding: var(--space-4); }
  .sheet svg { display: block; width: 100%; height: auto; }
  .legend { display: flex; flex-wrap: wrap; gap: var(--space-1) var(--space-4); margin-top: var(--space-2); font-size: var(--text-sm); }
  .legend-row { display: flex; align-items: center; gap: var(--space-2); }
  .legend-title { font-size: var(--text-sm); font-weight: var(--weight-medium); margin-bottom: var(--space-1); }
  .swatch { display: inline-block; width: 14px; height: 14px; }
  .swatch.wide { display: block; width: 100%; }
  .classes { display: flex; }
  .classes > div { flex: 1; min-width: 0; font-size: var(--text-map); text-align: center; white-space: nowrap; overflow: hidden; }
  .ramp { margin-bottom: var(--space-4); }
  .ramp-bar { height: 14px; }
  .ramp-range { display: flex; justify-content: space-between; font-size: var(--text-sm); color: var(--text-secondary); margin-top: var(--space-1); }
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
