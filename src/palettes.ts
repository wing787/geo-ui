/**
 * データ可視化パレット。
 *
 * 地図レイヤ（MapLibre の paint）は CSS 変数を読めないので、色はここから渡す。
 * 凡例も同じ配列から作ること（地図と凡例の色がずれないようにするため）。
 * tokens.css の --data-* と同じ値で、`npm run check` が一致を検証する。
 *
 * `light` / `dark` は地図の背景（ベースマップ）の明るさを指す。
 * 選び方は docs/DESIGN-SYSTEM.md §3 を参照。
 */

export type Hex = `#${string}`;
export type Theme = "light" | "dark";

/** viridis の9停止（低 → 高）。隣り合う停止の間は線形補間で十分近い。 */
const VIRIDIS: readonly Hex[] = [
  "#440154",
  "#472d7b",
  "#3b528b",
  "#2c728e",
  "#21908c",
  "#27ad81",
  "#5dc863",
  "#aadc32",
  "#fde725",
];

/**
 * 連続値（降水強度・標高・密度など）。
 * - `full`: 全域。面の塗りで、端の値が背景に溶けてよいとき。
 * - `light` / `dark`: その背景に対して全停止が 3:1 以上になるよう端を切ったもの。
 *   線・点、または端の値も読ませたいとき。
 */
export const sequential: Readonly<Record<"full" | Theme, readonly Hex[]>> = {
  full: VIRIDIS,
  light: VIRIDIS.slice(0, 5),
  dark: VIRIDIS.slice(3),
};

/**
 * カテゴリ（レイヤ種別・分類など）。背景ごとに5色。
 * 全ての組み合わせが色覚シミュレーション下で区別でき、背景に対して 3:1 以上。
 * 6分類以上は色を足さず、分類をまとめるか、形・ラベルを併用する。
 */
export const categorical: Readonly<Record<Theme, readonly Hex[]>> = {
  light: ["#0072b2", "#d55e00", "#009e73", "#332288", "#882255"],
  dark: ["#56b4e9", "#e69f00", "#009e73", "#f0e442", "#d55e00"],
};

/**
 * 発散（平年差・増減など）。[負, 中点, 正]。
 * 中点は「偏差なし」なので、どちらの背景でも背景に沈む色にしている。
 */
export const diverging: Readonly<Record<Theme, readonly [Hex, Hex, Hex]>> = {
  light: ["#2166ac", "#f7f7f7", "#b2182b"],
  dark: ["#67a9cf", "#30363d", "#ef8a62"],
};

/**
 * 色の並びを [min, max] に等間隔で割り当てる。
 * 地図の interpolate 式と凡例の両方を、この結果から作る。
 *
 * @example
 * const stops = colorStops(sequential.dark, 0, 80);
 * const fillColor = ["interpolate", ["linear"], ["get", "mm_per_h"], ...stops.flat()];
 */
export function colorStops(
  colors: readonly Hex[],
  min: number,
  max: number,
): Array<[number, Hex]> {
  if (colors.length < 2) {
    throw new RangeError("colors must have at least 2 entries");
  }
  if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) {
    throw new RangeError("min and max must be finite and min < max");
  }
  const last = colors.length - 1;
  return colors.map((color, i) => [min + ((max - min) * i) / last, color]);
}
