---
title: "静态网站生成器 (SSG) 特色档案总览"
description: "按底层技术栈与设计哲学分类的主流静态网站生成器深度特色剖析索引。"
---

# 静态网站生成器（SSG）流派与特色档案目录

本目录（`page2401.github.io/docs/generators/`）收录各主流静态网站生成器的**架构特色、核心杀手锏、目录与方言取舍及选型建议**。其中标记为 **「★ 已挂载实测」** 的生成器已在 `sites/*` 下建立独立版本子模块并接入分屏对比工作台；其余主流生成器作为全景选型参考收录，后续可随时按统一规范派生挂载为新子模块。

## 按技术流派索引

### 一、Vue 生态文档派（`markdown-it` + Vue SFC）
- [**VitePress（v1 / v2）**](./vitepress.md) `★ 已挂载实测` —— 尤雨溪团队打造的新一代极简文档标杆，v2 切入 Vite 8 Rolldown 后构建提速 3.4 倍。
- [**VuePress（v1 / v2）**](./vuepress.md) `★ 已挂载实测` —— 前端文档生成器鼻祖，开创 `README.md` 即首页与三冒号容器传统，v2 拥有完善的官方插件矩阵。

### 二、现代多框架与 React / MDX 派（`unified` / `remark` + JSX）
- [**Astro Starlight**](./astro-starlight.md) `★ 已挂载实测` —— 基于 Astro 孤岛架构（Islands）与 Content Layer 强类型校验，默认零多余客户端 JS。
- [**Docusaurus（v3）**](./docusaurus.md) `图鉴收录` —— Meta 开源旗舰，**原生多版本文档快照（Versioning）与国际化**能力在大型开源项目中难逢敌手。
- [**Rspress & Nextra**](./rspress-nextra.md) `图鉴收录` —— 字节跳动基于 Rust Rspack 打造的极速 MDX 文档站，以及 Vercel 生态基于 Next.js 的全栈文档方案。

### 三、零预编译浏览器运行时派（Runtime SPA）
- [**Docsify（v4 / v5）**](./docsify.md) `★ 已挂载实测` —— 无需编译 HTML，浏览器直接拉取 `.md` 渲染，v5 内核已原生支持全部 GFM Callouts。

### 四、原生编译型极速派（Go / Rust 单二进制）
- [**Hugo**](./hugo.md) `图鉴收录` —— Go 语言编写的静态编译速度之王，独创 `_index.md` Page Bundles 目录模型与 Go Template Shortcodes。
- [**Zola & mdBook**](./zola-mdbook.md) `图鉴收录` —— Rust 单二进制零依赖部署；mdBook 以 `SUMMARY.md` 开创了最适合编写电子书的目录范式。

### 五、Python 科研工程派与传统静态博客双雄
- [**MkDocs Material**](./mkdocs-material.md) `图鉴收录` —— Python 生态文档天花板，`pymdown-extensions` 四空格缩进块语法极具辨识度，学术与硬件文档首选。
- [**Hexo & Jekyll**](./hexo-jekyll.md) `图鉴收录` —— GitHub Pages 默认内置引擎（`.nojekyll` 的渊源所在）与中文独立博客时代的启蒙双雄。
