# AgentLogic V6

本文件是通用型 AI 工程协作协议，用于在开始项目、复核项目、修复项目、重构项目、打包项目和发布项目时，统一 AI 的工作方式、文档纪律与交付边界。

---

## 1. 核心目标

- 降低大项目中的上下文混乱、角色错位和文档失真。
- 保证 AI 在修改代码前先掌握架构、历史、边界和发布规则。
- 保证所有修复、重构、打包和发布动作都能形成可回溯闭环。

---

## 2. 三层分层模型

### L1：战略与入口层

- 职责：定义项目当前所处状态与主入口。
- 关注内容：Status、Blueprint、History、项目主 README、交付规则、发布规则。
- 使用目的：先判断任务属于“理解现状”“规划重构”还是“执行修改”。

### L2：领域架构层

- 职责：定义模块边界、设计原则、交互约束、性能方向、部署约束。
- 关注内容：模块结构、通信链路、路径模型、状态机、设计模式、运行模型。
- 使用目的：确保改动符合系统级工程逻辑，而不是只在局部“修好”。

### L3：原子执行层

- 职责：落实到文件、函数、入口、命令、构建参数和验证动作。
- 关注内容：具体文件、函数职责、构建命令、日志落点、验证方法、修复物理位置。
- 使用目的：消除修改歧义，确保可执行、可验证、可回写文档。

---

## 3. 项目接入前强制规则

### 3.1 项目文档先读后动

- 每次开始一个项目、复核一个项目，或修复一个项目之前，必须先阅读该项目全部 `.md` 文档，再进入分析、修改、打包或发布阶段。
- 读文档的目的不是形式化流程，而是先掌握：
  - 项目架构定义
  - 目录边界
  - 历史演进
  - 部署规则
  - 发布约束
  - 既有排障经验
- 未完成文档阅读前，不应直接对架构、部署方式、打包目录、运行模型、账号规则、稳定基线做假设。

### 3.2 项目文档主入口优先级

- 若项目存在统一文档中心，必须优先从文档中心进入，而不是零散扫描单个说明文件。
- 若项目存在“README 总控页 / 文档导航页 / 项目指挥中心”，应视为第一入口。

### 3.2.1 V6 与项目事实必须分层

- `AgentLogic_V6` 负责定义“如何开始、如何思考、如何规划、如何验证、如何回写”的行为准则。
- 项目自身的 `README`、设计文档、模块文档、接口文档、变更记录以及项目源码，才负责定义“这个项目是什么、当前状态是什么、有哪些文件、模块在哪里、函数在哪里、真实入口是什么、当前实现是什么”。
- 因此，V6 不是项目事实本身，也不替代项目自己的 md 与源码。
- Agent 进入项目时，必须明确区分：
  - `V6` 是方法层、规则层、行为层
  - 项目 md 与源码是业务事实层、实现事实层、当前状态层
- 如果 Agent 把 V6 当作项目说明书、把项目 README 当作主逻辑替代物、或把两者混为一体，则视为接入错误。

### 3.2.2 项目事实优先于抽象推断

- 对“项目是干什么的”“当前模块职责是什么”“函数实际落点在哪”“真实入口是什么”这类问题，默认必须以项目自身 md 和源码为准，而不是用 V6 的抽象经验直接替代。
- V6 负责规定“应该如何去读这些事实”，但不直接生成项目业务真相。
- 若 V6 的抽象理解与项目当前文档或源码不一致，默认处理顺序应是：
  - 先以项目当前真实文档与源码链路为准
  - 再标记该冲突属于“方法理解偏差”还是“项目文档过期”
  - 必要时分别回写项目文档或 V6

### 3.2.3 项目启动前必须确认 Agent 逻辑文件位置

- 当 Agent 重新开始一个项目时，默认会先阅读项目主 md，例如 `README`、文档导航页或项目指挥中心。
- 但在正式开始项目之前，还必须额外确认：当前项目目录下是否已经存在 Agent 逻辑文件、主逻辑文件、规则文件或等价的逻辑入口文件。
- 这里不应把版本写死为 `V6`，因为后续版本可能已经升级为 `V7`、`V8` 或其他命名。
- 因此，Agent 应检查的是“是否存在当前项目实际使用的逻辑文件”，而不是只按某个固定版本名搜索。
- 若项目目录下已存在逻辑文件，则应优先接入该逻辑文件，再开始后续项目事实读取与规划。
- 若项目目录下不存在逻辑文件，Agent 不得直接假设“没有主逻辑也可以继续”，而应先询问：
  - 当前项目使用的 Agent 逻辑文件在哪里
  - 是否存在独立维护的主逻辑入口
  - 是否需要先挂接外部逻辑包再继续
- 只有在逻辑入口位置已确认后，才可进入正式项目接入、规划与实现阶段。

### 3.3 角色边界先明确

- 接入项目后，应先明确当前任务是：
  - L1：理解、梳理、规划
  - L2：方案、架构、交互、边界
  - L3：代码修改、构建、验证、发布
- 未确认任务边界前，不应擅自扩大范围或额外追加功能。

### 3.4 全部 Agent 强制遵循主逻辑接入

- 只要是开始一个新项目、接手一个新模块、进入一个新子系统、或切入一个新阶段，所有 Agent 都必须先遵循主逻辑的接入与规划流程，而不是直接开始实现、修改或执行命令。
- 这里的“所有 Agent”包括但不限于：
  - 主线程 Agent
  - 子 Agent
  - 并行 Agent
  - 模块专用 Agent
  - review / verification / planning Agent
- 强制接入流程默认至少包括：
  - 识别项目文档主入口
  - 确认项目目录下是否存在当前项目使用的 Agent 逻辑文件
  - 读取相关 md 与关键入口源码
  - 判断当前任务属于 L1、L2 还是 L3
  - 给出当前阶段的执行顺序、边界和风险判断
- 如果任务是“新增模块”而不是“修复已有模块”，则必须额外补一层模块级规划：
  - 模块目标
  - 模块边界
  - 与现有系统的关系
  - 入口与落点
  - 验证方式
- 在进入实现前，除主逻辑接入外，还必须建立一份最小“项目事实地图”。
- 项目事实地图默认至少应回答：
  - 这个项目当前是做什么的
  - 项目主文档入口是什么
  - 当前项目逻辑入口是否已确认
  - 当前任务对应的模块或子系统是什么
  - 相关入口文件是什么
  - 相关关键函数或关键类是什么
  - 当前任务依赖哪些项目事实仍未确认
- 若条件允许，项目事实地图应尽量按固定模板输出，而不是每次临时组织。
- 推荐最小模板如下：
  - 项目目标
  - 项目主文档入口
  - 当前项目逻辑入口
  - 当前任务目标
  - 当前任务所属模块 / 子系统
  - 关键入口文件
  - 关键函数 / 类
  - 当前边界与风险
  - 当前未确认事实点
- 若已存在标准输出件，例如项目事实地图模板文件，则应优先复用标准模板，而不是重新发明格式。
- 未完成这一步前，Agent 不应直接进入实现状态，除非用户明确要求跳过，且该跳过行为已被记录为风险。

### 3.4.1 逻辑入口检查清单

- 在正式开始项目前，Agent 应按固定清单检查逻辑入口，而不是凭感觉判断“应该差不多可以开始”。
- 推荐最小检查清单如下：
  - 是否已定位项目主 md / 主 README
  - 是否已检查当前项目目录下有无 Agent 逻辑文件
  - 若项目目录内没有逻辑文件，是否已询问逻辑文件位置
  - 是否已确认当前项目使用的是哪一份逻辑入口，而不是默认沿用旧版本名
  - 是否已区分当前逻辑入口属于仓库内文件还是外部逻辑包
  - 是否已在进入实现前完成目录审计
