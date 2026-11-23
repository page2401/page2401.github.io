# page2401.github.io (`https://page.2401.xyz`)

模块化、带版本号锁定的**静态网站生成器（SSG）跨框架与跨大版本实测对比平台**。

围绕**专属标注与元数据（Frontmatter & Callouts）**、**流程图与时序图（Mermaid）**、**数学公式排版（LaTeX / MathJax / KaTeX）**以及**目录结构与路由取舍（不可能三角）**四大核心维度，使用语义一致但适配各生成器特定大版本语法的“相似 `*.md`”基准测试套件进行并排实测对比。

## 当前已挂载的 7 个版本子模块

| 子模块 ID | 独立仓库 | 线上子路径 | 架构派系与核心锁定版本 |
| :--- | :--- | :--- | :--- |
| `vitepress-v1` | [`page2401/vitepress-v1`](https://github.com/page2401/vitepress-v1) | `/vitepress-v1/` | 现代编译型 · `vitepress@1.6.4` · `markdown-it-mathjax3@4.3.2` · `mermaid@11.17.2` |
| `vitepress-v2` | [`page2401/vitepress-v2`](https://github.com/page2401/vitepress-v2) | `/vitepress-v2/` | 极速编译型 (Rolldown) · `vitepress@2.0.0-alpha.21` · `mermaid@12.3.0` |
| `vuepress-v1` | [`page2401/vuepress-v1`](https://github.com/page2401/vuepress-v1) | `/vuepress-v1/` | 初代经典型 (Vue 2 + Webpack 4) · `vuepress@1.9.10` · `katex@0.19.1` · `mermaid@10.9.8` |
| `vuepress-v2` | [`page2401/vuepress-v2`](https://github.com/page2401/vuepress-v2) | `/vuepress-v2/` | 官方插件矩阵型 (Vue 3 + Vite) · `vuepress@2.0.0-rc.32` · `katex@0.19.1` · `mermaid@12.3.0` |
| `docsify-v4` | [`page2401/docsify-v4`](https://github.com/page2401/docsify-v4) | `/docsify-v4/` | 零预编译运行时 · `docsify@4.13.1` · `flexible-alerts@1.3.0` · `katex@0.19.1` · `mermaid@10.9.8` |
| `docsify-v5` | [`page2401/docsify-v5`](https://github.com/page2401/docsify-v5) | `/docsify-v5/` | 新一代运行时 (原生 GFM Callout) · `docsify@5.1.0` · `katex@0.19.1` · `mermaid@12.3.0` |
| `astro7-starlight` | [`page2401/astro7-starlight`](https://github.com/page2401/astro7-starlight) | `/astro7-starlight/` | 强类型 Content Layer · `astro@7.4.13` · `@astrojs/starlight@0.43.1` · `katex@0.19.1` · `mermaid@12.3.0` |

## 克隆与本地全站联调

```bash
git clone --recurse-submodules https://github.com/page2401/page2401.github.io.git
cd page2401.github.io

# 安装并构建全部子站与对比总站后启动同源预览
npm install
npm run build:all
npm run preview:all
```

新增其他版本子模块请参见 [`spec/BENCHMARK_SPEC.md`](./spec/BENCHMARK_SPEC.md)。