---
title: "mkdocs-material 站点与生命周期档案 (Material for MkDocs)"
description: "对应实测子模块 sites/mkdocs-material：Python 科研工程文档标杆、十年提交曲线与四空格缩进方言。"
---

# `mkdocs-material` 站点档案（Material for MkDocs · ★ 已挂载实测）

- **本地子模块路径**：`sites/mkdocs-material` · **独立子站仓库**：[`page2401/mkdocs-material`](https://github.com/page2401/mkdocs-material) · **线上实测**：[`/mkdocs-material/`](/mkdocs-material/)（与本档案 `docs/sites/mkdocs-material.md` 严格 1:1 对应）
- **上游官方仓库**：[`squidfunk/mkdocs-material`](https://github.com/squidfunk/mkdocs-material)
- **底层技术栈**：Python + `MkDocs` + `Material for MkDocs` + `pymdown-extensions`

## 1. 生命周期定位（开始 / 活跃 / 废弃时间）

| 指标 | 时间节点与演进状态 |
| :--- | :--- |
| **开始时间** | 母项目 MkDocs 始于 `2014` 年；**`squidfunk/mkdocs-material` 于 `2016-01-28` 创立开源** |
| **活跃时间** | **`2016–至今` 十年主力**（`2020–2023` 年均提交近千次，近年 `v9.x` 功能高度完备转入稳健维护） |
| **废弃 / 演进状态** | **`v8` 及更早大版本已停更废弃**；**`v9.x` 当前稳定活跃** |

## 2. 上游 GitHub API 实测数据与历年提交活跃度

<!-- GITHUB_API_TABLE_START -->
> 独立结构化元数据文件：[`docs/sites/mkdocs-material.json`](./mkdocs-material.json)（含完整元数据、Tag、依赖 Lib 与 `github` API 节点，采样日期：`2026-11-23`）

### 站点元数据与底层依赖库（Libs）

| 元数据属性 | 内容详情 |
| :--- | :--- |
| **官方网站 (Website)** | [https://squidfunk.github.io/mkdocs-material/](https://squidfunk.github.io/mkdocs-material/) |
| **GitHub 源码仓库** | [squidfunk/mkdocs-material](https://github.com/squidfunk/mkdocs-material) |
| **包管理仓库 (Registry)** | [https://pypi.org/project/mkdocs-material/](https://pypi.org/project/mkdocs-material/) |
| **分类标签 (Tags)** | `#ssg` · `#python` · `#scientific-docs` · `#pymdown-extensions` · `#indent-admonitions` · `#code-annotations` · `#mkdocs-yml` |
| **运行时与打包器** | Python >= 3.8 · MkDocs Static Builder |
| **UI 与 Markdown 引擎** | Jinja2 Templates + Material Custom Elements · `Python-Markdown + pymdown-extensions` |
| **高亮与全文检索** | Pygments + pymdownx.highlight · 内置多语言离线全文检索插件 |
| **数学公式与流程图库** | pymdownx.arithmatex + KaTeX / MathJax ； pymdownx.superfences（原生暗色自适应 Mermaid） |
| **核心依赖库 (Core Libs)** | `mkdocs`、`mkdocs-material`、`markdown`、`pymdown-extensions`、`pygments` |
| **本子站实测锁定版本** | `mkdocs-material@9.8.2` · `mkdocs@1.6.1` · `pymdown-extensions@13.1.2` · `markdown@3.11.3` · `pygments@2.21.0` |

### ⚡ 同源 5 章基准冷构建耗时与产物体积实测（`benchmark` 节点）

| 冷构建耗时 | 产物文件数 | 总产物体积 | HTML 体积 | JS 原始 / Gzip | CSS 原始 / Gzip | 正文 `<script>` 数 | 离线搜索 / AI |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| **2.09 s (2,092 ms)** | 119 | 9402.4 KB | 173.3 KB | 6716.6 KB / **1907.1 KB** | 170.2 KB / 27.6 KB | `8` 个 | Lunr.js 静态索引 |

### GitHub 仓库 API 指标快照

| 官方仓库 | 创建日期 | 最近推送 | Stars | 默认分支总提交 | 峰值年份 (提交数) | 最新 Release |
| :--- | :--- | :--- | ---: | ---: | :--- | :--- |
| [`squidfunk/mkdocs-material`](https://github.com/squidfunk/mkdocs-material) | `2016-01-28` | `2026-11-19` | ★ 27,643 | 6,794 | `2020` (1,321) | `9.8.2` (2026-11-19) |

### GitHub 主分支历年提交活跃度表（`2016–2026`）

| 年份 | 提交数 (Commits) | 占峰值比 | 活跃度趋势条 | 阶段状态 |
| :--- | ---: | ---: | :--- | :--- |
| `2016` | **240** | 18.2% | `███░░░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2017` | **656** | 49.7% | `████████░░░░░░░░` | 🟢 高频活跃 |
| `2018` | **195** | 14.8% | `██░░░░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2019` | **502** | 38.0% | `██████░░░░░░░░░░` | 🟢 高频活跃 |
| `2020` | **1,321** | 100.0% | `████████████████` | 🔥 历史最高峰 |
| `2021` | **1,004** | 76.0% | `████████████░░░░` | 🟢 高频活跃 |
| `2022` | **882** | 66.8% | `███████████░░░░░` | 🟢 高频活跃 |
| `2023` | **1,171** | 88.6% | `██████████████░░` | 🟢 高频活跃 |
| `2024` | **484** | 36.6% | `██████░░░░░░░░░░` | 🔵 稳健迭代 |
| `2025` | **250** | 18.9% | `███░░░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2026` | **89** | 6.7% | `█░░░░░░░░░░░░░░░` | 🟡 低频维护 |
<!-- GITHUB_API_TABLE_END -->

## 3. 核心杀手锏与架构妥协

1. **科研与工程排版天花板**：内置代码行内悬浮批注（Code Annotations）、内容选项卡、暗色自适应 Mermaid 与 KaTeX/MathJax，是 FastAPI、Pydantic 等 AI/Python 顶级项目的标配。
2. **高度专有的 `!!!` 四空格缩进方言**：采用 `!!! warning "标题"` 加 4 空格缩进正文（折叠块为 `??? note`），书写清爽但与前端 CommonMark / GFM / `:::` 生态互不兼容，迁出时须脚本批量转换。
