# geo-ui

ポートフォリオサイトと地理空間アプリが共有するデザインシステム。
パッケージ名は `@wing787/geo-ui`。npm には同名の無関係なパッケージ `geo-ui` があるため、スコープなしの名前ではインストールしない。

現在配布しているのは、トークン（CSS カスタムプロパティ）とデータの配色（TypeScript）。React コンポーネントは未実装。

見た目の方向は「図葉」。地図を枠で囲んで目盛を外に出し、UI は無彩色にして、色はすべてデータに使う
（[docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) §0）。

## 使い方

git 依存としてインストールする（npm には公開しない）。`#main` ではなくタグを指定する。

```sh
npm install github:wing787/geo-ui#v0.3.1
```

ロックファイルをコミットし、CI では `npm ci` を使う（解決されたコミットが固定される）。
更新するときはタグを新しいものに書き換える。

```css
@import "@wing787/geo-ui/tokens.css"; /* 変数の定義のみ */
@import "@wing787/geo-ui/base.css";   /* 任意。body の既定スタイル */
```

アプリ側はセマンティック層の変数だけを参照する。

```css
.card {
  background: var(--surface);
  color: var(--text-primary);
  border: var(--border-width) solid var(--border);
}
```

差し色（`--accent`）は無い。強調はインク（`--text-primary`）の塗りで行う。

```css
.button[aria-pressed="true"] {
  background: var(--text-primary);
  color: var(--page);
}
```

dark にするには、ルートまたは地図コンテナに `data-theme="dark"` を付ける。
対応ブラウザは Chrome 123 / Firefox 120 / Safari 17.5 以降（`light-dark()` を使うため）。

### 地図レイヤの色

MapLibre のレイヤは CSS 変数を読めないので、色は `palettes` から渡す。凡例も同じ配列から作る。
どのデータにどの配色を使うかは、[docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) §3 の対応表で決まっている。

```ts
import { colorStops, jmaRainFor, sequential, stepArgs } from "@wing787/geo-ui/palettes";

// 階級のある配色（降水は気象庁の配色）。暗い背景では 1 mm/h 未満の階級を描かない
const rain = jmaRainFor(theme);
map.addLayer({
  id: "rain",
  type: "fill",
  source: "rain",
  filter: [">=", ["get", "mm_per_h"], rain.drawFrom],
  paint: { "fill-color": ["step", ["get", "mm_per_h"], ...stepArgs(rain)] },
});

// 連続の配色（件数・密度）。小さい値が背景に近い側になる
const stops = colorStops(sequential[theme], 0, 70);
const fillColor = ["interpolate", ["linear"], ["get", "count"], ...stops.flat()];
```

| 名前 | 中身 |
|---|---|
| `sequential` | 件数・密度（viridis） |
| `diverging` | 一般の増減（RdYlBu、11階級） |
| `categorical` | 種別（5色まで） |
| `image.grayC` | SAR などの強度画像 |
| `convention` | 慣例の配色。気象庁の降水・気温・平年比、標高の段彩 |
| `optional.turbo` | 既定にしない配色。値の大小を読ませる図には使わない |

気象庁の配色と標高の段彩を使う地図には、出典を表示する（`attribution` に文がある）。
配色ごとの出典と条件は [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) にまとめてある。

`palettes` は TypeScript のソースのまま配布している。Vite はそのまま読める。
Next.js は `next.config` の `transpilePackages` に `@wing787/geo-ui` を足す。

### フォント

フォントは同梱していない。各アプリで Fontsource のパッケージ（IBM Plex Sans / Sans Condensed / Sans JP）を入れて自前で配信する
（[docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) §4）。

## 開発

```sh
npm run check   # コントラスト基準と、tokens.css / palettes.ts の一致を検証
npm test        # palettes のテスト
npm run preview # 見た目の確認用ページ preview.html を生成（ブラウザで開く。コミットしない）
```

依存パッケージは無い。Node.js 22.6 以降が要る（TypeScript を直接実行するため）。

## 文書

- [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) — 見た目の仕様の正本
- [docs/adr/](docs/adr/) — 設計判断の記録（配布方式、見た目の方向、配色の決め方など）
- [CLAUDE.md](CLAUDE.md) — このリポジトリを変更するときのルール

## ライセンス

MIT（[LICENSE](LICENSE)）。取り込んだ配色にはそれぞれの条件がある（[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)）。
