# EaaSE

**EaaSE — Excel as a Search Engine**

言語:
- [English](./README.md)
- [中文](./README.zh-CN.md)
- [日本語](./README.ja.md)

**EaaSE = Excel as a Search Engine**

この名前は、そのまま製品の目的を表しています。Excel を検索できる検索エンジンに変える、という意味です。

たった 2 つの手順で、Excel を検索できる検索エンジンに変えられます。
1. 取り込む
2. Excel を選ぶ

これはローカル実行・読み取り専用の Excel 厳密検索ツールで、複数ファイル・複数シート・横に広い表の検索に向いています。

このプロジェクトの協力体制は、Codex が実装を担当し、Gemini が review と planning を担当する形です。

## 主な機能
- `.xls`、`.xlsx`、`.xlsm`、`.csv` に対応
- 最大 20 ファイルを同時にキャッシュして検索
- 厳密な `String.includes()` マッチングを使用
- 結果を `ファイル -> シート` ごとに表示
- 複数行ヘッダー、ラベル列絞り込み、キーワード強調に対応
- セルコピー、行コピー、一致シートへのジャンプに対応
- UI は中国語・英語・日本語の切り替えに対応

## 配布形式
- Windows インストーラー版：一般的なデスクトップ利用向け
- Windows 軽量版：ダウンロード容量を抑えたい利用者向け
- Linux 版：圧縮配布パッケージとして提供
- ソース版：開発、保守、GitHub 同期用

## リポジトリ構成
- `src/`: フロントエンド画面とロジック
- `scripts/`: ローカル実行と軽量版パッケージ用スクリプト
- `README.md`: 英語説明
- `README.zh-CN.md`: 中国語説明
- `README.ja.md`: 日本語説明
- `package.json`: 依存関係とスクリプト入口

## クイックスタート
```bash
npm install
npm run dev
```

## ビルド
```bash
npm run build
```
