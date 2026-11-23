---
title: "VitePress 特色与生命周期档案 (v1 & v2)"
description: "Vue 3 生态轻量技术文档标杆：生命周期时间线、双轨标注、编译期 MathJax 3 SVG 与 v2 Rolldown 极速构建。"
---

# VitePress 特色剖析（已挂载：`vitepress-v1` / `vitepress-v2`）

- **实测子站**：[vitepress-v1 (`1.6.4`)](/vitepress-v1/) · [vitepress-v2 (`2.0.0-alpha.21`)](/vitepress-v2/)
- **上游仓库**：`vuejs/vitepress`
- **底层技术栈**：Node.js + Vite（v1 基于 Rollup，v2 基于 Vite 8 Rolldown）+ Vue 3 + `markdown-it`

## 生命周期档案

| 阶段指标 | `vitepress-v1` 分支 | `vitepress-v2` 分支 |
| :--- | :--- | :--- |
| **开始时间** | `2020-04-30` 立项开源；`2024-03` 发布 `v1.0.0` 正式版 | `2025` 启动 v2 架构演进 |
| **活跃时间** | `2022–2025` 为绝对主力稳定版（当前锁定 `1.6.4`） | `2025–至今` 高频迭代中（`2.0.0-alpha.21` 发布于 `2026-10-25`，最近提交 `2026-11`） |
| **废弃 / 演进时间** | **未废弃（当前生产稳定推荐）**；待 `2.0` 转正后将转入安全维护 | **无（下一代官方演进主线）** |

## 1. 最核心的差异化特色

1. **极高信噪比的开箱体验**：默认主题审美克制、首屏极快、内置基于 MiniSearch 的纯本地全文检索，几乎无需改样式即可直接作为开源库官方文档上线。
2. **双轨标注兼容度最佳**：既保留了 Vue 生态习惯的 `::: info / tip / warning / danger / details` 容器，又**零插件原生兼容 GitHub `> [!NOTE]` 五类引用警报**，从标准 GFM 母版迁移文档改造成本极低。
3. **构建期 MathJax 3 矢量公式**：只需一行 `markdown: { math: true }` + `markdown-it-mathjax3@4.3.2`，在构建期直接把公式烘焙成内联 `<svg>`，客户端无需下载几十上百 KB 的数学 Webfont 字体文件。
4. **v2 Rolldown 跨代提速**：本站实测相同基准套件下，`vitepress-v2` 构建时间由 v1 的 **28.4 秒缩短至 8.2 秒（提速 3.4 倍）**。

## 2. 架构妥协与真实痛点

- **默认不支持自动生成多级侧边栏**：内核没有类似 Starlight 的 `autogenerate`，每新建一篇 `.md` 都必须手动去 `.vitepress/config.mts` 注册，否则会沦为无导航入口的“孤岛页”。
- **根目录平铺 vs `srcDir` 的目录两难**：平铺在根目录时必须配置 `srcExclude: ['README.md']` 防止误编译仓库说明；而一旦配置 `srcDir: 'docs'`，静态目录 `public/` 又被迫迁入 `docs/public/`。
- **三方插件大版本断层**：社区插件 `vitepress-plugin-mermaid@2.0.17` 在 v1 下把 `mermaid` 锁在 `11.x`，在 v2 下因 `peer vitepress@^1.0` 直接报错，反倒不如自己写 30 行原生 Vue 组件稳妥。

## 3. 最佳适用场景

开源库 API 文档、前端工程规范手册、追求轻量现代 UI 且偶尔需要在文档中直接嵌入 `<script setup>` 交互演示 Vue 组件的项目。
