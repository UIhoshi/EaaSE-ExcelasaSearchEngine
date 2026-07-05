<!--
MANDATORY LOGIC GATE
Before making changes here, read AGENTS.md and README.md first.
-->

<div align="center">

# EaaSE: Excel as a Search Engine (V2.1.0)

**[English](./README.md) | [简体中文](./README.zh-CN.md) | [日本語](./README.ja.md)**

[![Version](https://img.shields.io/badge/version-2.1.0-111111?style=flat-square)](https://github.com/UIhoshi/EaaSE-ExcelasaSearchEngine)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-0f766e?style=flat-square)](https://github.com/UIhoshi/EaaSE-ExcelasaSearchEngine)
[![UI](https://img.shields.io/badge/ui-zh%20%7C%20en%20%7C%20ja-b91c1c?style=flat-square)](https://github.com/UIhoshi/EaaSE-ExcelasaSearchEngine)
[![Runtime](https://img.shields.io/badge/runtime-local--first-7c3aed?style=flat-square)](https://github.com/UIhoshi/EaaSE-ExcelasaSearchEngine)
[![Search](https://img.shields.io/badge/search-strict%20substring-1d4ed8?style=flat-square)](https://github.com/UIhoshi/EaaSE-ExcelasaSearchEngine)

</div>

**EaaSE** は、何百ものローカル Excel ワークブックを瞬時に検索可能なインデックスデータベースに変換するために設計された、ローカル優先のデスクトップアプリケーションです。すべての処理はローカルで実行され、外部サーバーやデータベース移行も不要です。

> [!IMPORTANT]
> **書き込み不可・読み取り専用の保証**：EaaSE は元の Excel ファイルを一切変更しません。インデックスの解析とキャッシュのみを行い、Excel データを上書きすることはありません。

---

## 🎯 製品定義

| 対象シナリオ | EaaSE ソリューション |
| :--- | :--- |
| **複数ファイルの検索が非効率** | 最大 1000 件の `.xls`, `.xlsx`, `.xlsm`, `.csv` ファイルを 1 つの検索ウィンドウに集約。 |
| **複雑な表の視認性が低い** | グループ化表示、特定カラムフィルター、多行ヘッダー対応、レイアウト変更に対応。 |
| **データベース導入のコスト** | Excel フォルダを直接読み込み、EaaSE が自動的に高速 SQLite キャッシュを作成。 |
| **オフライン・デスクトップ処理** | ローカル Node.js バックエンドと React クライアントの組み合わせで、安定したローカル環境を提供。 |

---

## 🚀 クイックスタート

| 起動手段 | 手順 | 利用可能機能 |
| :--- | :--- | :--- |
| **方法 1: リリース版** | 1. [Releases ページ](https://github.com/UIhoshi/EaaSE-ExcelasaSearchEngine/releases)を開く<br>2. パッケージをダウンロード<br>3. 起動後、フォルダをドラッグ＆ドロップ | **デスクトップ完全版** (ファイルパス連動、SQLite 永続化機能) |
| **方法 2: ソースから実行** | `npm install`<br>`npm run dev`<br>`localhost:5173` を開く | **デスクトップ完全版** (開発デバッグモード) |
| **方法 3: Web フォールバック** | `npm run quickstart` | **ブラウザ限定モード** (Web Worker 検索、SQLite なし、ファイル選択制限あり) |

---

## 🧱 構造設計とディレクトリ

> [!NOTE]
> **AI メンテナンスポリシー**：本コードを修正する AI エージェントは、`AgentLogic/` 内のルールに必ず従い、`check:logic` コマンドで事前検証を行ってください。

### ディレクトリ構成

| パス | 用途 |
| :--- | :--- |
| `src/` | React フロントエンド、カスタム Hooks、Web Worker 処理ファイル群 |
| `scripts/` | ローカルで動く Node.js バックエンドサーバーコードとビルド用スクリプト |
| `config/` | ローカル SQLite データベース `cache.db`、設定及びログの保存フォルダ |
| `AgentLogic/` | AI 開発コラボレーションルール、バージョン方針、検証スクリプト |

---

## 🛠️ 開発とビルド

```bash
# 依存関係のインストール
npm install

# 開発用 Vite サーバー起動
npm run dev

# クライアントビルド
npm run build

# ローカル機能検証テスト
npm run verify

# 開発ルールとドキュメントリンクチェック
npm run check:logic
npm run check:docs

# 配布用リリースパッケージの構築
npm run package:github-release
```
