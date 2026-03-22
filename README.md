# Excel Strict Searcher

## 中文
只需要两个步骤，就可以把您的 Excel 变成一个可以搜索的搜索引擎：
1. 导入
2. 选择 Excel

这是一个本地运行、只读处理的 Excel 严格搜索工具，适合多文件、多 Sheet、宽表检索场景。

### 用途
- 将本地 Excel 文件快速整理为可搜索的查询界面
- 用严格子串匹配方式定位内容
- 在不修改原文件的前提下完成检索和查看

### 当前能力
- 支持导入 `.xls`、`.xlsx`、`.xlsm`、`.csv`
- 最多同时缓存并检索 20 个文件
- 使用严格 `String.includes()` 匹配
- IndexedDB 本地缓存，刷新后可恢复
- 结果按 `文件 -> Sheet` 分组展示
- 支持多层表头、标签列筛选、关键词高亮、单元格复制
- 支持中文、English、日本語三种界面语言切换

### 开发
```bash
npm install
npm run dev
```

### 构建
```bash
npm run build
```

## English
With only two steps, you can turn your Excel files into a searchable search engine:
1. Import
2. Choose Excel

This is a local, read-only Excel strict-search tool designed for multi-file, multi-sheet, and wide-table lookup workflows.

### Use Cases
- Turn local Excel files into a searchable query interface
- Find content through strict substring matching
- Search and review data without modifying the original files

### Current Capabilities
- Imports `.xls`, `.xlsx`, `.xlsm`, and `.csv`
- Searches up to 20 cached files at the same time
- Uses strict `String.includes()` matching
- Restores cache from IndexedDB after refresh
- Groups results by `file -> sheet`
- Supports multi-row headers, label-column filters, highlighting, and copy actions
- Supports UI switching between Chinese, English, and Japanese

### Development
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```

## 日本語
たった 2 つの手順で、Excel を検索できる検索エンジンに変えられます。
1. 取り込む
2. Excel を選ぶ

これはローカル実行・読み取り専用の Excel 厳密検索ツールで、複数ファイル・複数シート・横に広い表の検索に向いています。

### 用途
- ローカルの Excel ファイルを検索しやすい画面に変える
- 厳密な部分一致で内容を素早く特定する
- 元ファイルを変更せずに検索と確認を行う

### 現在の機能
- `.xls`、`.xlsx`、`.xlsm`、`.csv` に対応
- 最大 20 ファイルを同時にキャッシュして検索
- 厳密な `String.includes()` マッチングを使用
- IndexedDB のローカルキャッシュをリロード後に復元
- 結果を `ファイル -> シート` ごとに表示
- 複数行ヘッダー、ラベル列絞り込み、ハイライト、コピー操作に対応
- UI は中国語・英語・日本語の切り替えに対応

### 開発
```bash
npm install
npm run dev
```

### ビルド
```bash
npm run build
```
