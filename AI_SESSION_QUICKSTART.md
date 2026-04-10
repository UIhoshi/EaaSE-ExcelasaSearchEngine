# EaaSE AI 会话 30 秒入口清单

本文件是当前仓库的最短执行入口。

如果你是新接入本项目的 AI，请按下面顺序处理。

若需要标准开场措辞，请再看：
- [AI_SESSION_OPENING_TEMPLATE.md](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/AI_SESSION_OPENING_TEMPLATE.md)

---

## 1. 先读什么
1. [agentlogic.md](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/agentlogic.md)
2. [AGENTLOGIC_EAASE_MAPPING.md](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/AGENTLOGIC_EAASE_MAPPING.md)

若任务偏产品方向或版本规划，再读：
3. [PLAN_ENHANCEMENT_V1.1.0.md](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/PLAN_ENHANCEMENT_V1.1.0.md)

若任务偏实现与规则，再读：
4. [REQUIREMENTS.md](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/REQUIREMENTS.md)
5. [TECHNICAL_SPEC.md](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/TECHNICAL_SPEC.md)
6. [UI_UX_SPEC.md](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/UI_UX_SPEC.md)

若任务偏打包与发布，再读：
7. [BUILD_RELEASE_REQUIREMENTS.md](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/BUILD_RELEASE_REQUIREMENTS.md)
8. [VERSION_BUMP_CHECKLIST.md](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/VERSION_BUMP_CHECKLIST.md)

---

## 2. 默认执行角色
- 小修复、明确 bug、UI 微调：默认 `L3 + Sync Gatekeeper`
- 跨模块功能：默认 `L2 + L3 + Sync Gatekeeper`
- 架构、版本规划、打包策略：默认 `L1 + L2 + Sync Gatekeeper`

只有在任务边界不明确时，才额外问用户当前角色。

---

## 3. 项目铁律
- 搜索逻辑必须保持严格 `String.includes()`
- UI 必须持续支持 `zh-CN / en-US / ja-JP`
- 语言切换必须是全局入口
- 默认缓存与手动配置统一读写软件目录 `config/`
- 手动导入配置后必须覆盖默认缓存
- 文件管理区必须保持精简树状结构
- 结果区必须保留明显的“打开所在位置”入口
- 若当前模式拿不到绝对路径，操作要显示但禁用说明
- 扩展模式优先适配窗口，再局部横向滚动

---

## 4. Windows 打包铁律
- Windows 散装版与正式安装包都遵循旧 `windows-setup.zip` 的桌面窗口逻辑
- 当前确认链路：
  - `EaaSE.exe`
  - 本地 Node.js 服务
  - WebView2 桌面窗口
  - React UI
  - 软件目录 `config/`
- 不得回退成浏览器优先体验

当前保留散包：
- [artifacts/windows-portable-exe](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/artifacts/windows-portable-exe)

最终同步目录：
- [github](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/github)
- 自动同步脚本：
  - [scripts/sync-github-release.mjs](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/scripts/sync-github-release.mjs)

`github/` 只保留：
- `source/`
- `windows-setup.zip`
- `windows-lightweight.zip`
- `linux.zip`
- 这 3 个 zip 的标准重建入口统一是：
  - `npm run package:github-release`
- 只有在单独调试某一条链路时才分别使用：
  - `npm run package:portable-exe`
  - `npm run package:portable-runtime`
- 正常情况下不要重新搜索或临时拼装三种 zip 的 build 逻辑，直接遵循 `BUILD_RELEASE_REQUIREMENTS.md`

---

## 5. 标准执行顺序
1. 读相关 md
2. 读目标源码
3. 修改代码
4. 做最小必要验证
5. 同步更新相关 md
6. 若涉及打包，再校验 `artifacts/` 和 `github/`

---

## 6. 日志默认规则
用户说“启动失败 / 没反应 / 定位失败 / 打包失败”时：
- 先主动读日志
- 再回复

常见日志：
- [artifacts/windows-portable-exe/config/startup.log](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/artifacts/windows-portable-exe/config/startup.log)
- [artifacts/windows-portable-exe/config/server.log](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/artifacts/windows-portable-exe/config/server.log)
- [artifacts/windows-portable-exe/config/runtime-metrics.log](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/artifacts/windows-portable-exe/config/runtime-metrics.log)

---

## 7. 不要做什么
- 不要直接改 [agentlogic.md](/C:/Users/XU%20RONG/Documents/workspace/excel%20search/agentlogic.md)，除非先征得用户确认
- 不要只改代码不改 md
- 不要把浏览器启动器重新当成正式 Windows 方向
- 不要让 `github/` 和 `artifacts/` 再堆满副产物