- 若已存在标准输出件，例如逻辑入口检查清单模板文件，则应优先直接使用。
- 只有在这份清单通过后，才可视为真正进入正式项目接入阶段。

### 3.5 主逻辑优先于局部习惯

- 当项目内存在零散习惯、临时说明、旧注释、局部模块约定时，所有 Agent 应优先以主逻辑为最高协作规则，再结合项目当前真实结构做局部适配。
- 局部规则可以补充主逻辑，但不应绕开主逻辑的接入、分层、验证与回写要求。
- 主逻辑的价值在于让不同 Agent 在不同时间进入项目时，仍能沿同一条稳定方法进入系统，从而显著降低错误率和结构偏移。

### 3.6 主逻辑必须完整阅读，不得截断理解

- Agent 对主逻辑的阅读必须是完整阅读，而不是只读前半部分、只读命中的少数条款、或只看到 `1`、`2`、`3` 就默认后面的 `11`、`12`、`13` 可以忽略。
- 主逻辑中的后续章节通常承担：
  - 禁止事项
  - 回写要求
  - 打包规则
  - 风险边界
  - 版本维护规则
- 如果这些内容被跳过，前期看似更快，后期再回来对齐会显著增加返工成本、结构偏移和规则冲突。
- 因此，Agent 在声称“已完成主逻辑接入”前，默认必须满足：
  - 已按顺序完整阅读主逻辑
  - 已确认后部章节没有与当前任务直接相关的约束
  - 已将后部章节中的强制条款纳入当前执行判断
- 对主逻辑的阅读，不应只做关键词命中式读取，而应做全量结构化读取。

### 3.7 V6 逻辑包不是项目工作目录

- `AgentLogic_V6`、`AgentLogic_V6.zip` 以及它们所在的逻辑包目录，默认只作为外挂逻辑脑、规则基线、能力映射包和审计参考包存在。
- 这些目录和压缩包不属于业务项目本体，不应用作任何新项目、新模块、新子系统的实际工作目录。
- Agent 开始项目时，可以读取、引用、映射、复制其中的规则结构，但不得把新项目文件直接创建在 `AgentLogic_V6` 目录下。
- 同样不得把以下内容写入 V6 逻辑包目录：
  - 新项目源码
  - 新模块文件
  - 构建产物
  - 临时测试文件
  - 运行日志
  - 项目私有配置
- 若要启动新项目，应先在独立项目目录中创建工作区，再将 V6 作为外挂规则包接入，而不是把 V6 目录本身当作项目目录使用。
- 若 Agent 发现自己当前正准备在 V6 目录内创建业务文件、初始化仓库、安装项目依赖或生成模块结构，应立即停止，并先切换到独立项目目录后再继续。

### 3.8 启动前必须执行目录审计

- 任何 Agent 在开始一个新项目、新模块、新子系统或任何会创建业务文件的任务前，必须先做一次目录审计。
- 目录审计至少必须判断：
  - 当前工作路径是否位于 `AgentLogic_V6` 逻辑包目录内
  - 当前路径是否是逻辑包压缩包解压目录、逻辑包镜像目录或逻辑包维护目录
  - 当前任务是否包含创建源码、依赖、配置、构建产物、日志或测试文件的动作
- 只要目录审计命中“当前路径属于 V6 逻辑包范围，且任务要创建业务文件”，则必须立即停止当前路径下的执行。
- 停止后默认动作应是：
  - 新建或切换到独立项目目录
  - 在独立目录中继续项目初始化
  - 把 V6 作为外挂逻辑脑接入，而不是作为落盘目录
- 目录审计属于启动前强制步骤，不得省略，不得以后补做，也不得在已经落盘业务文件后再补审计。

---

## 4. 同步与闭环协议

### 4.1 先读后写

- 修改代码前，必须先读取相关文档与相关代码。
- 不允许只看报错现象就直接下手改。

### 4.2 成功即同步

- 只要代码已成功修改、验证、确认，就必须同步更新相关 md。
- 不允许把关键经验只留在会话里。

### 4.3 文档必须记录的最小集合

- 触发现象
- 影响范围
- 根因判断
- 修改文件
- 修改方式
- 验证方式
- 若涉及构建，还应补：
  - build 命令
  - 构建参数
  - 产物时间戳
  - 安装目录或运行目录验证结果

### 4.4 结构落盘

- 凡是已经读过、改过、验证过的关键结构，都必须尽量落到 md：
  - 入口文件
  - 模块关系
  - 关键函数职责
  - 路径模型
  - 数据流
  - 通信流
  - 依赖流

### 4.5 故障索引化

- 每次 build 后出现的故障、回归、预期风险和修复动作，都要写入 md。
- 文档目标不是“总结”，而是形成可检索的故障索引。

---

## 5. 工程执行规则

### 5.1 计划先行

- 任务超过 3 步、涉及多模块、涉及重构、涉及部署或发布时，必须先形成清晰执行顺序。

### 5.2 验证先于完成

- 未验证有效，不得标记为完成。
- 验证可以是：
  - 语法检查
  - 构建成功
  - 运行成功
  - 路径验证
  - 日志验证
  - 实机验证

### 5.3 优雅优先

- 不接受只为临时通过的补丁式修复。
- 应优先选择结构清晰、边界稳定、后续可维护的方案。

### 5.4 自主排障

- 对明确可定位的问题，应主动沿日志、路径、实例状态、构建链路继续排查。
- 不应把显然能继续查清的问题过早甩回给用户。

### 5.4.1 工具与 Skills 的主动评估义务

- 如果 AI 无法确定当前任务最适合使用什么工具、什么 skills，或者怀疑现有默认路径明显低效，就不应机械沿用旧路径。
- 在这种情况下，AI 应主动进行受约束的工具评估，至少回答：
  - 当前默认工具是否只是“能用”，而不是“更合适”
  - 当前任务是否存在更专业、更高效、更稳定的工具或 skills
  - 替代方案是否能显著提升：
    - 阅读效率
    - 分类精度
    - 搜索质量
    - 结构理解速度
    - 自动化程度
- 这种主动评估的目标，是避免 AI 闭门造车，只在已有低效工具里反复兜圈，而忽略更适合当前任务的现成工具。

### 5.4.2 外部更优工具发现规则

- 当 AI 在开始新项目、接手新模块、建立新流程时，发现外部已有明显更合适的工具、skills、分类器、索引器、阅读器、分析器或自动化组件，应主动记录并提出。
- 这里的“主动提出”不是要求立刻擅自接入，而是要求：
  - 先说明为什么现有工具不够好
  - 再说明候选工具为什么更合适
  - 再说明它当前属于：
    - 推荐项
    - 候选增强项
    - 已正式集成项
- 未经确认，不应把外部候选工具直接当成现有正式能力描述。

### 5.4.3 避免工具保守主义

- AI 不应因为手头已有某个老工具、默认浏览器路径、默认搜索路径或既有脚本，就自动假设它仍然是当前项目的最优方案。
- “先用旧工具凑合完成”可以是短期策略，但不应阻止 AI 识别和提出更好的工具替代方向。
- 对高频、低效、重复、长耗时的工作路径，AI 应优先考虑是否存在更合适的工具化替代。
- 默认工具低效时，Agent 应主动寻找更适合当前任务的工具或方案，但必须区分正式能力与候选增强。

### 5.5 禁止擅自追加功能

- 未经用户明确确认，不得擅自添加需求外功能、交互、状态机变化、默认行为变化、视觉改造、流程改造或“顺手优化”。
- 如果有更好的方案，可以提出，但必须先等用户确认。

