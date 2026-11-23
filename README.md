# page2401.github.io (`https://page.2401.xyz`)

模块化、带版本号锁定的**静态网站生成器（SSG）实测对比平台**。

围绕**专属标注与元数据（Frontmatter & Callouts）**、**流程图与时序图（Mermaid）**、**数学公式排版（LaTeX / MathJax / KaTeX）**三大核心维度，使用语义一致但适配各生成器特定大版本语法的“相似 `*.md`”基准测试文档进行并排实测对比。

## 架构特性

1. **主仓库只留纯源代码**：`main` 分支不包含任何构建产物，构建输出的静态页面与 `CNAME`（`page.2401.xyz`）由 GitHub Actions 自动推送至孤儿分支 `page`。
2. **独立版本子仓库 + Git Submodule**：每个纳入对比的框架大版本均为 `page2401` 组织下的独立仓库，各自拥有独立的 `main`（源码）与 `page`（静态产物）分支，既支持挂载到 `https://page.2401.xyz/<子模块名>/` 同源分屏预览，也支持单独克隆部署。
3. **真实源码与精确版本实时提取**：主站在构建期通过 [`scripts/generate-comparison-data.mjs`](./scripts/generate-comparison-data.mjs) 直接从 `sites/*` 子模块读取 `package.json` 锁定版本、真实 `*.md` 原文与工程配置文件。

## 当前已挂载版本子模块

| 子模块 ID | 独立仓库 | 线上子路径 | 核心锁定版本 |
| :--- | :--- | :--- | :--- |
| `vitepress-v1` | [`page2401/vitepress-v1`](https://github.com/page2401/vitepress-v1) | `/vitepress-v1/` | `vitepress@1.6.4` · `markdown-it-mathjax3@4.3.2` · `mermaid@11.17.2` |
| `astro7-starlight` | [`page2401/astro7-starlight`](https://github.com/page2401/astro7-starlight) | `/astro7-starlight/` | `astro@7.4.13` · `@astrojs/starlight@0.43.1` · `@astrojs/markdown-remark@7.3.10` · `katex@0.19.1` · `mermaid@12.3.0` |

## 克隆与本地全站联调

```bash
# 1. 连同所有子模块克隆源码
git clone --recurse-submodules https://github.com/page2401/page2401.github.io.git
cd page2401.github.io

# 2. 安装依赖并构建全部子站与对比总站
npm --prefix sites/vitepress-v1 install
npm --prefix sites/astro7-starlight install
npm install
npm run build:all

# 3. 启动本地同源全站预览（自动挂载 /、/vitepress-v1/、/astro7-starlight/）
npm run preview:all
```

## 扩展接入新版本子模块

详细规范请参见 [`spec/BENCHMARK_SPEC.md`](./spec/BENCHMARK_SPEC.md)：

1. 在 `page2401` 下创建独立仓库 `page2401/<ssg-version>`，配置 `main` -> Actions -> `page` 分支并开启 GitHub Pages。
2. 执行 `git submodule add -b main https://github.com/page2401/<ssg-version>.git sites/<ssg-version>`。
3. 在 [`sites.config.json`](./sites.config.json) 追加一项配置，提交推送即可自动出现在对比工作台与特性矩阵中。