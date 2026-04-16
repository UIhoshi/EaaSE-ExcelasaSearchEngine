<div align="center">

# EaaSE

### Excel as a Search Engine

ローカルの Excel ワークブックを、検索しやすく、位置も追えて、デスクトップで使いやすい検索エンジンに変えるためのツールです。

[![Version](https://img.shields.io/badge/version-2.1.0-111111?style=for-the-badge)](./package.json)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-0f766e?style=for-the-badge)
![UI](https://img.shields.io/badge/ui-zh%20%7C%20en%20%7C%20ja-b91c1c?style=for-the-badge)
![Search](https://img.shields.io/badge/search-strict%20substring-1d4ed8?style=for-the-badge)
![Runtime](https://img.shields.io/badge/runtime-local--first-7c3aed?style=for-the-badge)
![Built With](https://img.shields.io/badge/built%20with-Codex%20%2B%20Gemini-f59e0b?style=for-the-badge)

[English](./README.md) | [中文](./README.zh-CN.md) | [日本語](./README.ja.md)

</div>

> 操作は 2 つだけです。
>
> 1. Import
> 2. Choose Excel

## プロジェクト概要

EaaSE は、ローカル専用かつ読み取り専用で動作する Excel 検索ツールです。複数ファイル、複数シート、横に広い表の検索と確認に向いています。Excel を外部サービスへ送るのではなく、検索、キャッシュ、設定、デスクトップ体験をできるだけ手元に残す方針です。

## リポジトリ範囲

この公開リポジトリは、EaaSE のソースコード、パッケージングスクリプト、ユーザー向けのリリース資産を中心に保ちます。

内部ロジックパッケージ、ローカル専用のルール文書、ランタイムキャッシュ、その他のローカル副産物は公開同期と release ソースパッケージから除外します。

このプロジェクトの役割分担:
- Codex が実装とエンジニアリング変更を担当
- Gemini がレビューと計画を担当

この名前と分担は公開資料でも明示的に残す:
- Codex は実装とエンジニアリングの担当
- Gemini は計画とレビューの担当

## クイック概要

| 項目 | 内容 |
| --- | --- |
| ファイル規模 | 最大 1000 ファイル同時保持 |
| 対応形式 | `.xls`、`.xlsx`、`.xlsm`、`.csv` |
| 検索方式 | `String.includes()` による厳密な部分一致 |
| 実行形態 | ローカル Node.js サービス + React UI + Windows WebView2 デスクトップウィンドウ |
| 保存方式 | `config/cache.db` + `config/*.json` |
| アーカイブ | `.eaase.json` の入出力 |
| UI 言語 | 中国語、英語、日本語 |
| 大規模結果 | ローカル API キャッシュ検索 + Web Worker フォールバック + 仮想リスト描画 |

## バージョンの進化

### V2.1.0
- `.eaase.json` のインポート時に、現在の構成に含まれない古い workbook キャッシュが残る問題を修正しました。
- ファイル管理パネルで Excel を削除しても `cache.db` に古いデータが残る問題を修正しました。
- キャッシュ削除後に SQLite の物理圧縮回収を追加し、`cache.db` のファイルサイズも最新状態を反映しやすくしました。
- Windows の散開パッケージを維持したまま、ソース、各 zip、Linux パッケージに加えて直接実行できる Windows インストーラー exe をリリースセットに追加しました。

### V1.0.0
- 最初のローカル Excel 厳密検索の基盤を確立しました。
- ソースコード中心の公開形態と多言語 README 構成を整えました。
- 同時に扱えるキャッシュ済みファイル数は最大 20 件でした。
- `file -> sheet` 単位の基本検索体験を提供しました。

### V1.1.0
- 純粋な Web ツールから、ローカル API とフロントエンドを組み合わせた構成へ移行を開始しました。
- 絶対パス、格納フォルダーを開く機能、設定のインポート/エクスポートなど、ローカル連携機能を追加しました。
- `EaaSE.exe` を入口とするデスクトップ配布方針を確立しました。
- Windows 主配布物、Windows 軽量版、Linux 配布物の現在のパッケージ経路を整えました。

### V2.0.0
- アクティブな作業領域を最大 1000 ファイル同時保持まで拡張しました。
- データ保存を `config/cache.db` と `config/*.json` によるローカル永続化へ移行しました。
- `.eaase.json` のプロジェクトアーカイブ入出力を追加しました。
- `EaaSE.exe -> local Node.js service -> WebView2 desktop window -> React UI` のデスクトップ起動フローを安定化しました。
- フォルダー取り込み、ファイル絞り込み、標準/拡張レイアウト、全列/ラベル列のみ切り替え、ヒット Sheet へのジャンプ、トップへ戻る操作を追加しました。
- ローカルキャッシュ検索を主経路にしつつ、Web Worker フォールバックと仮想リスト描画で大規模データへの耐性を高めました。

## V2.1.0 の主な変化

| 項目 | 以前 | 現在 |
| --- | --- | --- |
| 構成インポート後の掃除 | `.eaase.json` 読み込み後に現在の構成外の古いキャッシュが残る場合があった | インポート時に `cache.db` を現在の構成集合へ差分整理 |
| ファイル削除後のキャッシュ | パネル上では削除されてもキャッシュ整理の一貫性が不足していた | パネル削除と構成インポートの両方でキャッシュ整理を統一 |
| SQLite ファイルサイズ | データ削除後も `cache.db` のサイズが変わらないように見える場合があった | 削除後に物理圧縮回収を実行 |
| Windows 配布物 | 散開パッケージが中心だった | 散開版を維持しつつ、直接実行可能な Windows インストーラー exe を追加 |

## V2.0.0 の主な変化

| 項目 | 以前 | 現在 |
| --- | --- | --- |
| ファイル容量 | V1.0.0 では 20 ファイル規模 | 最大 1000 ファイル |
| 保存方式 | ブラウザ寄りのキャッシュ | ローカル `cache.db` と `config/*.json` |
| プロジェクト移行 | 限定的 | `.eaase.json` で保存・移行可能 |
| Windows 体験 | ブラウザ優先に戻りやすい | `EaaSE.exe` のデスクトップウィンドウ中心 |
| ナビゲーション | 基本的な検索閲覧 | フォルダー取り込み、絞り込み、ジャンプ、トップ移動 |
| 大規模結果 | 小中規模向け | API キャッシュ検索 + Worker フォールバック + 仮想リスト |

## 現在の機能

- 単一ファイルとフォルダー単位の取り込みに対応
- `.xls`、`.xlsx`、`.xlsm`、`.csv` に対応
- 最大 1000 ファイルを同時保持
- 結果を `file -> sheet` 単位で表示
- 多段ヘッダー、結合セル、Excel 列記号、ラベル列フィルターに対応
- セルコピー、行コピー、キーワード強調、ヒット Sheet へのクイックジャンプに対応
- 標準/拡張レイアウト切り替え
- 全列/ラベル列のみの表示切り替え
- 実際のローカルパスに基づく格納フォルダーを開く操作
- 実行ログを `config/startup.log`、`config/server.log`、`config/runtime-metrics.log` に保存

## データ保存方式

- 起動時に既定キャッシュを自動復元し、すぐに作業を再開できます。
- ローカルランタイムモードでは、ワークブック構造、Sheet 行データ、検索用キャッシュは `config/cache.db` に保存されます。
- ローカルランタイムモードでは、プロジェクトアーカイブと UI 設定は `config/*.json` に保存され、ワークブック本体はキャッシュ DB 側へ正規化されます。
- 手動で入出力するプロジェクトアーカイブは `.eaase.json` 形式です。
- ブラウザのみのフォールバックモードでは、`config/` とローカル API が使えないため、一時的なプロジェクト状態はブラウザのローカルストレージへ退避される場合があります。
- アプリは読み取り専用であり、元の Excel ファイルは変更しません。

## 検索経路

- 主経路: ランタイムサービスが利用可能な場合、候補語とヒット結果はローカル API キャッシュから取得します。
- フォールバック経路: quickstart や API 障害時には、フロントエンドが Web Worker 検索へ切り替えます。
- 検索意味論は厳密一致を維持し、`String.includes()` の挙動を変更しません。

## 開発とテスト

```bash
npm install
npm run dev
```

`npm run dev` はローカル API サービスと Vite 開発サーバーを同時に起動します。

```bash
npm run quickstart
```

このモードではフロントエンドのみを起動します。ローカル API が使えない場合、ファイル取り込みはブラウザのファイル選択へ、検索は Web Worker へフォールバックし、ローカルパス関連の操作は利用できません。

## ビルドとリリース

```bash
npm run build
npm run preview
npm run package:github-release
```

最終リリースコマンドは次を生成します:
- `github/source/`
- `github/Excel Strict Searcher-2.1.0-windows-setup.zip`
- `github/Excel Strict Searcher-2.1.0-windows-lightweight.zip`
- `github/Excel Strict Searcher-2.1.0-linux.zip`
- `github/Excel Strict Searcher-2.1.0-windows-installer.exe`

Windows パッケージの起動挙動は意図的に分かれています:
- `windows-setup.zip`: `EaaSE.exe` + ローカル Node.js サービス + WebView2 デスクトップウィンドウ
- `windows-lightweight.zip`: 互換用パッケージ。ローカルサービス起動後にシステム既定ブラウザで UI を開く方式
- `windows-installer.exe`: ダブルクリックで開始できる Windows インストーラー版。散開版も引き続き維持します

## リポジトリ構成

- `src/`: React UI、hooks、Worker、スタイル、フロントエンドロジック
- `scripts/`: ローカルランタイムとパッケージスクリプト
- `config/`: ローカル実行時に生成されるキャッシュ、アーカイブ、ログ
- `README.md`: 英語版ランディング
- `README.zh-CN.md`: 中国語版ランディング
- `README.ja.md`: 日本語版ランディング
- `package.json`: 依存関係とスクリプト定義

## GitHub 同期ルール

- GitHub へはソースコード指向の内容のみ同期します。
- ローカル実行成果物、`node_modules`、`dist`、一時パッケージングフォルダー、ログ、その他の build 副産物は同期しません。