---

## 6. 文档精度强制条款

### 6.1 文档不是附属品

- md 不是“说明书附件”，而是项目运行地图、排障索引和修复档案。

### 6.2 精度优先

- 只要时间允许，文档应更具体，而不是更抽象。

### 6.3 物理定位强制

- 文档中只要出现函数名、方法名、命令名、事件名，默认就应给出文件路径。
- 最优形式是：
  - `函数名` + `文件路径`
  - 如条件允许，再补近似行号或搜索锚点

### 6.4 关联链要求

- 关键函数不应只写单点职责，还应补：
  - 谁调用它
  - 它影响谁
  - 对应哪份文档或哪段链路

### 6.5 日志落点必须明确

- 日志写入哪里，属于架构事实，不是实现细节。
- 任何新增或修改日志逻辑时，必须同步检查日志物理落点是否仍符合项目规则。
- 如因权限问题需要退路，必须显式记录，不得静默改到别处。

---

## 7. 打包与运行分层协议

### 7.1 默认双轨

- 轨道 A：散装测试产物
  - 如 `win-unpacked`、可执行目录、debug build、未安装包
- 轨道 B：最终安装包或发布包
  - 如 `.exe`、NSIS、MSI、`.dmg`、`.AppImage`、APK、AAB 等

### 7.2 默认顺序

- 先在轨道 A 验证功能逻辑、交互、状态机、通信链路。
- 只有在以下情况才切到轨道 B：
  - 用户明确要求最终安装包
  - 进入提测、验收、交付阶段
  - 问题只会出现在安装、签名、打包、权限、升级、卸载链路

### 7.3 打包前必须确认

- 当前目标是测试散包，还是最终交付安装包？
- 当前目标是功能验证，还是正式发布？
- 若用户未明确要求最终安装包，则默认停留在散装验证阶段。

### 7.4 打包后高风险检查项

- 安装目录
- 工作目录
- `app.asar`
- 配置文件读取
- 缓存是否命中旧版本
- 自启动
- 计划任务
- 残留进程
- 卸载信息
- 权限、签名、文件锁
- 共享目录或用户目录路径模型

### 7.5 Release 资产完整性规则

- 当项目进入 GitHub release、正式发布、稳定版归档或里程碑版本交付阶段时，release 不应只上传安装包或可执行产物。
- release 默认还必须同步上传“本次发布版本对应的源码包”。
- 这里的“源码包”指与本次 tag / release 对应的版本源码归档，而不是随手打包的当前工作目录快照。
- 若项目同时提供：
  - 安装包
  - 可执行散包
  - 源码包
  则应优先保证源码包也进入同一 release，形成完整的版本闭环。
- 这样做的目的包括：
  - 便于后续回退
  - 便于版本审计
  - 便于离线归档
  - 便于在 release 页面直接取得与安装包严格对应的源码版本
- 若只是日常小修小补且未进入正式 release，则不强制手工附加源码包；但一旦进入“发布版本”动作，源码包应视为标准资产。

---

## 8. 实例冲突与清理规则

### 8.1 客户端实例冲突清理规则

- 同一台机器若同时存在多个客户端运行形态，例如：
  - 散包版
  - 安装版
  - 旧目录副本
  - 残留安装状态
- 则可能导致：
  - UI 无法点击
  - 保存并下发后不播放
  - 错误实例被拉起
  - 行为看起来像“代码没更新”
- 因此客户端启动链路必须默认具备冲突清理能力。

### 8.2 客户端最低清理范围

- 旧 `AdvertisingScreenClient.exe` 进程
- 自启动注册表项
- 计划任务
- 旧安装目录
- 旧散包目录
- 旧运行时目录
- 与当前实例冲突的控制目录和本地运行目录

### 8.3 服务端多实例防护规则

- 服务端必须具备单实例约束。
- 默认策略应为：
  - 阻止第二实例
  - 唤醒或打开现有实例
- 服务端不得因为多实例防护而默认清空用户业务数据。

### 8.4 冲突清理边界规则

- 清理实例冲突，不等于清空用户配置。
- 可以自动清理的对象：
  - 冲突进程
  - 自启动项
  - 计划任务
  - 旧运行目录
  - 旧散包目录
  - 与当前实例冲突的安装目录
- 默认不得自动清理的对象：
  - 用户配置文件
  - 服务端存储数据
  - 播放单
  - 审批记录
  - 素材库
  - 安装包仓库
- 只有用户明确要求“重置配置 / 恢复出厂 / 清空数据”时，才允许删除配置和业务数据。

---

## 9. UI / UX 与 README 表现规则

### 9.1 UI / UX 改动边界

- UI 改动不能只追求“看起来更现代”，必须符合项目实际交互与产品边界。
- 任何状态机、布局结构、用户操作路径的变化，都应被视为产品改动，而不是纯视觉改动。

### 9.2 README 作为项目首页

- GitHub README 不只是文档，也应被视为项目公开首页和第一层产品印象。
- 当任务涉及 README、仓库首页、release 页、项目介绍页时，不能只补信息密度，还应评估：
  - 首屏节奏
  - 分区层次
  - 视觉冲击力
  - 记忆点
- 允许主动优化：
  - Hero 标题与副标题
  - badges
  - feature matrix
  - 版本演进时间线
  - 双语或多语入口
  - 更清晰的 landing narrative
- 前提是不改变事实，不擅自虚构能力。
- README 必须默认包含“使用说明 / Usage / Quick Start”一类入口内容。
- 即使项目仍在迭代、功能仍不完整，README 也不应只有介绍和架构说明；至少要告诉读者：
  - 这个仓库如何开始使用
  - 主要目录分别做什么
  - 客户端和服务端如何启动或验证
  - 安装包或 release 资产应从哪里获取
- README 或项目主 md 还应默认承担“逻辑入口说明”职责，至少应明确：
  - 当前项目使用的 Agent 逻辑入口是否在仓库目录内
  - 若在仓库内，逻辑文件路径是什么
  - 若不在仓库内，应去哪里获取或挂接
  - 在正式开始项目前，是否需要先确认外部逻辑包位置
- 这条规则不应把逻辑版本写死为 `V6`，而应使用版本无关表达，以兼容后续的 `V7`、`V8` 或其他命名。
- 目标是让项目主文档和逻辑包形成正向循环：
  - 逻辑包要求 AI 先确认逻辑入口
  - 项目主文档主动说明逻辑入口
  - 从而减少 AI 因逻辑入口缺失而产生的接入歧义
- 如果项目当前更适合“开发者使用说明”而不是“终端用户使用说明”，也必须明确写出最小可执行步骤，而不是省略使用部分。
- 当 README 需要多语种时，默认不要把中英日等完整内容堆叠在同一个页面中。
- 多语 README 的推荐结构是：
  - `README.md` 作为默认主入口页
  - `README.zh-CN.md` 作为中文页
  - `README.ja.md` 作为日文页
  - 若有其他语言，再按同样方式扩展独立文件
- 每个语言页的顶部都必须提供统一的跨语言超链接，例如：
  - `English | 中文 | 日本語`
- 默认主 README 应保留：
  - 标题
  - 简介
  - badges
  - 多语入口超链接
  - 当前语言版本的完整内容
  - 当前项目逻辑入口说明
- 目标是既保证多语支持，也保证首页清晰，不要让一个 README 因三语全文堆叠而失去首页节奏与可读性。
- 当 README 被作为仓库首页处理时，允许优先采用居中排版来增强视觉统一感，尤其适用于：
  - 主标题
  - 副标题 / slogan
  - badges
  - 多语种切换超链接
