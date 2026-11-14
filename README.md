# geo-ui

ポートフォリオサイトと地理空間アプリが共有するデザインシステム。
パッケージ名は `@wing787/geo-ui`。npm には同名の無関係なパッケージ `geo-ui` があるため、スコープなしの名前ではインストールしない。

現在配布しているのは、トークン（CSS カスタムプロパティ）とデータ可視化パレット（TypeScript）。React コンポーネントは未実装。

## 使い方

git 依存としてインストールする（npm には公開しない）。`#main` ではなくタグを指定する。

```sh
npm install github:wing787/geo-ui#v0.2.0
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

dark にするには、ルートまたは地図コンテナに `data-theme="dark"` を付ける。
対応ブラウザは Chrome 123 / Firefox 120 / Safari 17.5 以降（`light-dark()` を使うため）。

### 地図レイヤの色

MapLibre のレイヤは CSS 変数を読めないので、色は `palettes` から渡す。凡例も同じ `stops` から作る。

```ts
import { colorStops, sequential } from "@wing787/geo-ui/palettes";

const stops = colorStops(sequential.dark, 0, 80); // [[0, "#2c728e"], ..., [80, "#fde725"]]

map.addLayer({
  id: "rain",
  type: "fill",
  source: "rain",
  paint: {
    "fill-color": ["interpolate", ["linear"], ["get", "mm_per_h"], ...stops.flat()],
  },
});
```

`palettes` は TypeScript のソースのまま配布している。Vite はそのまま読める。
Next.js は `next.config` の `transpilePackages` に `@wing787/geo-ui` を足す。

### フォント

フォントは同梱していない。各アプリで Fontsource のパッケージを入れて自前で配信する
（[docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) §4）。

## 開発

```sh
npm run check   # コントラスト基準と、tokens.css / palettes.ts の一致を検証
npm test        # palettes のテスト
```

依存パッケージは無い。Node.js 22.6 以降が要る（TypeScript を直接実行するため）。

## 文書

- [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) — 見た目の仕様の正本
- [docs/adr/](docs/adr/) — 設計判断の記録（配布方式など）
- [CLAUDE.md](CLAUDE.md) — このリポジトリを変更するときのルール
