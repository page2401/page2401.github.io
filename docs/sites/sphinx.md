---
title: "sphinx 站点与生命周期档案 (Sphinx (MyST))"
description: "预留扩展位 sites/sphinx：Python 官方与 Linux 内核同款工业级出版系统：拥有全行业最严谨的跨文档符号交叉引用、API 自动抽取与原生 LaTeX PDF 排版"
---

# `sphinx` 站点档案（Sphinx (MyST) · 图鉴扩展位）

- **预留子模块路径**：`sites/sphinx`（与本档案 `docs/sites/sphinx.md` 及 `sphinx.json` 严格 1:1 对应）
- **官方网站**：[https://www.sphinx-doc.org/](https://www.sphinx-doc.org/) · **上游仓库**：[https://github.com/sphinx-doc/sphinx](https://github.com/sphinx-doc/sphinx)
- **底层技术栈**：Python + Sphinx 8 + Docutils + MyST-Parser + Furo / PyData 主题

## 1. 生命周期定位（开始 / 活跃 / 废弃时间）

| 指标 | 时间节点与演进状态 |
| :--- | :--- |
| **开始时间** | `2008-03-21` 创立开源 |
| **活跃时间** | 2008–至今（Python 官方、Linux 内核、PyTorch 与 Jupyter 生态核心文档基石） |
| **废弃 / 演进状态** | **无（当前持续活跃维护中）** |

## 2. 独立 JSON 元数据与 GitHub 历年提交活跃度

<!-- GITHUB_API_TABLE_START -->
> 独立结构化元数据文件：[`docs/sites/sphinx.json`](./sphinx.json)（含完整元数据、Tag、依赖 Lib 与 `github` API 节点，采样日期：`2026-11-23`）

### 站点元数据与底层依赖库（Libs）

| 元数据属性 | 内容详情 |
| :--- | :--- |
| **官方网站 (Website)** | [https://www.sphinx-doc.org/](https://www.sphinx-doc.org/) |
| **GitHub 源码仓库** | [sphinx-doc/sphinx](https://github.com/sphinx-doc/sphinx)（协同仓库：[executablebooks/MyST-Parser](https://github.com/executablebooks/MyST-Parser)） |
| **包管理仓库 (Registry)** | [https://pypi.org/project/Sphinx/](https://pypi.org/project/Sphinx/) |
| **分类标签 (Tags)** | `#ssg` · `#python` · `#scientific-publishing` · `#myst-markdown` · `#restructuredtext` · `#cross-reference` · `#latex-pdf` |
| **运行时与打包器** | Python >= 3.10 · Sphinx Builder（同时输出 HTML / LaTeX PDF / ePub / Manpage） |
| **UI 与 Markdown 引擎** | Jinja2 + Furo / PyData Sphinx Theme · `Docutils + MyST-Parser (markdown-it-py)` |
| **高亮与全文检索** | Pygments · Sphinx 内置静态语言分词全文索引 |
| **数学公式与流程图库** | sphinx.ext.mathjax（原生内置 amsmath 编号与公式交叉引用！） ； sphinxcontrib-mermaid |
| **核心依赖库 (Core Libs)** | `sphinx`、`docutils`、`myst-parser`、`markdown-it-py`、`pygments`、`jinja2` |

### GitHub 仓库 API 指标快照

| 官方仓库 | 创建日期 | 最近推送 | Stars | 默认分支总提交 | 峰值年份 (提交数) | 最新 Release |
| :--- | :--- | :--- | ---: | ---: | :--- | :--- |
| [`sphinx-doc/sphinx`](https://github.com/sphinx-doc/sphinx) | `2015-01-02` | `2026-11-23` | ★ 8,104 | 22,461 | `2018` (2,633) | `v9.2.0` (2026-10-21) |
| [`executablebooks/MyST-Parser`](https://github.com/executablebooks/MyST-Parser) | `2020-02-13` | `2026-11-16` | ★ 904 | 594 | `2020` (209) | `v5.2.0` (2026-11-10) |

### GitHub 双仓库协同历年提交活跃度表（`2015–2026`）

| 年份 | `sphinx-doc/sphinx` | `executablebooks/MyST-Parser` | 合计提交 | 合计活跃趋势条 |
| :--- | ---: | ---: | ---: | :--- |
| `2015` | 694 | — | **694** | `████░░░░░░░░░░░░` |
| `2016` | 1,757 | — | **1,757** | `██████████░░░░░░` |
| `2017` | 2,010 | — | **2,010** | `████████████░░░░` |
| `2018` | 2,633 | — | **2,633** | `███████████████░` |
| `2019` | 1,729 | — | **1,729** | `██████████░░░░░░` |
| `2020` | 2,582 | 209 | **2,791** | `████████████████` |
| `2021` | 2,059 | 95 | **2,154** | `████████████░░░░` |
| `2022` | 1,117 | 64 | **1,181** | `███████░░░░░░░░░` |
| `2023` | 692 | 95 | **787** | `█████░░░░░░░░░░░` |
| `2024` | 1,146 | 49 | **1,195** | `███████░░░░░░░░░` |
| `2025` | 775 | 17 | **792** | `█████░░░░░░░░░░░` |
| `2026` | 62 | 65 | **127** | `█░░░░░░░░░░░░░░░` |
<!-- GITHUB_API_TABLE_END -->

## 3. 核心差异化特色与选型边界

1. **前端 SSG 难以企及的学术出版与交叉引用深度**：Sphinx 原为编写 Python 官方文档而生（2015 迁入 GitHub 前已在 SVN/Mercurial 演进七年）。借助 `autodoc` 抽取 Python Docstring、公式与图表自动全局编号以及直接生成高精度 LaTeX 印刷级 PDF，至今仍是科学计算（NumPy、SciPy、PyTorch）不可替代的标准。
2. **MyST（Markedly Structured Text）桥梁**：过去 Sphinx 强迫写繁琐的 `.rst`（reStructuredText）；如今接入 `MyST-Parser` 后，即可在 `.md` 中通过 ```` ```{note} ```` 与 ```` ```{toctree} ```` 享受 Sphinx 100% 的底层威力。
