# geo-ui

ポートフォリオサイトと地理空間アプリが共有するデザインシステム。
パッケージ名は `@wing787/geo-ui`。npm には同名の無関係なパッケージ `geo-ui` があるため、スコープなしの名前ではインストールしない。

現在配布しているのはトークン（CSS カスタムプロパティ）のみ。React コンポーネントは未実装。

## 使い方

git 依存としてインストールする（npm には公開しない）。`#main` ではなくタグを指定する。

```sh
npm install github:wing787/geo-ui#v0.1.0
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

## 文書

- [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md) — 見た目の仕様の正本
- [docs/adr/](docs/adr/) — 設計判断の記録（配布方式など）
- [CLAUDE.md](CLAUDE.md) — このリポジトリを変更するときのルール
