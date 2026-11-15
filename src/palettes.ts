/**
 * データの配色。
 *
 * 地図レイヤ（MapLibre の paint）は CSS 変数を読めないので、色はここから渡す。
 * 凡例も同じ配列から作ること（地図と凡例の色がずれないようにするため）。
 * tokens.css の --data-* は一部の値の写しで、`npm run check` が一致を検証する。
 *
 * `light` / `dark` は地図の背景（基図）の明るさを指す。
 * どのデータにどの配色を使うかは docs/DESIGN-SYSTEM.md §3 の対応表に従う。
 */

export type Hex = `#${string}`;
export type Theme = "light" | "dark";

/**
 * 階級のある配色。`colors[i]` は `edges[i - 1]` 以上 `edges[i]` 未満の値に使う。
 * `colors.length === edges.length + 1`。
 */
export interface ClassedPalette {
  readonly unit: string;
  readonly edges: readonly number[];
  readonly colors: readonly Hex[];
}

/** viridis（matplotlib）の9停止。暗 → 明。隣り合う停止の間は線形補間で十分近い。 */
const VIRIDIS: readonly Hex[] = [
  "#440154",
  "#472d7b",
  "#3b528b",
  "#2c728e",
  "#21918c",
  "#28ae80",
  "#5ec962",
  "#addc30",
  "#fde725",
];

/**
 * 連続値（件数・密度など、慣例の配色を持たないもの）。
 * - `full`: 全域。暗 → 明。
 * - `light` / `dark`: 小さい値 → 大きい値の順。小さい値がその背景に近い側になる向きで、
 *   背景に沈む端を1停止切ってある。
 */
