# geo-ui

ポートフォリオサイトと地理空間アプリが共有するデザインシステム。
リポジトリ名は `geo-ui`、パッケージ名は `@wing787/ui`。

現在配布しているのはトークン（CSS カスタムプロパティ）のみ。React コンポーネントは未実装。

## 使い方

git 依存としてインストールする（npm には公開しない）。

```sh
npm install github:wing787/geo-ui#main
```

```css
@import "@wing787/ui/tokens.css"; /* 変数の定義のみ */
@import "@wing787/ui/base.css";   /* 任意。body の既定スタイル */
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

## 文書

- [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) — 見た目の仕様の正本
- [CLAUDE.md](CLAUDE.md) — このリポジトリを変更するときのルール
