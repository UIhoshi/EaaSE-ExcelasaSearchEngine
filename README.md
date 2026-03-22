# Excel Strict Searcher

[中文](#中文) | [English](#english) | [日本語](#日本語)

---

## 中文
只需要两个步骤，就可以把您的 Excel 变成一个可以搜索的搜索引擎：
1. 导入
2. 选择 Excel

这是一个本地运行、只读处理的 Excel 严格搜索工具，适合多文件、多 Sheet、宽表检索场景。

### 产品定位
- 本地运行，不依赖远程服务
- 只读处理，不修改原始 Excel 文件
- 面向多文件、多 Sheet、宽表检索

### 适用场景
- 在大量 Excel 文件中快速定位内容
- 将表格整理成可搜索的本地检索界面
- 在不改变原文件的前提下进行查找、浏览和复制

### 功能亮点
- 支持 `.xls`、`.xlsx`、`.xlsm`、`.csv`
- 最多同时缓存并检索 20 个文件
- 使用严格 `String.includes()` 匹配
- 结果按 `文件 -> Sheet` 分组展示
- 支持多层表头、标签列筛选、关键词高亮
- 支持单元格复制、整行复制、命中 Sheet 快速跳转
- 支持中文、English、日本語三种界面语言切换

### 快速开始
```bash
npm install
npm run dev
```

### 构建
```bash
npm run build
```

### 发布说明
- Windows 安装版：适合普通桌面用户
- Windows 轻量版：适合希望减少下载体积的用户
- Linux 版：提供压缩发布包

---

## English
With only two steps, you can turn your Excel files into a searchable search engine:
1. Import
2. Choose Excel

This is a local, read-only Excel strict-search tool designed for multi-file, multi-sheet, and wide-table lookup workflows.

### Positioning
- Runs locally without relying on remote services
- Read-only processing, does not modify original Excel files
- Designed for multi-file, multi-sheet, and wide-table search

### Use Cases
- Quickly locate content across many Excel files
- Turn spreadsheets into a searchable local query interface
- Search, browse, and copy data without changing source files

### Highlights
- Supports `.xls`, `.xlsx`, `.xlsm`, and `.csv`
- Searches up to 20 cached files at the same time
- Uses strict `String.includes()` matching
- Groups results by `file -> sheet`
- Supports multi-row headers, label-column filters, and keyword highlighting
- Supports cell copy, row copy, and matched-sheet quick jump
- Supports UI switching between Chinese, English, and Japanese

### Quick Start
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```

### Release Notes
- Windows setup package: for normal desktop users
- Windows lightweight package: for users who want a smaller download
- Linux package: delivered as a compressed release bundle

---

## 日本語
たった 2 つの手順で、Excel を検索できる検索エンジンに変えられます。
1. 取り込む
2. Excel を選ぶ

これはローカル実行・読み取り専用の Excel 厳密検索ツールで、複数ファイル・複数シート・横に広い表の検索に向いています。

### 製品の位置づけ
- リモートサービスに依存せずローカルで動作
- 読み取り専用で元の Excel ファイルを変更しない
- 複数ファイル・複数シート・横に広い表の検索向け

### 利用シーン
- 大量の Excel ファイルから素早く内容を探したい場合
- 表を検索しやすいローカル検索画面に変えたい場合
- 元ファイルを変更せずに検索、閲覧、コピーしたい場合

### 主な機能
- `.xls`、`.xlsx`、`.xlsm`、`.csv` に対応
- 最大 20 ファイルを同時にキャッシュして検索
- 厳密な `String.includes()` マッチングを使用
- 結果を `ファイル -> シート` ごとに表示
- 複数行ヘッダー、ラベル列絞り込み、キーワード強調に対応
- セルコピー、行コピー、一致シートへのジャンプに対応
- UI は中国語・英語・日本語の切り替えに対応

### クイックスタート
```bash
npm install
npm run dev
```

### ビルド
```bash
npm run build
```

### リリースについて
- Windows インストーラー版：一般的なデスクトップ利用向け
- Windows 軽量版：ダウンロード容量を抑えたい利用者向け
- Linux 版：圧縮配布パッケージとして提供