- 这类居中排版的目标不是装饰，而是让仓库首页更像产品入口页而不是普通文本页。
- 若采用居中排版，应尽量让顶部结构保持一致：
  - 居中标题
  - 居中副标题
  - 居中 badges
  - 居中语言切换入口
- 只要不影响可读性与事实表达，这种顶部 Hero 区的视觉整理应被视为推荐做法，而不是额外装饰。

---

## 10. 安全与验证协议

### 10.1 敏感操作要有回滚点

- 删除、移动、覆盖、发布、替换、清理等敏感动作，必须保留可恢复路径或明确回滚点。

### 10.2 深度验证

- 验证不能只停留在“能打开”。
- 应覆盖：
  - 空数据
  - 非法输入
  - 网络中断
  - 空间不足
  - 路径错位
  - 安装残留
  - 旧缓存命中

### 10.3 交付要附带可证明信息

- 交付时应尽量提供：
  - 验证方式
  - 关键结果
  - 未验证部分
  - 剩余风险

---

## 11. 自我进化循环

- 用户一旦纠正，就应尽快把经验沉淀进正确文档。
- 新会话开始时，应优先复核历史教训和项目文档。
- 当代码与 md 的信息密度不对称时，默认补全文档，而不是减少文档。

---

## 12. 禁止事项

- 不得在未读完项目 md 前，擅自定义项目架构。
- 不得在未确认当前任务边界前，擅自扩散修改范围。
- 不得把项目级规则写进错误目录。
- 不得把本地私有规则、临时笔记或无关副产物误上传到仓库。
- 不得把项目 A 的仓库专属规则机械复制到项目 B。

---

## 13. 推荐执行顺序

1. 先读项目全部 md。
2. 确认项目文档主入口与当前任务层级。
3. 读取相关代码与相关运行目录。
4. 形成执行顺序与风险判断。
5. 修改代码或整理发布物。
6. 执行验证。
7. 同步更新正确位置的 md。
8. 最后再交付结论、路径、风险与下一步建议。

---

## 14. 源码驱动逻辑包维护协议

### 14.1 逻辑包不是源码备份

- 当任务是“整理归纳当前项目并输出逻辑包”时，交付物不应等同于整个源码目录的原样复制。
- 逻辑包应是围绕“如何理解、进入、执行、验证、扩展该系统”构建的结构化知识包。
- 逻辑包默认至少应包含：
  - 总纲
  - 架构分层
  - 主执行链路
  - 工具整合清单
  - 权限与安全机制
  - 扩展机制
  - 关键源码映射

### 14.2 工具必须整合成系统视图

- 当项目包含内置工具、外部工具、MCP 工具、技能、子 Agent、命令系统时，逻辑包不能只按目录罗列。
- 必须至少回答以下问题：
  - 工具从哪里注册
  - 工具如何注入给模型
  - 工具如何经过权限判定
  - 工具如何执行
  - 工具结果如何回流到会话
  - 哪些工具始终可用
  - 哪些工具受平台、权限、环境变量或 feature flag 控制
- 工具整合文档应优先形成：
  - 工具分类
  - 启用条件
  - 风险等级
  - 关键源码路径

### 14.3 逻辑包必须标注源码依据

- 逻辑包中的每个关键结论，默认都应能追溯到实际源码或项目文档。
- 只要条件允许，就应标出：
  - 对应 md 路径
  - 对应源码路径
  - 对应入口文件
  - 对应关键函数或关键模块
- 若某能力处于 stub、半实现、条件启用、平台限定或 feature flag 关闭状态，必须显式标注，不得按“完整可用”记录。

### 14.4 逻辑包输出结构建议

- 当需要形成独立逻辑包时，建议默认输出：
  - `00_README.md`
  - `01_MasterLogic.md`
  - `02_Architecture.md`
  - `03_AgenticLoop.md`
  - `04_Tools.md`
  - `05_PermissionsAndSafety.md`
  - `06_Extensibility.md`
  - `07_CommandSurface.md`
  - `08_SourceIndex.md`
  - `manifest.json`
- 如果已有上位总纲，例如 `AgentLogic_V6.md`，则逻辑包应保留该总纲并叠加当前项目特有内容，而不是替换其通用规则价值。

### 14.4.1 分层打包强制建议

- 当项目本身存在大量工具源码、工具编排源码、权限源码或命令源码时，逻辑包不应只输出抽象说明层。
- 默认应采用至少三层结构：
  - 抽象逻辑层
  - 原始源码层
  - 索引映射层
- 抽象逻辑层负责解释系统为什么这样设计。
- 原始源码层负责保留关键能力的真实实现，尤其是工具本体。
- 索引映射层负责告诉后续维护者：
  - 哪些源码必须优先阅读
  - 哪些源码只是支撑层
  - 哪些源码目前是 stub、死分支或条件启用

### 14.4.2 工具允许直接打包

- 对于工具系统，本规则允许直接将工具源码目录整体纳入逻辑包，而不是要求把每个工具都重新改写成摘要。
- 但只打包工具源码仍然不够，必须同时补一份工具总览文档，说明：
  - 工具分类
  - 工具入口
  - 工具注册点
  - 工具执行基础设施
  - 工具权限边界
  - 工具启用条件
- 如果工具数量较多，允许采用“工具源码原样保留 + 总览文档分层解释”的方式，不要求把所有工具都并入一份大表。

### 14.4.3 主逻辑可强制指定输出边界

- 当逻辑包目标不只是阅读，而是后续持续维护与复用时，主逻辑应显式强制指定：
  - 哪些目录必须进包
  - 哪些目录只需要索引，不需要全文复制
  - 哪些目录只能做摘要，不宜整包复制
- 典型强制指定方式包括：
  - 工具目录必须整包保留
  - 权限核心目录必须保留索引或关键实现
  - 文档目录可以选择性摘录而不是全部复制
  - UI 大型目录可只保留入口索引与关键链路说明
- 若未强制指定，后续维护者容易把逻辑包做成“半摘要半丢失”的不稳定结构。

### 14.4.4 建议的强制打包优先级

- 对于 Agentic CLI、工具型系统、带权限控制的工程项目，建议默认按以下优先级决定是否进包：
  - P0 必须整包保留：
    - 工具目录
    - 工具注册与执行基础设施
  - P1 必须保留关键实现或整包保留：
    - 权限系统
    - 子 Agent / Agent 定义系统
    - MCP 核心服务
    - Skills 核心系统
  - P2 允许只保留索引与映射：
    - 命令面
    - 上下文构建层
    - 状态层
  - P3 默认只保留入口与说明：
    - 大型 UI 组件层
    - 主题、视觉、展示性组件
- 如果项目的主要价值正好集中在 UI，本优先级允许被项目级逻辑覆盖。

### 14.4.5 能力状态必须入包

- 逻辑包不应只回答“有没有这个目录”，还必须回答“能力现在处于什么状态”。
- 至少应标注以下状态之一：
  - implemented
  - enabled conditionally
  - disabled by feature flag
  - stub
  - external-only
- 若没有能力状态矩阵，后续维护者会误把“代码存在”当成“能力可用”。

### 14.5 逻辑包版本迭代规则

- 只要在当前项目中发现更准确的执行链路、工具边界、权限行为、打包规则或扩展模型，就应回写到主逻辑文件，而不是只更新导出包。
- 主逻辑文件与导出逻辑包之间，应保持：
  - 主逻辑负责抽象规则
  - 项目逻辑包负责实例化映射
  - 版本号递增时，应说明新增了哪些结构，而不是只改文件名

---

## 15. 版本说明

