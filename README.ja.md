# EaaSE

**EaaSE - Excel as a Search Engine**

言語:
- [English](./README.md)
- [中文](./README.zh-CN.md)
- [日本語](./README.ja.md)

EaaSE は、ローカル専用かつ読み取り専用で動作する Excel 検索ツールです。複数ファイル、複数シート、横に広い表の検索と確認に向いています。

使い方の考え方は非常に単純です:
1. Import
2. Choose Excel

このプロジェクトの役割分担:
- Codex が実装とエンジニアリング変更を担当
- Gemini がレビューと計画を担当

## バージョンの進化
### V1.0.0
- `EaaSE - Excel as a Search Engine` の初期ソース公開基準を確立しました。
- ローカル Excel に対する厳密な部分一致検索を中核機能として提供しました。
- `.xls`、`.xlsx`、`.xlsm`、`.csv` に対応しました。
- 同時に扱えるキャッシュ済みファイル数は最大 20 件でした。
- 検索結果を `file -> sheet` 単位で表示しました。
- 中国語、英語、日本語の UI 切り替えに対応しました。

### V1.1.0
- 純粋な Web ツールから、ローカル API とフロントエンドを組み合わせたハイブリッド構成へ移行を開始しました。
- 絶対パス、格納フォルダーを開く機能、設定のインポート/エクスポートなど、ローカル連携機能を導入しました。
- V1.0.0 のファイル数制約を超える方向へ拡張を始めました。
- `EaaSE.exe` を入口とするデスクトップウィンドウ配布方針を確立しました。
- Windows 主配布物、Windows 軽量版、Linux 配布物の現在のパッケージング経路を整備しました。

### V2.0.0
- アクティブな作業領域の容量を最大 1000 ファイル同時保持まで拡張しました。
- データ保存はブラウザ依存ではなくなり、`config/cache.db` と `config/*.json` を使うローカルランタイム永続化へ移行しました。
- `.eaase.json` のプロジェクトアーカイブ入出力を追加し、作業シナリオの切り替え、保存、移行を容易にしました。
- 現在のデスクトップ起動フロー `EaaSE.exe -> local Node.js service -> WebView2 desktop window -> React UI` を安定化しました。
- フォルダー取り込み、ファイル絞り込み、標準/拡張レイアウト切り替え、全列/ラベル列のみ切り替え、ヒット Sheet へのクイックジャンプ、トップへ戻る操作を追加しました。
- 検索を Web Worker で実行し、結果描画を仮想リスト化して、大規模データへの耐性を高めました。

## 現在の機能
- `.xls`、`.xlsx`、`.xlsm`、`.csv` に対応
- 単一ファイルとフォルダー単位の取り込みに対応
- 最大 1000 ファイルを同時保持
- `String.includes()` による厳密な部分一致検索
- 結果を `file -> sheet` 単位で表示
- 多段ヘッダー、結合セル、Excel 列記号、ラベル列フィルターに対応
- セルコピー、行コピー、キーワード強調、ヒット Sheet へのクイックジャンプに対応
- `zh-CN / en-US / ja-JP` の UI 切り替えに対応
- 実行ログを `config/startup.log`、`config/server.log`、`config/runtime-metrics.log` に保存

## データ保存方式
- 起動時に既定キャッシュを自動復元し、すぐに作業を再開できます。
- ワークブック構造、Sheet 行データ、検索用キャッシュは `config/cache.db` に保存されます。
- プロジェクトアーカイブと UI 設定は `config/*.json` に保存されます。
- 手動で入出力するプロジェクトアーカイブは `.eaase.json` 形式です。
- アプリは読み取り専用であり、元の Excel ファイルは変更しません。

## UI とワークフローの更新
- フォルダー取り込みによる一括ワークブック追加
- 実際のローカルパスに基づく格納フォルダーを開く操作
- 読み込み済みファイル一覧の絞り込み
- 標準/拡張の 2 種類のレイアウト
- 全列/ラベル列のみの表示切り替え
- ヒット Sheet へのクイックジャンプとトップへ戻る操作
- Web Worker 検索実行と仮想化結果リスト

## 開発
```bash
npm install
npm run dev
```

`npm run dev` はローカル API サービスと Vite 開発サーバーを同時に起動します。

## クイック Web テスト
```bash
npm run quickstart
```

このモードではフロントエンドのみを起動します。ローカル API が使えない場合、ファイル取り込みはブラウザのファイル選択にフォールバックし、ローカルパス関連の操作は利用できません。

## ビルドとパッケージ
```bash
npm run build
npm run preview
npm run package:github-release
```

最終リリースコマンドは次を生成します:
- `github/source/`
- `github/Excel Strict Searcher-2.0.0-windows-setup.zip`
- `github/Excel Strict Searcher-2.0.0-windows-lightweight.zip`
- `github/Excel Strict Searcher-2.0.0-linux.zip`

補足:
- `windows-setup.zip` が現在の主 Windows デスクトップ配布物です
- `windows-lightweight.zip` は互換性確認用としてのみ維持します
- Linux 版は圧縮ランタイムバンドルとして配布します
- 最終的な `github/` には `source/` と 3 つの zip だけを残します

## リポジトリ構成
- `src/`: React UI、hooks、Worker、スタイル、フロントエンドロジック
- `scripts/`: ローカルランタイムとパッケージスクリプト
- `config/`: ローカル実行時に生成されるキャッシュ、アーカイブ、ログ
- `README.md`: 英語版
- `README.zh-CN.md`: 中国語版
- `README.ja.md`: 日本語版
- `package.json`: 依存関係とスクリプト定義

## GitHub 同期ルール
- GitHub へはソースコード指向の内容のみ同期します。
- ローカル実行成果物、`node_modules`、`dist`、一時パッケージングフォルダー、ログ、その他の build 副産物は同期しません。
- `agentlogic.md` のような内部協調用ドキュメントは公開ソース同期に含めません。
