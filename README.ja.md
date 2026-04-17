<div align="center">

# EaaSE

**ローカルの Excel ワークブックを、リモートサービスに送らずに使えるデスクトップ検索エンジンへ変えるツール**

[English](./README.md) | [简体中文](./README.zh-CN.md) | [日本語](./README.ja.md)

</div>

<div align="center">

![Version](https://img.shields.io/badge/version-2.1.0-111111?style=for-the-badge)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-0f766e?style=for-the-badge)
![UI](https://img.shields.io/badge/ui-zh%20%7C%20en%20%7C%20ja-b91c1c?style=for-the-badge)
![Runtime](https://img.shields.io/badge/runtime-local--first-7c3aed?style=for-the-badge)
![Search](https://img.shields.io/badge/search-strict%20substring-1d4ed8?style=for-the-badge)

</div>

## 製品概要

EaaSE は、数多くの Excel ワークブックをローカル環境で安全かつ繰り返し検索したい場面のためのツールです。Excel データを外部サービスやデータベース基盤へ移すのではなく、検索・キャッシュ・設定・デスクトップ体験をできるだけ手元に残すことを重視しています。

現在の `2.1.0` ベースラインでは、次の点を重視しています。

- `.xls`、`.xlsx`、`.xlsm`、`.csv` を対象にしたローカル優先検索
- ブラウザだけに依存しないデスクトップ寄りの実行フロー
- アーカイブ取り込みやブック削除後のキャッシュ整合性
- 最大 1000 ファイルを同時に扱える作業領域

## ✨ 何を解決するのか？

- **Excel ファイルが多すぎて手作業検索が遅い**: 複数のブックを 1 つの検索ワークスペースにまとめて扱えます。
- **デスクトップでの照合作業が非効率**: 検索・キャッシュ・設定をローカルに保持し、反復的な検索作業に向いた構成です。
- **横に広い表が見づらい**: `file -> sheet` 単位の結果整理、ラベル列フィルタ、多段ヘッダー、レイアウト切替に対応します。
- **検索のためだけに別の DB 化をしたくない**: Excel をそのまま取り込み、元ファイルは変更しません。

## クイックスタート

### 方法 1: GitHub Releases の配布資産を使う

1. Releases ページを開きます:
   `https://github.com/UIhoshi/EaaSE-ExcelasaSearchEngine/releases`
2. 使用するプラットフォームや配布形式に合うパッケージをダウンロードします。
3. アプリケーションを起動し、1 つ以上の Excel ファイルまたはフォルダ全体を取り込みます。
4. 同じワークスペース内で複数ファイル・複数 Sheet を横断検索します。

### 方法 2: ソースコードからローカル実行フローを起動する

1. 依存関係をインストールします:

```bash
npm install
```

2. ローカル実行フローを起動します:

```bash
npm run dev
```

3. 1 つ以上の Excel ファイル、またはフォルダ全体を取り込みます。
4. 同じワークスペース内で複数ファイル・複数 Sheet を横断検索します。

### 方法 3: Web フォールバックモードを使う

```bash
npm run quickstart
```

quickstart モードでは:

- ファイル取込はブラウザ選択に回退します
- 検索は Web Worker に回退します
- ローカルパス系の操作は利用できません

> 重要:
> EaaSE はローカル専用の読み取りツールであり、元の Excel ファイルを変更しません。

## 一目で分かる要約

<div align="center">

| 項目 | 内容 |
|------|------|
| バージョン | `2.1.0` |
| 実行形態 | ローカル Node.js サービス + React UI + デスクトップシェル |
| ファイル規模 | 最大 1000 ファイル同時保持 |
| 対応形式 | `.xls`、`.xlsx`、`.xlsm`、`.csv` |
| 永続化 | `config/cache.db` と `config/*.json` |
| アーカイブ形式 | `.eaase.json` |
| UI 言語 | 中国語、英語、日本語 |
| 文書入口 | `AGENTS.md`、`PROJECT_FACT_MAP.md`、`AgentLogic/` |

</div>

## ✨ 主な機能

- 複数の Excel ワークブックと複数 Sheet を 1 つの作業領域で検索
- 結果を `file -> sheet` 単位で整理して表示
- フォルダ取込、ファイル絞り込み、ラベル列フィルタ、レイアウト切替に対応
- `config/cache.db` と `config/*.json` によるローカル実行状態の保持
- `.eaase.json` アーカイブの入出力
- ローカル API が使えない場合は Web Worker へフォールバック

## ドキュメントとロジック入口

保守や拡張を行う前に、まず次を確認してください。

- `AGENTS.md`
- `PROJECT_FACT_MAP.md`
- `AgentLogic/00_README.md`
- `AgentLogic/AgentLogic_V6.md`

リポジトリ確認コマンド:

```bash
npm run check:logic
npm run check:docs
```

現在の役割分担:

- Codex が実装を担当
- Gemini がレビューと計画を担当

## 技術実装

**技術スタック**

- React
- TypeScript
- Vite
- ローカル Node.js 実行サービス
- `xlsx` による Excel 処理

**アーキテクチャ上のポイント**

- リモートサービスではなくローカル優先のデスクトップワークフロー
- ローカル API キャッシュを優先した検索経路
- ブラウザ簡易モードでの Web Worker フォールバック
- 大量検索結果向けの仮想化レンダリング
- 元の Excel ファイルは読み取り専用で扱う

**リポジトリ構成**

| パス | 用途 |
|------|------|
| `src/` | React UI、hooks、worker、スタイル、フロントエンドロジック |
| `scripts/` | ローカル実行サービスとパッケージング用スクリプト |
| `config/` | ローカル実行時に生成されるキャッシュ、アーカイブ、ログ |
| `AgentLogic/` | リポジトリのロジック入口と協業ルール |
| `README.zh-CN.md` / `README.ja.md` | 多言語 README ページ |

## 開発

```bash
npm install
npm run dev
npm run build
npm run verify
```

GitHub リリース向けパッケージ生成:

```bash
npm run package:github-release
```

## 既知の制約

- 現在のリポジトリには README 用のスクリーンショットや GIF 資産がありません。
- quickstart のブラウザモードはフォールバック経路であり、完全なローカル実行体験ではありません。
- ローカルパス関連の操作はローカル実行サービスに依存します。

## リリースメモ

`2.1.0` の主な焦点:

- `.eaase.json` 取込後のキャッシュ整理強化
- ブック削除後のキャッシュ整理
- SQLite の物理圧縮回収
- ポータブル版とインストーラ版を含む正式リリース整備

正式な配布資産は Releases ページから取得してください。

- `https://github.com/UIhoshi/EaaSE-ExcelasaSearchEngine/releases`

## バージョンの流れ

- `v2.1.0`: キャッシュ整理を強化し、SQLite の物理圧縮回収を追加し、正式リリース出力を安定化しました。
- `v2.0.0`: 1000 ファイル規模の作業領域に拡張し、ローカル永続化と `.eaase.json` プロジェクトアーカイブを導入しました。
- `v1.1.0`: ローカル API とデスクトップ寄りの実行フローへ移行を始めました。
- `v1.0.0`: 厳格な Excel 検索の最初の基線と、多言語 README の初期構成を確立しました。

## コントリビューション / サポート

- 検索モデル、キャッシュ処理、ワークスペース挙動に問題があれば Issue を作成してください。
- PR を送る前に、まずプロジェクト文書とロジック入口を確認してください。

## License

このリポジトリには現在、個別のライセンスファイルはまだ含まれていません。