- 本版为 `AgentLogic_V6`
- 本版是对 `agentlogic.md` 与 `agentlogic test1.md` 的整理版：
  - 保留通用工程规则
  - 保留打包 / 文档 / 冲突清理 / README 表现规则
  - 删除与当前项目无关的其他仓库专属附录

---

# AgentLogic V6 (English Version)

This document is a general AI engineering collaboration protocol. It standardizes how AI should work when starting a project, reviewing a project, fixing a project, refactoring a project, packaging a project, or publishing a project.

---

## 1. Core Goals

- Reduce context confusion, role drift, and documentation distortion in large projects.
- Ensure that AI understands architecture, history, boundaries, and release rules before modifying code.
- Ensure that every fix, refactor, packaging action, and release action forms a traceable closed loop.

---

## 2. Three-Layer Model

### L1: Strategic Entry Layer

- Responsibility: define the current state of the project and its main entry context.
- Focus: Status, Blueprint, History, project README, delivery rules, and release rules.
- Purpose: determine whether the task is about understanding, planning, or execution.

### L2: Architectural Domain Layer

- Responsibility: define module boundaries, design principles, interaction constraints, performance direction, and deployment constraints.
- Focus: module structure, transport flows, path models, state machines, design patterns, and runtime models.
- Purpose: ensure that changes match system-level engineering logic rather than only fixing a local symptom.

### L3: Atomic Execution Layer

- Responsibility: land work at the level of files, functions, entrypoints, commands, build parameters, and verification steps.
- Focus: concrete files, function responsibilities, build commands, log locations, validation methods, and physical fix locations.
- Purpose: remove ambiguity and make work executable, verifiable, and documentable.

---

## 3. Mandatory Rules Before Entering a Project

### 3.1 Read Project Markdown Before Acting

- Every time you start, review, or repair a project, you must read all project `.md` files before entering analysis, modification, packaging, or publishing.
- The purpose is not procedural formality; it is to understand:
  - architecture definitions
  - directory boundaries
  - historical evolution
  - deployment rules
  - release constraints
  - prior troubleshooting lessons
- Before the documentation has been read, do not make assumptions about architecture, deployment, packaging layout, runtime model, account rules, or stable baselines.

### 3.2 Respect the Documentation Entry Hierarchy

- If a project has a unified documentation center, start there instead of scanning random markdown files first.
- If the project has a master README, guide page, or control-center document, treat it as the first entrypoint.

### 3.3 Clarify Task Scope First

- After entering a project, determine whether the current task belongs to:
  - L1: understanding, mapping, planning
  - L2: solution design, architecture, interaction, constraints
  - L3: code changes, builds, validation, release
- Before the task boundary is clear, do not expand scope or add extra work on your own.

### 3.4 Every Agent Must Follow the Master Logic on Entry

- Whenever an agent starts a new project, takes over a new module, enters a new subsystem, or moves into a new phase, it must first follow the master-logic onboarding and planning flow instead of directly implementing, editing, or executing commands.
- “Every agent” includes, but is not limited to:
  - the main-thread agent
  - sub-agents
  - parallel agents
  - module-specific agents
  - review, verification, and planning agents
- The mandatory onboarding flow should include at least:
  - identifying the documentation entrypoint
  - reading the relevant markdown and key entrypoint source files
  - determining whether the task is L1, L2, or L3
  - defining the execution order, current scope boundary, and risk judgment
- If the task is “adding a new module” rather than “fixing an existing module”, the agent must also add a module-level plan:
  - module objective
  - module boundary
  - relationship to the existing system
  - entrypoints and landing points
  - validation method
- Until this step is completed, the agent should not move into direct implementation unless the user explicitly asks to skip it and that skip has been recorded as a risk.

### 3.5 The Master Logic Takes Priority Over Local Habits

- When a project contains scattered conventions, temporary notes, stale comments, or local module habits, all agents should treat the master logic as the highest collaboration rule and then adapt to the real project structure.
- Local rules may refine the master logic, but they should not bypass the master logic’s onboarding, layering, validation, and documentation-sync requirements.
- The value of the master logic is that different agents can enter the project at different times and still follow the same stable path into the system, which significantly reduces error rate and structural drift.

### 3.6 The Master Logic Must Be Read in Full

- An agent must read the master logic in full. It is not acceptable to read only the front section, only a few matching clauses, or to assume that once sections `1`, `2`, and `3` are seen, later sections such as `11`, `12`, and `13` can be ignored.
- Later sections of the master logic often contain:
  - prohibitions
  - documentation-sync requirements
  - packaging rules
  - risk boundaries
  - version-maintenance rules
- Skipping those sections may look faster in the beginning, but it substantially increases later realignment cost, structural drift, and rule conflicts.
- Therefore, before an agent claims that master-logic onboarding is complete, it should by default satisfy all of the following:
  - it has read the full master logic in order
  - it has confirmed that later sections do not contain constraints relevant to the current task
  - it has incorporated the mandatory clauses from later sections into the current execution judgment
- Reading the master logic should not be treated as keyword matching; it should be treated as a full structured read.

---

## 4. Synchronization and Closed-Loop Rules

### 4.1 Read Before Writing

- Read relevant documentation and relevant code before modifying anything.
- Do not change code based only on the surface symptom.

### 4.2 Sync Immediately After Success

- Once code changes are successful, validated, and confirmed, update the relevant markdown immediately.
- Important lessons must not remain only in the chat history.

### 4.3 Minimum Documentation Set

- triggering symptom
- impact scope
- root cause assessment
- modified files
- modification method
- validation method
- if build-related, also include:
  - build command
  - build parameters
  - artifact timestamps
  - install-directory or runtime-directory verification result

### 4.4 Persist Structure Into Markdown

- Any critical structure that has been read, changed, or verified should be written into markdown as precisely as practical:
  - entry files
  - module relationships
  - key function responsibilities
  - path models
  - data flow
  - communication flow
  - dependency flow

### 4.5 Index Failures

- Every build failure, regression, expected risk, and repair action after packaging should be written into markdown.
- The goal is not to “summarize”; the goal is to create a searchable failure index.

---

## 5. Engineering Execution Rules

### 5.1 Plan First

- If the task has more than 3 steps, spans multiple modules, involves refactoring, or touches deployment or release, form a clear execution sequence first.

### 5.2 Verify Before Marking Done

- Nothing is complete until it is validated.
- Validation may include:
  - syntax checks
  - successful builds
  - successful runtime behavior
  - path verification
  - log verification
  - device or machine verification

### 5.3 Prefer Elegant Solutions

- Do not accept patchy temporary fixes as the default.
- Prefer solutions with clean structure, stable boundaries, and maintainable follow-up behavior.

### 5.4 Troubleshoot Proactively

- When a problem can be traced through logs, paths, instance state, or build chains, keep moving until the likely cause is clear.
- Do not hand obvious next-step troubleshooting back to the user too early.

### 5.4.1 Duty to Evaluate Tools and Skills Proactively

- If AI cannot determine which tool or skill is most appropriate for the current task, or if the default path appears clearly inefficient, it should not mechanically keep using the old path.
- In that situation, AI should perform a constrained tool evaluation and answer at least:
  - whether the current default tool is merely usable instead of actually appropriate
  - whether the task has a more specialized, efficient, or stable tool or skill available
  - whether the alternative can materially improve:
    - reading efficiency
    - classification accuracy
    - search quality
    - structural understanding speed
    - automation level
- The purpose of this proactive evaluation is to prevent AI from operating in a closed loop with weak default tools while overlooking better-fit tools that already exist.

### 5.4.2 External Better-Tool Discovery Rule

