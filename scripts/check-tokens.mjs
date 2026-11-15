// tokens.css と src/palettes.ts を検証する。依存なし。
//   1. セマンティック層に生の hex が無い。UI のグレー（--c-gray-*）が無彩色で、名前と値が合っている
//   2. コントラスト基準（DESIGN-SYSTEM.md §2, §3）を light / dark の両方で満たす
//   3. tokens.css の --data-* が palettes.ts と一致する
//   4. 連続の配色が、小さい値を背景に近い側にする向きになっている
// 実行: npm run check
import { readFileSync } from "node:fs";
import { categorical, diverging, sequential } from "../src/palettes.ts";

const css = readFileSync(new URL("../tokens.css", import.meta.url), "utf8").replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);

// :root に書かれた宣言を集める（@media 内の上書きは対象外）
const decls = new Map();
for (const [, selector, body] of css.replace(/@media[^{]+\{(?:[^{}]*\{[^}]*\})*[^}]*\}/g, "").matchAll(/([^{}]+)\{([^}]*)\}/g)) {
  if (selector.trim() !== ":root") continue;
  for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    decls.set(name, value.trim());
  }
}

const THEMES = ["light", "dark"];

function resolve(name, theme) {
  let value = decls.get(name);
  if (value === undefined) throw new Error(`${name} is not defined`);
  for (let i = 0; /var\(/.test(value); i++) {
    if (i > 20) throw new Error(`${name}: var() nesting too deep`);
    value = value.replace(/var\((--[\w-]+)\)/g, (_, ref) => {
      if (!decls.has(ref)) throw new Error(`${name} refers to undefined ${ref}`);
      return decls.get(ref);
    });
  }
  value = value.replace(/light-dark\(\s*([^,()]+?)\s*,\s*([^,()]+?)\s*\)/g, (_, l, d) =>
    theme === "light" ? l : d,
  );
  return value.toLowerCase();
}

function luminance(hex) {
  if (!/^#[0-9a-f]{6}$/.test(hex)) throw new Error(`not a 6-digit hex: ${hex}`);
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const failures = [];
const fail = (message) => failures.push(message);

// 1. セマンティック層に生の hex が無い
for (const [name, value] of decls) {
  if (name.startsWith("--c-") || name.startsWith("--data-")) continue;
  if (value.includes("#")) fail(`${name} has a raw hex value (${value}); go through --c-*`);
}
for (const [name, value] of decls) {
  if (!name.startsWith("--c-gray-")) continue;
  const pair = name.slice("--c-gray-".length);
  if (value.toLowerCase() !== `#${pair.repeat(3)}`) fail(`${name} should be #${pair.repeat(3)} but is ${value}`);
}

// 2. コントラスト
const SURFACES = ["--page", "--surface", "--surface-2"];
const ON_SURFACES = [
  ["--text-primary", 4.5],
  ["--text-secondary", 4.5],
  ["--text-muted", 4.5],
  ["--status-error", 4.5],
  ["--status-warning", 4.5],
  ["--status-success", 4.5],
  ["--border-control", 3],
  ["--focus-ring", 3],
];

function requireContrast(label, fg, bg, min) {
  const ratio = contrast(fg, bg);
  if (ratio < min) fail(`${label}: ${ratio.toFixed(2)}:1 is below ${min}:1 (${fg} on ${bg})`);
}

for (const theme of THEMES) {
  for (const [token, min] of ON_SURFACES) {
    for (const surface of SURFACES) {
      requireContrast(`[${theme}] ${token} on ${surface}`, resolve(token, theme), resolve(surface, theme), min);
    }
  }
  // 押されたボタン: インクの塗りに地の色の文字
  requireContrast(`[${theme}] --page on --text-primary`, resolve("--page", theme), resolve("--text-primary", theme), 4.5);
  requireContrast(`[${theme}] --map-overlay-border on --map-land`, resolve("--map-overlay-border", theme), resolve("--map-land", theme), 3);

  // カテゴリ色はページと地図の陸に対して 3:1。
  // 水域は対象外（light の緑が 2.7:1。縁取りで補う。DESIGN-SYSTEM.md §3）
  for (const ground of ["--page", "--map-land"]) {
    categorical[theme].forEach((c, i) =>
      requireContrast(`[${theme}] categorical.${theme}[${i}] on ${ground}`, c, resolve(ground, theme), 3),
    );
  }

  // 4. 連続の配色は、小さい値が地の色に近い側
  const land = luminance(resolve("--map-land", theme));
  const ramp = sequential[theme];
  const distance = (c) => Math.abs(luminance(c) - land);
  if (distance(ramp[0]) >= distance(ramp[ramp.length - 1])) {
    fail(`[${theme}] sequential.${theme} must start at the end nearest the map ground`);
  }
}

// 3. tokens.css の --data-* が palettes.ts と一致する
function requireSame(name, theme, expected) {
  const actual = resolve(name, theme);
  if (actual !== expected) fail(`[${theme}] ${name} is ${actual} but palettes.ts has ${expected}`);
}

for (const theme of THEMES) {
  [0, 2, 4, 6, 8].forEach((stop, i) => requireSame(`--data-seq-${i}`, theme, sequential.full[stop]));
  categorical[theme].forEach((c, i) => requireSame(`--data-cat-${i + 1}`, theme, c));
  [["neg", 1], ["mid", 5], ["pos", 9]].forEach(([key, i]) => requireSame(`--data-div-${key}`, theme, diverging[i]));
}
const cssCatCount = [...decls.keys()].filter((n) => n.startsWith("--data-cat-")).length;
if (cssCatCount !== categorical.light.length) {
  fail(`tokens.css has ${cssCatCount} --data-cat-* but palettes.ts has ${categorical.light.length}`);
}

if (failures.length > 0) {
  console.error(`check-tokens: ${failures.length} problem(s)`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`check-tokens: OK (${decls.size} tokens, ${THEMES.length} themes)`);
