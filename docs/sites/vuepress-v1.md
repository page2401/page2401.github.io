---
title: "vuepress-v1 站点与生命周期档案 (VuePress 1.x Legacy / EOL)"
description: "对应子模块 sites/vuepress-v1：Vue 2 + Webpack 4 初代文档站生命周期、归零提交曲线与历史遗产剖析。"
---

# `vuepress-v1` 站点档案（VuePress 1.x 初代经典 · 已 EOL）

- **本地子模块路径**：`sites/vuepress-v1`（与本档案 `docs/sites/vuepress-v1.md` 严格 1:1 对应）
- **独立子站仓库**：[`page2401/vuepress-v1`](https://github.com/page2401/vuepress-v1) · **线上实测**：[`/vuepress-v1/`](/vuepress-v1/)
- **跨代对照子站**：[`vuepress-v2` (Vue 3 + Vite 重构版)](./vuepress-v2.md)
- **锁定核心依赖**：`vuepress@1.9.10` + `katex@0.19.1` + `mermaid@10.9.8`（UMD 末代兼容版）

## 1. 生命周期定位（开始 / 活跃 / 废弃时间）

| 指标 | 时间节点与演进状态 |
| :--- | :--- |
| **开始时间** | **`2018-04-05`** 由尤雨溪创立 `vuejs/vuepress`，开创前端组件化静态文档站先河 |
| **活跃时间** | **`2018–2020` 为黄金统治期**（`2018` 首年狂飙 `1,297` 次提交，`2019` 年 `521` 次）；`2021` 后陡降至个位数维护 |
| **废弃 / 演进状态** | **已实质废弃（EOL）**：末次发版 `v1.9.10` 停留在 **`2023-08-14`**，底层 Vue 2 于 **`2023-12-31`** 正式 EOL，上游仓库 `2025` 与 `2026` 连续两年提交数为 **`0`** |

## 2. 上游 GitHub API 实测数据与历年提交活跃度

<!-- GITHUB_API_TABLE_START -->
> 独立结构化元数据文件：[`docs/sites/vuepress-v1.json`](./vuepress-v1.json)（含完整元数据、Tag、依赖 Lib 与 `github` API 节点，采样日期：`2026-11-23`）

### 站点元数据与底层依赖库（Libs）

| 元数据属性 | 内容详情 |
| :--- | :--- |
| **官方网站 (Website)** | [https://v1.vuepress.vuejs.org/](https://v1.vuepress.vuejs.org/) |
| **GitHub 源码仓库** | [vuejs/vuepress](https://github.com/vuejs/vuepress) |
| **包管理仓库 (Registry)** | [https://www.npmjs.com/package/vuepress/v/1.9.10](https://www.npmjs.com/package/vuepress/v/1.9.10) |
| **分类标签 (Tags)** | `#ssg` · `#vue2` · `#webpack4` · `#commonjs` · `#markdown-it` · `#readme-index` · `#html-suffix` · `#legacy` · `#eol` |
| **运行时与打包器** | Node.js（Node 18+ 须开启 --openssl-legacy-provider） · Webpack 4 |
| **UI 与 Markdown 引擎** | Vue 2.7 + Vue Router 3 · `markdown-it@8` |
| **高亮与全文检索** | Prism.js · @vuepress/plugin-search（标题索引） |
| **数学公式与流程图库** | katex（extendMarkdown 自定义规则） ； mermaid@10.9.8（UMD 末代兼容版） |
| **核心依赖库 (Core Libs)** | `vue@2`、`webpack@4`、`vue-router@3`、`markdown-it@8`、`prismjs` |
| **本子站实测锁定版本** | `vuepress@1.9.10` · `katex@0.19.1` · `mermaid@10.9.8` |

### ⚡ 同源 5 章基准冷构建耗时与产物体积实测（`benchmark` 节点）

| 冷构建耗时 | 产物文件数 | 总产物体积 | HTML 体积 | JS 原始 / Gzip | CSS 原始 / Gzip | 正文 `<script>` 数 | 离线搜索 / AI |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| **23.46 s (23,464 ms)** | 102 | 5076.5 KB | 166.0 KB | 3788.7 KB / **1128.0 KB** | 70.2 KB / 14.8 KB | `6` 个 | 无内置离线索引 |

### GitHub 仓库 API 指标快照

| 官方仓库 | 创建日期 | 最近推送 | Stars | 默认分支总提交 | 峰值年份 (提交数) | 最新 Release |
| :--- | :--- | :--- | ---: | ---: | :--- | :--- |
| [`vuejs/vuepress`](https://github.com/vuejs/vuepress) | `2018-04-05` | `2024-08-07` | ★ 22,715 | 2,152 | `2018` (1,297) | `v1.9.10` (2023-08-14) |

### GitHub 主分支历年提交活跃度表（`2018–2026`）

| 年份 | 提交数 (Commits) | 占峰值比 | 活跃度趋势条 | 阶段状态 |
| :--- | ---: | ---: | :--- | :--- |
| `2018` | **1,297** | 100.0% | `████████████████` | 🔥 历史最高峰 |
| `2019` | **521** | 40.2% | `██████░░░░░░░░░░` | 🟢 高频活跃 |
| `2020` | **202** | 15.6% | `██░░░░░░░░░░░░░░` | 🔵 稳健迭代 |
| `2021` | **92** | 7.1% | `█░░░░░░░░░░░░░░░` | 🟡 低频维护 |
| `2022` | **16** | 1.2% | `█░░░░░░░░░░░░░░░` | 🟡 低频维护 |
| `2023` | **23** | 1.8% | `█░░░░░░░░░░░░░░░` | 🟡 低频维护 |
| `2024` | **1** | 0.1% | `█░░░░░░░░░░░░░░░` | 🟡 低频维护 |
| `2025` | **0** | 0.0% | `░░░░░░░░░░░░░░░░` | ⚪ 零提交停滞 |
| `2026` | **0** | 0.0% | `░░░░░░░░░░░░░░░░` | ⚪ 零提交停滞 |
<!-- GITHUB_API_TABLE_END -->

## 3. 本子站实测历史断层与遗产价值

1. **Node 22 + OpenSSL 3 启动即崩**：因底层锁定 Webpack 4（使用已被 OpenSSL 3 禁用的旧版 MD4 哈希），现代 Node 环境下构建必须注入 `NODE_OPTIONS=--openssl-legacy-provider`。
2. **依赖膨胀与 ES2022 语法壁垒**：仅安装基础核心即拉取 **1,507 个 npm 子包**；且 Webpack 4 无法解析 `mermaid@11/12` 的现代 ESM 语法，只能锁定最后提供 UMD 产物的 `mermaid@10.9.8` 静态注入。
3. **方言缺失警示**：默认仅内置 `::: tip / warning / danger`，**原生不支持 `::: info`（直接把 `::: info` 原样暴露在网页上！）**，也完全不支持 GitHub `> [!NOTE]` 警报块。
4. **选型建议**：仅供存量历史仓库维护参考，**严禁任何新项目继续选用 `vuepress-v1`**。