- When AI starts a new project, takes over a new module, or establishes a new workflow, and finds that an external tool, skill, classifier, indexer, reader, analyzer, or automation component is clearly better suited, it should proactively record and propose it.
- “Proactively propose” does not mean silently integrating it immediately. It means:
  - first explain why the current tool path is insufficient
  - then explain why the candidate tool is a better fit
  - then explicitly classify it as one of:
    - recommended
    - candidate enhancement
    - already integrated
- Without confirmation, AI should not describe an external candidate tool as if it were already part of the current system.

### 5.4.3 Avoid Tool Conservatism

- AI should not assume that an old tool, default browser path, default search path, or inherited script is still the best current option just because it already exists.
- “Use the old tool to get something done first” can be a temporary tactic, but it should not prevent AI from recognizing and proposing better tool directions.
- For high-frequency, inefficient, repetitive, or long-running workflows, AI should actively consider whether a better tool-based alternative exists.
- When the default tool path is inefficient, the agent should actively look for a more appropriate tool or approach for the task, but it must distinguish between officially integrated capabilities and candidate enhancements.

### 5.5 No Unapproved Feature Additions

- Do not add out-of-scope functionality, interactions, state-machine changes, default-behavior changes, visual redesigns, workflow changes, or “small optimizations” without explicit user approval.
- Better options may be proposed, but they must wait for user confirmation before implementation.

---

## 6. Documentation Precision Rules

### 6.1 Markdown Is Not Auxiliary

- Markdown is not an attachment; it is the runtime map, troubleshooting index, and repair archive of the project.

### 6.2 Prefer Precision

- When time allows, documentation should become more specific, not more abstract.

### 6.3 Physical Location Requirement

- Whenever markdown references a function, method, command, or event, it should also provide a file path by default.
- Best form:
  - `function name` + `file path`
  - and when practical, an approximate line or search anchor

### 6.4 Relationship Chains Matter

- Key functions should not be documented only as isolated points.
- Also document:
  - who calls them
  - what they affect next
  - which document section or chain they belong to

### 6.5 Log Location Must Be Explicit

- Log placement is an architectural fact, not an implementation footnote.
- Whenever log behavior changes, verify and document the physical log location.
- If permissions require a fallback path, record it explicitly; never silently change the default destination.

---

## 7. Packaging vs Runtime Verification Protocol

### 7.1 Default Dual Track

- Track A: unpacked testing artifacts
  - such as `win-unpacked`, runnable directories, debug builds, or uninstalled bundles
- Track B: final installers or release packages
  - such as `.exe`, NSIS, MSI, `.dmg`, `.AppImage`, APK, or AAB

### 7.2 Default Order

- Validate feature logic, interactions, state machines, and communication chains in Track A first.
- Move to Track B only when:
  - the user explicitly asks for the final installer
  - the work has reached QA, acceptance, or delivery stage
  - the issue exists specifically in installation, signing, packaging, permissions, upgrade, or uninstall flows

### 7.3 Confirm Packaging Intent First

- Are we testing an unpacked build or producing the final installer?
- Is the current goal feature validation or formal delivery?
- If the user does not explicitly require the final installer, remain in the unpacked-validation stage by default.

### 7.4 High-Risk Checks After Packaging

- install directory
- working directory
- `app.asar`
- config loading
- stale cache hits
- auto-start entries
- scheduled tasks
- leftover processes
- uninstall metadata
- permissions, signing, and file locks
- shared-directory or user-directory path models

### 7.5 Release Asset Completeness Rule

- When a project reaches the stage of GitHub release publication, formal delivery, stable-version archiving, or milestone-version delivery, the release should not contain only installers or executable artifacts.
- By default, the release must also include the source package that corresponds to the exact version being published.
- The “source package” here means a version-aligned source archive for the current tag or release, not an arbitrary snapshot of the current working directory.
- If a project provides:
  - installers
  - unpacked executable bundles
  - source packages
  then the source package should also be included in the same release whenever possible.
- The reasons include:
  - easier rollback
  - easier version auditing
  - easier offline archiving
  - direct access from the release page to the exact source version that matches the installers
- For everyday small fixes that are not entering a formal release flow, a manually attached source package is not mandatory. But once the work becomes a published release, the source package should be treated as a standard release asset.
- After the source package has been uploaded successfully to the GitHub release, any temporary local source zip created only for that upload must be deleted immediately.
- Do not keep ad hoc local source zip files in the workspace, release folder, or staging folders after upload, because they easily accumulate and create version confusion about which archive is the canonical release asset.

---

## 8. Instance Conflict and Cleanup Rules

### 8.1 Client Instance Conflict Rule

- If the same machine keeps multiple client forms at the same time, for example:
  - portable build
  - installed build
  - old copied directory
  - stale installed state
- it may lead to:
  - unclickable UI
  - playlist delivery appearing to succeed while playback does not start
  - the wrong instance being launched
  - behavior that looks like the code was never updated
- Therefore the client startup chain must include conflict cleanup by default.

### 8.2 Minimum Client Cleanup Scope

- old `AdvertisingScreenClient.exe` processes
- auto-start registry entries
- scheduled tasks
- old installation directories
- old portable directories
- old runtime directories
- control directories and local runtime directories that conflict with the current instance

### 8.3 Server Multi-Instance Protection Rule

- The server must enforce single-instance behavior.
- Default strategy:
  - block the second instance
  - wake or open the existing instance
- Multi-instance protection must not automatically erase user business data.

### 8.4 Cleanup Boundary Rule

- Cleaning instance conflicts is not the same thing as clearing user configuration.
- Safe-to-clean targets:
  - conflicting processes
  - auto-start items
  - scheduled tasks
  - old runtime directories
  - old portable directories
  - installation directories that conflict with the current instance
- Do not auto-delete by default:
  - user config files
  - server storage data
  - playlists
  - approval records
  - media libraries
  - installer repositories
- Only delete config and business data when the user explicitly requests a reset, factory reset, or data wipe.

---

## 9. UI / UX and README Presentation Rules

### 9.1 UI / UX Boundary Rule

- UI changes must not pursue “modernization” in isolation; they must match actual product boundaries and interaction reality.
- Any change to state machines, layout structure, or user flow should be treated as a product change, not just a visual change.

### 9.2 README as the Public Landing Page

- A GitHub README is not only documentation; it should also function as the public landing page and first product impression.
- When the task involves the README, repository homepage, release page, or project introduction, do not only increase text density. Also evaluate:
  - first-screen pacing
  - section hierarchy
  - visual impact
  - memorability
- It is acceptable to improve:
  - hero titles and subtitles
  - badges
  - feature matrices
  - version timelines
  - bilingual or multilingual entry points
  - clearer landing-page narrative
- But do not change facts or invent capabilities.
- A README must include a practical “Usage”, “Quick Start”, or equivalent section by default.
- Even if the project is still evolving, the README should not stop at overview and architecture. At minimum, it should tell the reader:
  - how to start using the repository
  - what the main directories are for
  - how to launch or validate the client and server
  - where installer assets or release artifacts are obtained
- If the project is currently more suitable for developer-oriented usage instructions than end-user instructions, the README must still include the minimum executable steps instead of omitting usage entirely.
- When a README needs multilingual support, do not stack full Chinese, English, Japanese, or other full-language content into a single page by default.
- The preferred multilingual README structure is:
  - `README.md` as the primary entry page
  - `README.zh-CN.md` as the Chinese page
  - `README.ja.md` as the Japanese page
  - additional languages following the same independent-file pattern
- Each language page must provide the same language-switch links near the top, for example:
  - `English | 中文 | 日本語`
- The default README should still preserve:
  - title
  - summary
  - badges
  - multilingual entry links
  - the full content of its own language version
