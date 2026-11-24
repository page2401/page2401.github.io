---
title: "pelican 站点与生命周期档案 (Pelican)"
description: "预留扩展位 sites/pelican：Python 社区最具代表性的静态博客引擎（类似 Python 界的 Hexo/Jekyll），原生支持 Markdown 与 rST 双格式文章流与 RSS 聚合"
---

# `pelican` 站点档案（Pelican · 图鉴扩展位）

- **预留子模块路径**：`sites/pelican`（与本档案 `docs/sites/pelican.md` 及 `pelican.json` 严格 1:1 对应）
- **官方网站**：[https://getpelican.com/](https://getpelican.com/) · **上游仓库**：[https://github.com/getpelican/pelican](https://github.com/getpelican/pelican)
- **底层技术栈**：Python + Pelican + Jinja2 + Python-Markdown + Pygments

## 1. 生命周期定位（开始 / 活跃 / 废弃时间）

| 指标 | 时间节点与演进状态 |
| :--- | :--- |
| **开始时间** | `2010-10-16` 创立开源 |
| **活跃时间** | 2011–2018 为 Python 静态博客黄金期；现保持每年稳定维护更新 |
| **废弃 / 演进状态** | 核心持续维护，但在技术手册场景已被 MkDocs Material / Sphinx 全面分流 |

## 2. 独立 JSON 元数据与 GitHub 历年提交活跃度

<!-- GITHUB_API_TABLE_START -->
> 独立结构化元数据文件：[`docs/sites/pelican.json`](./pelican.json)（含完整元数据、Tag、依赖 Lib 与 `github` API 节点，采样日期：`2026-11-23`）

### 站点元数据与底层依赖库（Libs）

| 元数据属性 | 内容详情 |
| :--- | :--- |
| **官方网站 (Website)** | [https://getpelican.com/](https://getpelican.com/) |
| **GitHub 源码仓库** | [getpelican/pelican](https://github.com/getpelican/pelican) |
| **包管理仓库 (Registry)** | [https://pypi.org/project/pelican/](https://pypi.org/project/pelican/) |
| **分类标签 (Tags)** | `#ssg` · `#python` · `#blog-engine` · `#jinja2` · `#markdown` · `#rst` · `#atom-rss` · `#classic` |
| **运行时与打包器** | Python >= 3.9 · Pelican Static Generator |
| **UI 与 Markdown 引擎** | Jinja2 模板引擎 · `Python-Markdown / Docutils (rST)` |
| **高亮与全文检索** | Pygments · pelican-search (Stork / Tipue) |
| **数学公式与流程图库** | pelican-render-math (MathJax) ； markdown-mermaidjs 或主题脚本注入 |
| **核心依赖库 (Core Libs)** | `pelican`、`jinja2`、`markdown`、`pygments`、`feedgenerator` |
| **本子站实测锁定版本** | `pelican@4.12.0` · `jinja2@3.1.6` · `markdown@3.11.3` · `pymdown-extensions@13.1.2` · `pygments@2.19.2` · `docutils@0.23` · `unidecode@1.4.0` |

### ⚡ 同源 6 章冷构建、浏览器查看渲染与产物体积实测（`benchmark` 节点）

| 冷构建耗时 | 首屏正文就绪 (FCP) | 站内切页 / 图表渲染 | 单页传输 (Gzip) | 整站总体积 | JS 原始 / Gzip | 正文 `<script>` | 离线搜索 / AI |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| **1.13 s (1,128 ms)** | **908 ms** (464 ms) | 116 ms / 1722 ms | 1651.5 KB (7 请求) | 6833.2 KB (74 文件) | 5682.2 KB / **1632.6 KB** | `4` 个 | 无内置离线索引 |

### GitHub 仓库 API 指标快照

| 官方仓库 | 创建日期 | 最近推送 | Stars | 默认分支总提交 | 峰值年份 (提交数) | 最新 Release |
| :--- | :--- | :--- | ---: | ---: | :--- | :--- |
| [`getpelican/pelican`](https://github.com/getpelican/pelican) | `2010-10-16` | `2026-11-09` | ★ 13,378 | 4,045 | `2012` (804) | `4.12.0` (2026-04-20) |

### GitHub 主分支历年提交活跃度表（`2010–2026`）

| 年份 | 提交数 (Commits) | 占峰值比 | 活跃度趋势条 | 阶段状态 |
| :--- | ---: | ---: | :--- | :--- |
| `2010` | **238** | 29.6% | `█████░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2011` | **414** | 51.5% | `████████░░░░░░░░` | 🔵 稳健迭代 |
| `2012` | **804** | 100.0% | `████████████████` | 🔥 历史最高峰 |
| `2013` | **643** | 80.0% | `█████████████░░░` | 🟢 高频活跃 |
| `2014` | **272** | 33.8% | `█████░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2015` | **254** | 31.6% | `█████░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2016` | **144** | 17.9% | `███░░░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2017` | **90** | 11.2% | `██░░░░░░░░░░░░░░` | 🟡 低频维护 |
| `2018` | **200** | 24.9% | `████░░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2019` | **171** | 21.3% | `███░░░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2020` | **187** | 23.3% | `████░░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2021` | **112** | 13.9% | `██░░░░░░░░░░░░░░` | 🟡 低频维护 |
| `2022` | **62** | 7.7% | `█░░░░░░░░░░░░░░░` | 🟡 低频维护 |
| `2023` | **182** | 22.6% | `████░░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2024` | **139** | 17.3% | `███░░░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2025` | **74** | 9.2% | `█░░░░░░░░░░░░░░░` | 🟡 低频维护 |
| `2026` | **59** | 7.3% | `█░░░░░░░░░░░░░░░` | 🟡 低频维护 |
<!-- GITHUB_API_TABLE_END -->

## 3. 核心差异化特色与选型边界

1. **Python 开发者的个人博客经典**：如果你熟悉 Jinja2 模板与 Python 脚本，希望快速构建带多语言翻译、Atom/RSS 订阅与代码高亮的静态技术博客，Pelican 依然轻巧可靠。
2. **边界**：与 Hexo、Jekyll 一样围绕“按时间发布的文章（Articles）”建模，不适合组织深层嵌套的产品 API 文档树。
