# page2401.github.io (`https://page.2401.xyz`)

模块化、精确锁定版本号的**静态网站生成器（SSG）跨框架与跨大版本实测对比平台**。

围绕**专属标注与元数据（Frontmatter & Callouts）**、**流程图与时序图（Mermaid）**、**数学公式排版（LaTeX / MathJax / KaTeX）**以及**目录结构与路由取舍（不可能三角）**四大维度，使用语义一致但遵循各生成器特定大版本原生语法的“相似 `*.md`”基准套件进行并排实测对比。

---

## 本仓库（对比总站）自身的技术选型

为了避免对比总站自身受困于某单一前端框架的大版本演进，同时保证极致的构建速度与中立性，本主仓库采用**零运行时框架依赖**的轻量工程方案：

- **打包构建**：`vite@8.3.8`（底层基于 Rolldown，生产编译耗时约 `0.3s`）
- **前端实现**：**原生 TypeScript + Vanilla CSS**（不依赖 Vue / React 等 UI 框架；CSS 变量原生驱动深浅色主题，并通过同源 `<iframe>` 联动子站主题切换）
- **构建期数据抽取**：Node.js 原生 ESM 脚本 [`scripts/generate-comparison-data.mjs`](./scripts/generate-comparison-data.mjs)，在 `prebuild` 阶段根据声明式注册表 [`sites.config.json`](./sites.config.json) 直接从 `sites/*` 子模块扫描物理目录树、解析 `package.json` 精确版本并读取真实 `*.md` 原文与配置文件，杜绝手工复制失真
- **本地同源联调**：基于 Node.js 原生 `node:http` 的零依赖服务 [`scripts/preview-all.mjs`](./scripts/preview-all.mjs)，在本地单端口模拟 GitHub Organization Pages 的根路径 `/` 与各子路径挂载
- **分支与自动部署**：`main` 分支仅保留纯源代码与 `.gitmodules` 指针；GitHub Actions（Node.js 22，`submodules: recursive`）构建后通过 `peaceiris/actions-gh-pages@v4` 将静态产物与 `CNAME` 强制发布至孤儿分支 `page`

---

## 已挂载的 7 个版本子模块

统一命名约定：每个子模块标识 `<id>` 同时对应本地子模块目录 `sites/<id>`、独立仓库 `page2401/<id>` 以及线上访问路径 `https://page.2401.xyz/<id>/`（均保持 `main` 存源码、`page` 发产物）。

| 子模块（点击直达线上预览） | 架构派系 | 核心精确锁定版本 | 实测代表性特征 |
| :--- | :--- | :--- | :--- |
| [**`vitepress-v1`**](https://page.2401.xyz/vitepress-v1/)（[源码](https://github.com/page2401/vitepress-v1)） | 编译型 (Vue 3 + Rollup) | `vitepress@1.6.4` · `mathjax3@4.3.2` · `mermaid@11.17.2` | 根目录平铺需配 `srcExclude`；三方 Mermaid 插件受 `peer` 限制停留在 v11 |
| [**`vitepress-v2`**](https://page.2401.xyz/vitepress-v2/)（[源码](https://github.com/page2401/vitepress-v2)） | 极速编译型 (Vite 8 Rolldown) | `vitepress@2.0.0-alpha.21` · `mermaid@12.3.0` | 构建比 v1 快 **3.4 倍**；通过原生主题组件绕开旧插件约束直连 Mermaid 12 |
| [**`vuepress-v1`**](https://page.2401.xyz/vuepress-v1/)（[源码](https://github.com/page2401/vuepress-v1)） | 初代经典型 (Vue 2 + Webpack 4) | `vuepress@1.9.10` · `katex@0.19.1` · `mermaid@10.9.8` | 缺 `::: info` 与 GFM Alert；Node 22 须开启 `--openssl-legacy-provider` |
| [**`vuepress-v2`**](https://page.2401.xyz/vuepress-v2/)（[源码](https://github.com/page2401/vuepress-v2)） | 官方插件矩阵型 (Vue 3 + Vite) | `vuepress@2.0.0-rc.32` · `katex@0.19.1` · `mermaid@12.3.0` | 官方一等公民维护 Hint / Math / Chart 插件；延续 `README.md` 即目录首页约定 |
| [**`docsify-v4`**](https://page.2401.xyz/docsify-v4/)（[源码](https://github.com/page2401/docsify-v4)） | 零预编译运行时 SPA | `docsify@4.13.1` · `flexible-alerts@1.3.0` · `mermaid@10.9.8` | `_sidebar.md` 强绑 `.nojekyll`；旧插件不识别 `[!IMPORTANT]` 与 `[!CAUTION]` |
| [**`docsify-v5`**](https://page.2401.xyz/docsify-v5/)（[源码](https://github.com/page2401/docsify-v5)） | 新一代运行时引擎 | `docsify@5.1.0` · `katex@0.19.1` · `mermaid@12.3.0` | 内核零插件原生解析全部 GFM Callouts；重构 `core-dark` 主题，变更 `renderer.code` 签名 |
| [**`astro7-starlight`**](https://page.2401.xyz/astro7-starlight/)（[源码](https://github.com/page2401/astro7-starlight)） | 强类型 Content Layer | `astro@7.4.13` · `starlight@0.43.1` · `katex@0.19.1` · `mermaid@12.3.0` | 强制 3 层深 `src/content/docs/`；Astro 7 改用 Sätteri 后跑 Remark 须显式装 `@astrojs/markdown-remark` |

---

## 克隆与本地全站联调

```bash
git clone --recurse-submodules https://github.com/page2401/page2401.github.io.git
cd page2401.github.io

# 安装并构建全部子站与对比总站后启动本地同源预览
npm install
npm run build:all
npm run preview:all
```

新增其他版本子模块的标准 4 步接入规范请参见 [`spec/BENCHMARK_SPEC.md`](./spec/BENCHMARK_SPEC.md)。