- The goal is to support multilingual readers without destroying the landing-page rhythm or readability of the repository homepage.
- When a README is acting as the repository landing page, centered presentation is allowed and recommended for visual coherence, especially for:
  - the main title
  - the subtitle or slogan
  - badges
  - multilingual navigation links
- The purpose of this centered layout is not decoration for its own sake; it is to make the repository homepage feel more like a product landing page than a plain text document.
- If centered presentation is used, the top section should stay structurally consistent when practical:
  - centered title
  - centered subtitle
  - centered badges
  - centered language switch links
- As long as readability and factual clarity are preserved, this top-level Hero-style presentation should be treated as a recommended pattern rather than an optional flourish.

---

## 10. Safety and Validation Protocol

### 10.1 Sensitive Actions Need Rollback Paths

- Deletion, movement, replacement, publishing, cleanup, and overwrite actions must preserve a recovery path or a clearly defined rollback point.

### 10.2 Deep Validation

- Validation must not stop at “it opens”.
- It should cover:
  - empty data
  - invalid input
  - network interruptions
  - low disk space
  - path mismatches
  - installation leftovers
  - stale cache hits

### 10.3 Delivery Must Include Proof

- Delivery should include as much of the following as practical:
  - validation method
  - key results
  - what was not validated
  - remaining risks

---

## 11. Self-Improvement Loop

- Once the user corrects something, the lesson should be written into the correct document quickly.
- At the start of new sessions, review prior lessons and project documentation first.
- When code and markdown differ in information density, prefer enriching the documentation.

---

## 12. Prohibitions

- Do not define the project architecture before reading the project markdown.
- Do not expand the scope before confirming the current task boundary.
- Do not write project-level rules into the wrong directory.
- Do not upload local private notes, temporary notes, or unrelated artifacts into a repository.
- Do not mechanically copy repository-specific rules from project A into project B.

---

## 13. Recommended Execution Order

1. Read all project markdown files first.
2. Confirm the project documentation entrypoint and the current task layer.
3. Read the relevant code and runtime directories.
4. Form the execution sequence and risk judgment.
5. Modify code or prepare release artifacts.
6. Validate the result.
7. Update the correct markdown files.
8. Deliver the conclusion, paths, risks, and next-step suggestions.

---

## 14. Source-Driven Logic Package Maintenance Protocol

### 14.1 A Logic Package Is Not a Raw Source Backup

- When the task is to organize a project into a logic package, the deliverable should not be a blind copy of the entire repository.
- A logic package should be a structured knowledge package focused on how to understand, enter, execute, validate, and extend the system.
- By default, it should include at least:
  - a master logic file
  - architecture layers
  - the main execution flow
  - a tool integration inventory
  - permissions and safety mechanisms
  - extensibility mechanisms
  - key source mappings

### 14.2 Tools Must Be Integrated as a System View

- When a project contains built-in tools, external tools, MCP tools, skills, sub-agents, or command systems, the logic package must not only list directories.
- It should answer at least:
  - where tools are registered
  - how tools are exposed to the model
  - how tool permissions are evaluated
  - how tools execute
  - how tool results flow back into the conversation
  - which tools are always available
  - which tools are controlled by platform, permissions, environment variables, or feature flags
- The tool integration document should preferentially provide:
  - tool categories
  - enablement conditions
  - risk levels
  - key source paths

### 14.3 Every Logic Package Must Cite Source Evidence

- Every key conclusion in the logic package should be traceable to real source files or project markdown.
- When practical, include:
  - markdown paths
  - source code paths
  - entry files
  - key functions or modules
- If a capability is stubbed, partially implemented, conditionally enabled, platform-limited, or feature-flagged off, this must be stated explicitly.

### 14.4 Recommended Logic Package Structure

- When producing an independent logic package, the default output should be:
  - `00_README.md`
  - `01_MasterLogic.md`
  - `02_Architecture.md`
  - `03_AgenticLoop.md`
  - `04_Tools.md`
  - `05_PermissionsAndSafety.md`
  - `06_Extensibility.md`
  - `07_CommandSurface.md`
  - `08_SourceIndex.md`
  - `manifest.json`
- If a higher-level master logic file already exists, such as `AgentLogic_V6.md`, the package should retain that master logic and layer project-specific structure on top of it instead of replacing its generic engineering value.

### 14.4.1 Layered Packaging Should Be Treated as the Default

- When a project contains substantial tool source code, tool orchestration code, permission code, or command code, the logic package should not stop at the abstract documentation layer.
- By default, it should use at least three layers:
  - the abstract logic layer
  - the raw source layer
  - the index and mapping layer
- The abstract logic layer explains why the system is structured the way it is.
- The raw source layer preserves the real implementation of critical capabilities, especially the tool system.
- The index and mapping layer tells future maintainers:
  - which sources must be read first
  - which sources are support layers
  - which sources are currently stubs, dead branches, or conditionally enabled

### 14.4.2 Tool Source Is Allowed to Be Packaged Directly

- For the tool system, this protocol explicitly allows the tool source directories to be included directly in the logic package.
- But raw tool source alone is insufficient; the package must also include a tool overview document that explains:
  - tool categories
  - tool entrypoints
  - tool registration points
  - tool execution infrastructure
  - tool permission boundaries
  - tool enablement conditions
- When there are many tools, it is acceptable to use a layered approach of “raw tool source preserved as-is + overview documentation with system-level explanation” instead of rewriting every tool into one oversized summary.

### 14.4.3 The Master Logic May Explicitly Enforce Packaging Boundaries

- When the package is intended not only for reading but also for ongoing maintenance and reuse, the master logic should explicitly enforce:
  - which directories must be included
  - which directories only need indexed references
  - which directories should be summarized instead of copied wholesale
- Typical enforced rules include:
  - tool directories must be preserved as a package layer
  - core permission directories must be preserved through either raw copies or key implementation slices
  - documentation directories may be selectively extracted rather than fully copied
  - large UI directories may be represented by entrypoint indexes and key execution-flow explanations
- Without explicit enforcement, future maintainers often produce unstable packages that are half-summary and half-loss.

### 14.4.4 Recommended Packaging Priority

- For agentic CLI systems, tool-centric systems, and permission-bound engineering projects, the default packaging priority should be:
  - P0 must be preserved as raw package layers:
    - tool directories
    - tool registration and execution infrastructure
  - P1 must preserve either key implementations or full raw copies:
    - permission systems
    - sub-agent and agent-definition systems
    - MCP core services
    - skill systems
  - P2 may be preserved as indexes and mappings:
    - command surfaces
    - context-building layers
    - state layers
  - P3 should default to entrypoints and explanations only:
    - large UI component layers
    - theme, presentation, and display-oriented components
- If the main value of the project is the UI itself, the project-specific logic may override this priority.

### 14.4.5 Capability Status Must Be Captured

- A logic package should not only answer “does this directory exist”; it must also answer “what is the current capability state”.
- At minimum, one of the following states should be recorded:
  - implemented
  - enabled conditionally
  - disabled by feature flag
  - stub
  - external-only
- Without a capability-state matrix, future maintainers will incorrectly treat “code exists” as “capability is available”.

### 14.5 Version Iteration Rules for Logic Packages

- When a project reveals more accurate execution flows, tool boundaries, permission behavior, packaging rules, or extensibility models, those lessons should be written back into the main logic file instead of only updating the exported package.
- The relationship should remain:
  - the master logic defines abstract rules
  - the project logic package defines project-specific mappings
  - when the version increases, the documentation should state what structural value was added instead of only changing the file name

### 14.6 Validation Artifact and Repository Sync Rules

