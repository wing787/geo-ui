# 第三者の著作物

このリポジトリ自体は MIT ライセンス（[LICENSE](LICENSE)）。
`src/palettes.ts` と `tokens.css` の `--data-*` には、第三者が作った配色の値が含まれる。
それぞれの出典と条件を下にまとめる。MIT ライセンスが及ぶのは、このリポジトリで書いた部分だけである。

「確認」の列は、2026-11-16 に配布元の記載を実際に読んだかどうか。

| 配色 | `palettes` の名前 | 作者・出典 | 条件 | 確認 |
|---|---|---|---|---|
| 気象庁の降水・気温・平年比 | `convention.jma*` | 気象庁 | 公共データ利用規約（第1.0版）。出典の記載が必要 | 読んだ |
| Hypsometric Tint | `convention.hypsometric` | GeoPalettes（Dominic Royé） | CC BY 4.0。表示が必要 | README を読んだ。リポジトリに LICENSE ファイルは無い |
| RdYlBu | `diverging` | ColorBrewer（Cynthia Brewer, Mark Harrower, The Pennsylvania State University） | Apache License 2.0 | 読んだ |
| grayC | `image.grayC` | Scientific colour maps（Fabio Crameri） | MIT | 読んだ |
| viridis | `sequential` | Nathaniel J. Smith, Stéfan van der Walt, Eric Firing（matplotlib） | CC0。条件なし | 読んだ |
| turbo | `optional.turbo` | Google LLC（作者 Anton Mikhailov）。値は matplotlib から取った | Apache License 2.0 | 原典の冒頭を読んだ。matplotlib 側には記載が無い |
| カテゴリ色 | `categorical` | Okabe-Ito（岡部正隆、伊藤啓）、Paul Tol | 配布元に利用条件の記載が無い | 読んだ。Okabe-Ito の値は照合できていない |

## 気象庁

- 降水の配色は、降水ナウキャストの凡例から取った。
  https://www.jma.go.jp/bosai/nowc/images/legend_jp_normal_hrpns.svg
- 気温と平年比の配色は、「気象庁ホームページにおける気象情報の配色に関する設定指針」
  （平成24年5月、令和2年7月一部改訂）の表3-1、表3-2から取った。
  https://www.jma.go.jp/jma/kishou/info/colorguide/HPColorGuide_202007.pdf
- 利用条件: https://www.jma.go.jp/jma/kishou/info/coment.html
  出典の記載例は「出典：気象庁ホームページ（当該ページのURL）」。
  編集・加工して使う場合は、その旨を別に記載する。加工したものを気象庁が作成したかのように見せてはならない。
- このリポジトリで加えた加工: 色の値を16進数に直した。平年比は並びを「低い・少ない → 高い・多い」の順にした。
  暗い背景では、降水の 1 mm/h 未満の階級を描かない（`jmaRainFor("dark")`）。

## GeoPalettes

Hypsometric Tint は、Dominic Royé による GeoPalettes（https://dominicroye.github.io/color-for-geoscience/ ）の配色。
CC BY 4.0（https://creativecommons.org/licenses/by/4.0/ ）。色の値は変更していない（16進数を小文字にした）。

## ColorBrewer

RdYlBu の11階級は ColorBrewer（https://colorbrewer2.org/ ）の配色。並びを逆にしてある（青 → 赤）。

    Copyright (c) 2002 Cynthia Brewer, Mark Harrower, and The Pennsylvania State University.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

## Scientific colour maps

grayC は Fabio Crameri の Scientific colour maps の配色。値は Python のパッケージ cmcrameri から等間隔に9色を取った。
引用が推奨されている: Crameri, F. (2018). Scientific colour maps. Zenodo. https://doi.org/10.5281/zenodo.1243862

    MIT License

    Colormaps in cmcrameri/cm/cmaps:
    Copyright (c) 2020 Fabio Crameri

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.

## viridis

viridis は Nathaniel J. Smith、Stéfan van der Walt、Eric Firing が matplotlib のために作った配色。
配布元（https://github.com/BIDS/colormap/blob/master/colormaps.py ）の冒頭に、CC0（パブリックドメインへの提供）で公開する、
法的な制限は課さないが、使うときはクレジットしてもらえるとありがたい、と書かれている。
値は matplotlib の256色から等間隔に9色を取った。

## turbo

turbo は Google の Anton Mikhailov による配色。原典（https://gist.github.com/mikhailov-work/ee72ba4191942acecc03fe6da94fc73f ）の冒頭の表示は次のとおり。

    Copyright 2019 Google LLC.
    SPDX-License-Identifier: Apache-2.0
    Author: Anton Mikhailov

Apache License 2.0 の全文: http://www.apache.org/licenses/LICENSE-2.0

このリポジトリで加えた変更: 値は matplotlib の256色から等間隔に17色を取り、16進数に直した。
matplotlib の該当ファイルには、turbo の作者やライセンスの記載が見当たらなかった（冒頭は自分で読み、残りは要約で確認した）。

## カテゴリ色

- Okabe-Ito: 岡部正隆、伊藤啓「Color Universal Design (CUD) - How to make figures and presentations that are friendly to Colorblind people」
  （https://jfly.uni-koeln.de/color/ ）の配色。このページには、配色そのものの利用条件は書かれていない
  （配布資料について、授業やセミナーで自由に使ってよい、出典として両氏の名前を挙げてほしい、とある）。
  ページでは配色が画像で示されていて、色の値を文字で照合できなかった。`categorical` の値は、広く流通している値である。
- Paul Tol: 「Colour schemes」（https://sronpersonalpages.nl/~pault/ ）の muted から #332288 と #882255 を取った。値はページの記載と一致した。
  配色の利用条件は、ページに書かれていない。

どちらも数個の色の値で、作者が広く使われることを意図して公開しているものだが、明示の許諾ではない。出典としてここに名前を挙げている。

## 参考にした文書

仕様（docs/DESIGN-SYSTEM.md）は、デジタル庁デザインシステムβ版と Modern Web Guidance（Google Chrome、Apache License 2.0）の
ルールを参考にしている。文章やコードは写していない。詳細は仕様の「参考にしたもの」。
