# page2401.github.io (`https://page.2401.xyz`)

基于**一套中立母版（`docs/*.md`）派生多版本子模块**的静态网站生成器（SSG）跨框架与跨大版本实测对比平台。

---

## 核心理念：母版（Master） ──派生适配──▶ 各框架子模块（Derived）

0. **先看懂 `*.md` 的方言分裂与各主流生成器特色**：
   - **方言谱系导览**：[`docs/00-dialects.md`](./docs/00-dialects.md)（线上阅读：[`/master/00-dialects`](https://page.2401.xyz/master/00-dialects)）
   - **各生成器特色档案目录**：[`docs/generators/`](./docs/generators/index.md)（线上阅读：[`/master/generators/`](https://page.2401.xyz/master/generators/)），收录已挂载子模块及 Docusaurus、Hugo、MkDocs Material、Zola、mdBook、Rspress、Nextra、Hexo、Jekyll 的深度特色与软肋剖析。
1. **本站维护唯一原始母版（[`docs/`](./docs/)）**：
   - 本仓库 `docs/` 目录下保存不绑定任何特定生成器的 **标准 GitHub Flavored Markdown（GFM）母版文档集**（包含基础 YAML Frontmatter、`> [!NOTE]` 五类警报、原生 `<details>`、```` ```mermaid ```` 流程图与 `$...$` / `$$...$$` 公式，在 GitHub 网页端可直接原生渲染）。
   - 构建时同时通过 [`scripts/build-master-docs.mjs`](./scripts/build-master-docs.mjs) 编译为 [`https://page.2401.xyz/master/`](https://page.2401.xyz/master/) 作为标准 GFM 视觉参考基准。
2. **所有子模块均由母版派生（`sites/*`）**：
   - 由于不同生成器及不同大版本对提示框标注（`::: warning` vs `:::caution[标题]` vs `?>`）、目录首页约定（`index.md` vs `README.md` vs `_sidebar.md`）与插件能力支持不一，各独立子模块中的 `*.md` 均为在母版基础上**按最小必要改动原则派生适配**的版本。
   - 在对比工作台中选择 **`★ 本站母版 ↔ 任意子模块`**，高亮的差异行即为该框架强加给作者的真实方言改造成本。

---

## 本仓库（对比总站）自身的技术选型

为了避免对比总站自身受困于某单一前端框架的大版本演进，主仓库采用**零 UI 框架耦合**的轻量工程方案：

- **打包构建**：`vite@8.3.8`（底层基于 Rolldown，生产编译耗时约 `0.3s`）
- **前端实现**：**原生 TypeScript + Vanilla CSS**（CSS 变量驱动深浅色主题，并通过同源 `<iframe>` 联动母版预览与各子站主题切换）
- **母版参考渲染器**：Node.js 构建脚本 [`scripts/build-master-docs.mjs`](./scripts/build-master-docs.mjs)（基于 `marked@18.2.1` + `katex@0.19.1` + `mermaid@12.3.0` 将 `docs/*.md` 输出至 `dist/master/`）
- **构建期数据抽取**：[`scripts/generate-comparison-data.mjs`](./scripts/generate-comparison-data.mjs) 根据 [`sites.config.json`](./sites.config.json) 自动扫描母版 `docs/` 与各子模块 `sites/*` 的物理目录树、解析 `package.json` 锁定版本并提取真实 `*.md` 原文
- **本地同源联调**：基于 `node:http` 的零依赖服务 [`scripts/preview-all.mjs`](./scripts/preview-all.mjs)，单端口模拟 `/`、`/master/` 与全部子路径挂载
- **分支与自动部署**：`main` 分支仅保留纯源代码与母版 `docs/*.md`；GitHub Actions 构建后将静态产物与 `CNAME` 强制推送至孤儿分支 `page`

---

## 由母版派生的 7 个独立版本子模块

统一命名约定：每个子模块标识 `<id>` 同时对应本地子模块目录 `sites/<id>`、独立仓库 `page2401/<id>` 以及线上访问路径 `https://page.2401.xyz/<id>/`（各自独立拥有 `main` 源码分支与 `page` 产物分支）。

| 子模块（点击直达线上预览） | 架构派系 | 核心精确锁定版本 | 相对母版的典型派生特征与实测边界 |
| :--- | :--- | :--- | :--- |
| [**`vitepress-v1`**](https://page.2401.xyz/vitepress-v1/)（[源码](https://github.com/page2401/vitepress-v1)） | 编译型 (Vue 3 + Rollup) | `vitepress@1.6.4` · `mathjax3@4.3.2` · `mermaid@11.17.2` | 兼容母版 GFM Alert 并扩展 `::: tip`；根目录平铺需配 `srcExclude`；三方 Mermaid 插件受限停留在 v11 |
| [**`vitepress-v2`**](https://page.2401.xyz/vitepress-v2/)（[源码](https://github.com/page2401/vitepress-v2)） | 极速编译型 (Vite 8 Rolldown) | `vitepress@2.0.0-alpha.21` · `mermaid@12.3.0` | 构建比 v1 快 **3.4 倍**；启用 `srcDir: 'docs'` + `rewrites`，通过原生主题组件直连 Mermaid 12 |
| [**`vuepress-v1`**](https://page.2401.xyz/vuepress-v1/)（[源码](https://github.com/page2401/vuepress-v1)） | 初代经典型 (Vue 2 + Webpack 4) | `vuepress@1.9.10` · `katex@0.19.1` · `mermaid@10.9.8` | 无法识别母版 GFM Alert 与 `::: info`；首页须改名为 `README.md`；Node 22 须开启 `--openssl-legacy-provider` |
| [**`vuepress-v2`**](https://page.2401.xyz/vuepress-v2/)（[源码](https://github.com/page2401/vuepress-v2)） | 官方插件矩阵型 (Vue 3 + Vite) | `vuepress@2.0.0-rc.32` · `katex@0.19.1` · `mermaid@12.3.0` | 官方一等公民维护 Hint / Math / Chart 插件；延续 `README.md` 即目录首页与 `.html` 路由约定 |
| [**`docsify-v4`**](https://page.2401.xyz/docsify-v4/)（[源码](https://github.com/page2401/docsify-v4)） | 零预编译运行时 SPA | `docsify@4.13.1` · `flexible-alerts@1.3.0` · `mermaid@10.9.8` | 派生新增 `_sidebar.md`（强绑 `.nojekyll`）与 `?>`/`!>`；旧插件无法识别母版 `[!IMPORTANT]` 与 `[!CAUTION]` |
| [**`docsify-v5`**](https://page.2401.xyz/docsify-v5/)（[源码](https://github.com/page2401/docsify-v5)） | 新一代运行时引擎 | `docsify@5.1.0` · `katex@0.19.1` · `mermaid@12.3.0` | **零插件直接渲染母版全部 GFM Callouts**；重构 `core-dark` 主题，破坏性变更 `renderer.code` 签名 |
| [**`astro7-starlight`**](https://page.2401.xyz/astro7-starlight/)（[源码](https://github.com/page2401/astro7-starlight)） | 强类型 Content Layer | `astro@7.4.13` · `starlight@0.43.1` · `katex@0.19.1` · `mermaid@12.3.0` | 母版派生改动最大：迁入 3 层深 `src/content/docs/`、改写为 `:::caution[标题]`，Astro 7 须显式装 `@astrojs/markdown-remark` |

---

## 克隆与本地全站联调

```bash
git clone --recurse-submodules https://github.com/page2401/page2401.github.io.git
cd page2401.github.io

npm install
npm run build:all
npm run preview:all
```

新增派生版本子模块的标准接入规范请参见 [`docs/benchmark-spec.md`](./docs/benchmark-spec.md)（线上阅读：[`/master/benchmark-spec`](https://page.2401.xyz/master/benchmark-spec)）。