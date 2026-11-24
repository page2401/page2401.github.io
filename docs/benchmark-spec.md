---
title: "基准测试与派生子模块接入规范"
description: "从主仓 docs/*.md 母版派生适配新静态网站生成器子模块的标准五章要求与四步上线流程。"
---

# 相似 `*.md` 多版本静态网站对比基准与接入规范

## 1. 核心架构：母版（`docs/*.md`） ──派生适配──▶ 子模块（`sites/*`）

本仓库 `docs/` 目录维护全站唯一的**标准 GitHub Flavored Markdown（GFM）原始母版**。在真实文档工程中，不同静态网站生成器及不同大版本对元数据校验、提示块方言（`::: warning` vs `:::caution[标题]` vs `?>` vs `!!!`）、目录约定（`index.md` vs `README.md` vs `_index.md` vs `_sidebar.md`）与插件边界各不相同（详见 [`00-dialects.md`](./00-dialects.md)）。

因此，每个接入的子模块遵循以下黄金准则：
- **语义与测试算例 100% 与母版对齐**；
- **仅在目标框架特定版本无法直通母版语法处，按该版本原生最佳实践做最小必要派生改写**；
- 主站在构建期自动将子模块派生文件与母版 `docs/*.md` 并排比对，直观量化方言锁定成本。

---

## 2. 标准六篇基准章节路由清单

每个接入的独立子模块均须提供以下 6 个标准章节（含 `04-directory/nested/` 嵌套子页）：

| 章节 ID | 对应母版文件 | 必测内容 |
| :--- | :--- | :--- |
| `index` | [`docs/index.md`](./index.md) | 框架与精确锁定版本清单、核心特性接入摘要、导航入口 |
| `01-annotations` | [`docs/01-annotations.md`](./01-annotations.md) | Frontmatter 说明、四类标准提示块、折叠块、原始 `> [!NOTE]` GFM Alert 直通兼容性实测 |
| `02-diagrams` | [`docs/02-diagrams.md`](./02-diagrams.md) | `flowchart TD`（含 `subgraph` 与中文标签）、`sequenceDiagram`（含 `alt` 与激活框）、`stateDiagram-v2` |
| `03-math` | [`docs/03-math.md`](./03-math.md) | 行内公式中英文混排基线、`aligned` 多行高斯积分推导、`bmatrix` 矩阵、`cases` 分段函数、字面量 `\$` 转义 |
| `04-directory` | [`docs/04-directory/index.md`](./04-directory/index.md) | 根目录隔离度 vs 目录深度、排序前缀 vs 干净 URL、`nested/` 多级子目录与侧边栏维护实测 |
| `05-code-blocks` | [`docs/05-code-blocks.md`](./05-code-blocks.md) | 代码块文件名标题栏、指定行高亮、带词法着色的行级增删 Diff、多语言运行时代码组（Tabs） |

---

## 3. 派生接入新版本子模块的标准 4 步流程

例如未来将图鉴中的 `hugo` 或 `docusaurus-v3` 升级为实测子模块：

1. **创建带版本号的独立仓库**：在 `page2401` 组织下创建公开仓库 `page2401/<ssg-version>`，补齐仓库 `Description` 与 `Website`（`https://page.2401.xyz/<ssg-version>/`）；`main` 分支仅存放纯工程源码、由 `docs/*.md` 派生适配的文档及 `.github/workflows/deploy-page.yml`（构建输出必须包含 `.nojekyll` 并推送到孤儿分支 `page`）。
2. **启用子仓库 GitHub Pages**：将 `page2401/<ssg-version>` 的 GitHub Pages 发布源设为 `page` 分支 `/`，即可自动通过 `https://page.2401.xyz/<ssg-version>/` 同源访问。
3. **挂载 Git Submodule**：在主仓库执行：
   ```bash
   git submodule add -b main https://github.com/page2401/<ssg-version>.git sites/<ssg-version>
   ```
4. **注册到 `sites.config.json` 并维护 `docs/sites/<ssg-version>.json`**：在主仓库 `sites.config.json` 的 `sites` 数组追加该子模块目录、精确跟踪包名与 5 篇文档路径，并在 [`docs/sites/`](./sites/index.md) 维护同名 `<ssg-version>.json`（含 `websiteUrl`、`githubUrl`、`tags`、`libs` 及 `github` 节点，可执行 `npm run sync:github` 自动刷新 GitHub API 历年提交数据与 `<ssg-version>.md` 表格），推送主仓库 `main` 分支后工作台与活跃度矩阵即自动更新。