export const sequential: Readonly<Record<"full" | Theme, readonly Hex[]>> = {
  full: VIRIDIS,
  light: [...VIRIDIS].reverse().slice(1),
  dark: VIRIDIS.slice(1),
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
 * 発散（前年比・増減など）。RdYlBu の11階級（ColorBrewer、Apache 2.0）。
 * [減少 … 増加] の順で、減少が青、増加が赤。背景の明暗によらず同じ配色を使う。
 * 気象の平年比には `convention.jmaAnomaly*` を使う。
 */
export const diverging: readonly Hex[] = [
  "#313695",
  "#4575b4",
  "#74add1",
  "#abd9e9",
  "#e0f3f8",
  "#ffffbf",
  "#fee090",
  "#fdae61",
  "#f46d43",
  "#d73027",
  "#a50026",
];

/**
 * 画像として読むラスター（SAR などの強度画像）。暗 → 明。
 * テーマが変わっても向きを変えない。
 */
export const image = {
  /** grayC（Scientific colour maps、F. Crameri、MIT）。知覚的に均等な無彩色。 */
  grayC: ["#000000", "#262626", "#444444", "#5f5f5f", "#777777", "#919191", "#b0b0b0", "#d5d5d5", "#ffffff"],
} as const satisfies Record<string, readonly Hex[]>;

/**
 * 慣例の配色。値と色の対応が決まっているので、色と階級の境界を変えない。
 * テーマに合わせて向きを変えない。凡例の近くに出典を表示する（`attribution`）。
 */
export const convention = {
  /**
   * 気象庁の降水ナウキャスト。8階級。値は降水ナウキャストの凡例のもの。
   * 黄色は凡例が (255,245,0)、気象庁の配色の指針（表2-1）が (250,245,0) で、わずかに違う。凡例に合わせている。
   * 暗い背景では最初の階級を描かない。`jmaRainFor(theme)` を使うこと。
   */
  jmaRain: {
    unit: "mm/h",
    edges: [1, 5, 10, 20, 30, 50, 80],
    colors: ["#f2f2ff", "#a0d2ff", "#218cff", "#0041ff", "#fff500", "#ff9900", "#ff2800", "#b40068"],
  },
  /** 気象庁の指針の気温。10階級。 */
  jmaTemperature: {
    unit: "℃",
    edges: [-5, 0, 5, 10, 15, 20, 25, 30, 35],
    colors: ["#002080", "#0041ff", "#0096ff", "#b9ebff", "#fffff0", "#ffff96", "#faf500", "#ff9900", "#ff2800", "#b40068"],
  },
  /** 気象庁の季節予報、平均気温の平年比。[低い … 高い] の11色。境界は資料ごとに違うのでアプリ側で決める。 */
  jmaAnomalyTemperature: [
    "#000070", "#2121ff", "#007eff", "#46ffff", "#c8ffff", "#fffff0",
    "#fff0b4", "#fff000", "#ff9900", "#ff1a1a", "#910053",
  ],
  /** 気象庁の季節予報、降水量の平年比。[少ない … 多い] の11色。 */
  jmaAnomalyPrecipitation: [
    "#3c1e05", "#783705", "#f5780f", "#ffc846", "#ffe5bf", "#fffff0",
    "#49f3d6", "#1fccaf", "#009980", "#004d40", "#002626",
  ],
  /** 陸の標高の段彩（GeoPalettes の Hypsometric Tint、CC BY 4.0）。低 → 高。停止の間は補間してよい。 */
  hypsometric: [
    "#aaddaa", "#bed799", "#ced288", "#ddcc77", "#c1a35f", "#a47b49",
    "#885533", "#a07b62", "#b4a394", "#dad0c8", "#ffffff",
  ],
} as const satisfies Record<string, ClassedPalette | readonly Hex[]>;

/**
 * 既定にしない配色。値の大小を読ませる図には使わない（docs/DESIGN-SYSTEM.md §3）。
 */
export const optional = {
  /** turbo（matplotlib。原典は Google、Apache 2.0）の17停止。虹色で、明るさが値の順に並ばない。 */
  turbo: [
    "#30123b", "#4040a2", "#466be3", "#4294ff", "#28bceb", "#18ddc2", "#32f298", "#6dfe62", "#a4fc3c",
    "#cdec34", "#eecf3a", "#fdac34", "#fb7e21", "#eb500e", "#d02f05", "#a91601", "#7a0403",
  ],
} as const satisfies Record<string, readonly Hex[]>;

/**
 * 地図の出典欄に書く文。表示が必要なものだけ。条件は THIRD_PARTY_NOTICES.md を参照。
 * 気象庁の利用規約は、出典に URL を添えることと、加工した場合にその旨を書くことを求めている。
 */
export const attribution = {
  jma: "配色の出典：気象庁ホームページ（https://www.jma.go.jp/jma/kishou/info/colorguide/HPColorGuide_202007.pdf）",
  /** `jmaRainFor("dark")` を使った地図に、`jma` とあわせて書く。 */
  jmaRainDarkEdit: "1 mm/h 未満の階級は表示していない（加工して作成）",
  hypsometric: "配色：GeoPalettes（Dominic Royé、CC BY 4.0）",
} as const;

/**
 * 気象庁の降水の配色を、背景に合わせて返す。
 * 暗い背景では最初の階級（1 mm/h 未満。ほぼ白）を除く。この階級は暗い地の上で最も目立ってしまう。
 * 返り値の `edges[0]` 未満の値は、暗い背景では描かないこと（`drawFrom` がその下限）。
 */
export function jmaRainFor(theme: Theme): ClassedPalette & { readonly drawFrom: number } {
  const { unit, edges, colors } = convention.jmaRain;
  if (theme === "light") return { unit, edges, colors, drawFrom: 0 };
  return { unit, edges: edges.slice(1), colors: colors.slice(1), drawFrom: edges[0] };
}

/**
 * 値が入る階級の番号（0 始まり）。境界ちょうどの値は上の階級に入る。
 *
 * @example
 * classIndex(12, convention.jmaRain.edges); // 3（10〜20）
 */
export function classIndex(value: number, edges: readonly number[]): number {
  if (!Number.isFinite(value)) throw new RangeError("value must be finite");
  let index = 0;
  for (const edge of edges) {
    if (value < edge) break;
    index++;
  }
  return index;
}

/**
 * MapLibre の step 式に渡す引数。凡例も同じ配色から作る。
 *
 * @example
 * const rain = jmaRainFor(theme);
 * const fillColor = ["step", ["get", "mm_per_h"], ...stepArgs(rain)];
 */
export function stepArgs(palette: Pick<ClassedPalette, "edges" | "colors">): Array<number | Hex> {
  const { edges, colors } = palette;
  if (colors.length !== edges.length + 1) {
    throw new RangeError("colors must have exactly one more entry than edges");
  }
  if (edges.some((edge, i) => i > 0 && edge <= edges[i - 1])) {
    throw new RangeError("edges must be strictly increasing");
  }
  const args: Array<number | Hex> = [colors[0]];
  edges.forEach((edge, i) => args.push(edge, colors[i + 1]));
  return args;
}

/**
 * 色の並びを [min, max] に等間隔で割り当てる。
 * 地図の interpolate 式と凡例の両方を、この結果から作る。
 *
 * @example
 * const stops = colorStops(sequential.dark, 0, 80);
 * const fillColor = ["interpolate", ["linear"], ["get", "count"], ...stops.flat()];
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
