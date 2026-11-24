---
title: "quartz 站点与生命周期档案 (Quartz)"
description: "预留扩展位 sites/quartz：Obsidian 笔记库一键发布首选：原生支持 [[双向链接]]、反向链接面板、悬浮预览卡片与 D3 知识关系图谱"
---

# `quartz` 站点档案（Quartz · 图鉴扩展位）

- **预留子模块路径**：`sites/quartz`（与本档案 `docs/sites/quartz.md` 及 `quartz.json` 严格 1:1 对应）
- **官方网站**：[https://quartz.jzhao.xyz/](https://quartz.jzhao.xyz/) · **上游仓库**：[https://github.com/jackyzha0/quartz](https://github.com/jackyzha0/quartz)
- **底层技术栈**：Node.js Worker 多线程 + Preact 静态 JSX + unified/remark + D3.js 图谱

## 1. 生命周期定位（开始 / 活跃 / 废弃时间）

| 指标 | 时间节点与演进状态 |
| :--- | :--- |
| **开始时间** | `2021-07-18` 创立开源 |
| **活跃时间** | 2023-08 发布 v4 重写版至今持续高频活跃 |
| **废弃 / 演进状态** | Quartz v3 (基于 Hugo) 已于 2023 被 v4 自研引擎取代 |

## 2. 独立 JSON 元数据与 GitHub 历年提交活跃度

<!-- GITHUB_API_TABLE_START -->
> 独立结构化元数据文件：[`docs/sites/quartz.json`](./quartz.json)（含完整元数据、Tag、依赖 Lib 与 `github` API 节点，采样日期：`2026-11-23`）

### 站点元数据与底层依赖库（Libs）

| 元数据属性 | 内容详情 |
| :--- | :--- |
| **官方网站 (Website)** | [https://quartz.jzhao.xyz/](https://quartz.jzhao.xyz/) |
| **GitHub 源码仓库** | [jackyzha0/quartz](https://github.com/jackyzha0/quartz) |
| **包管理仓库 (Registry)** | [https://github.com/jackyzha0/quartz](https://github.com/jackyzha0/quartz) |
| **分类标签 (Tags)** | `#ssg` · `#digital-garden` · `#obsidian` · `#wikilinks` · `#backlinks` · `#knowledge-graph` · `#preact` · `#remark` |
| **运行时与打包器** | Node.js >= 20 · esbuild + Quartz Custom Worker Pool（多线程并发编译） |
| **UI 与 Markdown 引擎** | Preact（构建期 JSX 静态化，零运行时膨胀） · `unified + remark + rehype + Obsidian Flavored Markdown 插件链` |
| **高亮与全文检索** | rehype-pretty-code (Shiki) · FlexSearch（支持全文与标签即时检索） |
| **数学公式与流程图库** | remark-math + rehype-katex / mathjax ； 原生内置 Mermaid 代码块与 Obsidian Callouts 解析 |
| **核心依赖库 (Core Libs)** | `preact`、`esbuild`、`unified`、`remark-parse`、`rehype-katex`、`flexsearch`、`d3` |
| **本子站实测锁定版本** | `@jackyzha0/quartz@4.5.2` · `preact@10.28.2` · `micromorph@0.4.5` · `d3@7.9.0` · `pixi.js@8.15.0` · `flexsearch@0.8.205` · `remark-math@6.0.0` · `rehype-katex@7.0.1` · `katex@0.19.1` · `mermaid@12.3.0` · `shiki@1.26.2` |

### ⚡ 同源 5 章基准冷构建耗时与产物体积实测（`benchmark` 节点）

| 冷构建耗时 | 产物文件数 | 总产物体积 | HTML 体积 | JS 原始 / Gzip | CSS 原始 / Gzip | 正文 `<script>` 数 | 离线搜索 / AI |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| **6.23 s (6,226 ms)** | 204 | 8043.0 KB | 824.6 KB | 6016.7 KB / **1774.6 KB** | 67.9 KB / 13.2 KB | `6` 个 | FlexSearch (contentIndex) |

### GitHub 仓库 API 指标快照

| 官方仓库 | 创建日期 | 最近推送 | Stars | 默认分支总提交 | 峰值年份 (提交数) | 最新 Release |
| :--- | :--- | :--- | ---: | ---: | :--- | :--- |
| [`jackyzha0/quartz`](https://github.com/jackyzha0/quartz) | `2021-07-18` | `2026-11-22` | ★ 13,619 | 2,141 | `2024` (539) | `v5.2.2` (2026-11-22) |

### GitHub 主分支历年提交活跃度表（`2021–2026`）

| 年份 | 提交数 (Commits) | 占峰值比 | 活跃度趋势条 | 阶段状态 |
| :--- | ---: | ---: | :--- | :--- |
| `2021` | **82** | 15.2% | `██░░░░░░░░░░░░░░` | 🟡 低频维护 |
| `2022` | **297** | 55.1% | `█████████░░░░░░░` | 🔵 稳健迭代 |
| `2023` | **462** | 85.7% | `██████████████░░` | 🟢 高频活跃 |
| `2024` | **539** | 100.0% | `████████████████` | 🔥 历史最高峰 |
| `2025` | **232** | 43.0% | `███████░░░░░░░░░` | 🔵 稳健迭代 |
| `2026` | **529** | 98.1% | `████████████████` | 🟢 高频活跃 |
<!-- GITHUB_API_TABLE_END -->

## 3. 核心差异化特色与选型边界

1. **网状知识库（Digital Garden）与树状手册的哲学分野**：传统 SSG 强迫作者把知识塞进严格的目录树侧边栏；Quartz 4 则围绕 **`[[WikiLinks]]` 双向链接、页面底部反向链接（Backlinks）与右上角交互式 D3 节点图谱** 构建，是发布个人第二大脑的天花板。
2. **与 GFM / Obsidian 极高的原生契合度**：不仅原生支持 `> [!NOTE]`，还支持 `> [!WARNING]- 点击展开` 这种一行合并“警示框 + 折叠块”的优雅扩展语法！
3. **局限**：采用 Clone 整个上游工具仓作为文档仓的形态（而非轻量 npm 依赖包），后续升级引擎需通过 `git merge upstream` 处理冲突。