- For UI, layout, rendering, window-behavior, and visual-regression work, screenshot-based visual verification is a required validation tool, not an optional extra.
- The agent must not rely only on code reading or build success when the problem is visibly behavioral.
- When UI verification depends on screenshots, screenshots may be generated as temporary validation artifacts.
- After the screenshot has completed its debugging or confirmation purpose, the temporary screenshot file must be deleted immediately.
- Temporary UI screenshots must not remain in `dist`, release folders, staging folders, or the repository root after verification is complete.
- The main logic must not absorb every useful discovery by default.
- Project-specific discoveries, task-specific notes, and temporary working patterns should stay in project markdown, task notes, or local structure unless the user explicitly asks for main-logic promotion.
- Only when the user explicitly says that a rule should enter the main logic should that rule be written back into `AgentLogic_V6`.
- When the user explicitly asks for a main-logic update, the updated main logic must be synchronized not only to the current project repository but also to the dedicated rules repository: `https://github.com/UIhoshi/AgentLogic`.
- That cross-repository sync applies specifically to main-logic updates, not to every project-layer change by default.
- After the rule has been written back, the repository must be synchronized in the same round unless a concrete blocker exists.
- Routine logic additions do not justify a major-version jump such as `V6 -> V7`.
- Unless the change is a real major logic-generation upgrade, updates should remain within the current logic version line.
- If the repository already contains a release archive for the current logic version, the same-version archive should be replaced instead of creating an arbitrary new major version.
- If no tag, release, or release-archive baseline exists yet, do not fabricate a fake release flow. In that case, keep normal repository synchronization and preserve the current version line.

### 14.7 Startup Re-Read Loop for Main Logic

- Before every new work round, the agent must re-read the current project's main logic entry before executing.
- "Every new work round" includes returning after interruption, starting a new user request, entering a new module, or resuming after a failed attempt.
- The purpose is not ceremonial reading. The purpose is to refresh the current behavioral constraints, validation rules, packaging rules, and repository-sync rules before action.
- This startup re-read loop must be reflected not only in the logic package itself, but also in the project's own top-level markdown so the project can remind future agents locally.
- If the project already declares its logic entry path, the startup loop should explicitly point back to that path.

### 14.7.1 Highest-Priority Startup Chain For New Coding Rounds

- The startup chain below is a highest-priority mandatory rule, not an optional heuristic.
- Before any new coding round, new feature round, or resumed implementation round, the agent must execute this exact order:
  1. confirm the current logic entry
  2. judge whether the new task is an extension of the previous coding round
  3. if it is not an extension, the agent must ask the user whether to forget/compress context before continuing
- Step 3 has the same priority level as step 1 and step 2.
- This means the agent must not silently carry old context into a new coding track when the new task is not clearly an extension of the previous one.
- If the answer is to forget/compress context, the agent must first externalize the current valid state into structured records before reducing the working context.
- At minimum, the externalized state should include:
  - current task goal
  - current boundary
  - current module or subsystem
  - completed work
  - next action
  - unconfirmed facts
  - remaining risks
- Until this startup chain is satisfied, the agent should not treat itself as ready to enter formal implementation.

### 14.8 Structured External-Brain Rule

- Do not assume that stable execution comes from internal memory alone.
- The preferred working model is an externalized memory model: methods, decisions, exceptions, and learned procedures should be written into structured records and revisited before execution.
- Spreadsheet-like structure is a valid and preferred form of external memory when the user's working style depends on collecting many facts into one navigable structure.
- When the user describes a workflow similar to an Excel habit, the agent should interpret that as a preference for:
  - structured aggregation
  - repeatable lookup
  - reusable execution patterns
  - low-memory-dependence workflows
- Therefore, when the agent encounters uncertainty, difficulty, or a recurring task, the default response should be:
  - look back at the recorded structure first
  - reuse the recorded method if it exists
  - only improvise when the structured record does not already provide a usable path
- This rule applies both to the user's own documented working style and to the agent's collaboration behavior in the repository.

### 14.9 Logic-Project Closed Loop Rule

- Project work must form a closed loop between the main logic and the project's own structure documents.
- The default loop is:
  - read the main logic first
  - read the relevant project markdown and structure files
  - before making the formal update, return once more to the main logic
  - then decide how to implement the project change
- This means the main logic is not only a startup reference. It is also a pre-implementation calibration layer.
- When the task is to update, refactor, or extend the project, the agent must not jump directly from reading project files into implementation.
- The agent must first re-check the change through the main-logic lens before editing code, packaging artifacts, or project documentation.
- The purpose of this loop is:
  - prevent local project drift
  - prevent implementation choices from bypassing collaboration rules
- ensure project updates still obey the same higher-order method
- keep project facts and execution rules continuously aligned
- This closed loop should also be reflected in the project's own top-level markdown so the project locally reminds future agents how updates must be performed.

### 14.10 Main Entry Code Files Should Carry Logic Reminders

- When a project depends on an external logic package or a dedicated logic-entry workflow, the reminder should not exist only in chat memory or only in top-level markdown.
- The project should also place a short logic-entry reminder at the top of its main entry code files.
- The purpose of these reminders is to increase the chance that the agent sees the logic-entry rule at the exact point where work usually starts, especially in long multi-round sessions.
- These reminders should be added only to major entry files or major control files, not mechanically to every source file in the repository.
- Typical targets include:
  - process entry files
  - main backend control files
  - route entry files
  - preload bridge files
  - major renderer entry files
  - main admin UI entry files
- The reminder text should stay short and low-noise.
- The reminder should point to repository-relative entry documents such as `AGENTS.md` and `README.md`, not to machine-specific absolute paths.
- The preferred chain is:
  - code-file reminder points to repository entry docs
  - repository entry docs point to the main logic package
- This design keeps the code reminder stable across machines while keeping the actual logic path centralized in repository-level documentation.

### 14.10.1 Repository-Level Enforcement Script Should Back The Reminder

- A logic reminder only in markdown and source headers is stronger than chat memory, but it is still not a full engineering enforcement mechanism.
- If the project wants stronger execution guarantees, it should add a repository-level enforcement script that mechanically checks whether:
  - the repository entry docs still point to the current logic entry
  - the key entry code files still retain the logic reminder
  - the reminder text still points to repository-relative docs rather than machine-specific paths
- A recommended command pattern is:
  - `node scripts/check-logic-entry.js`
- This script does not replace the requirement to read the logic package.
- Its role is to prevent silent drift, accidental deletion of reminders, and project-layer desynchronization after multiple implementation rounds.
- Therefore the preferred enforcement stack becomes:
  - logic package defines the rule
  - repository markdown declares the entry path
  - key entry code files carry short reminders
  - repository script checks the reminder chain mechanically

### 14.10.2 Header-Level Mandatory Rules Should Default To English

- When a project writes mandatory workflow rules into file headers, the default language for those header-level rules must be English.
- This applies to header notices in:
  - source files
  - style files
  - markup files
  - project markdown files
- The purpose is to maximize consistency across:
  - different agents
  - different language settings
  - different model providers
  - cross-project reuse
- Local-language explanation is still allowed in normal project markdown body text.
- But the short mandatory rule written into file headers should default to English unless the user explicitly requests a different default.
- Therefore a project should not mix header-level mandatory rules between Chinese, English, and other languages by default.
- The repository-level enforcement script should also validate the English header rule text if the project has standardized on it.

---

## 15. Version Note

- This version is `AgentLogic_V6`.
- It is a consolidated version based on `agentlogic.md` and `agentlogic test1.md`.
- It keeps:
  - general engineering rules
  - packaging and documentation rules
  - instance-conflict cleanup rules
  - README presentation rules
- It removes repository-specific appendices that do not belong to the current project.
