---
title: "Rspress & Nextra 特色档案"
description: "现代前端新锐：基于 Rust Rspack 极速编译的 Rspress 与基于 Next.js App Router 的 Nextra。"
---

# Rspress & Nextra 特色剖析（图鉴收录 · 新锐 React/Rust 文档框架）

## 1. Rspress（字节跳动出品 · Rust Rspack + MDX RS）

- **核心特色**：用 Rust 编写的 `Rspack` + `mdx-rs` 解决了传统 React/Docusaurus 文档站在页面规模破千后的构建缓慢痛点（编译速度比传统 JS 管线快 5~10 倍）；同时结合了 VitePress 的清爽 UI 与 Docusaurus 的 `_meta.json` 目录编排能力。
- **目录流派**：采用每个目录下的 `_meta.json` 控制当前层级文件的顺序与中文分组名（与 Docusaurus `_category_.json` 异曲同工，同样有 JSON 文件散落目录的取舍）。

## 2. Nextra（Vercel 生态 · Next.js + MDX）

- **核心特色**：直接运行在 Next.js 之上——当你的主站本身就是一个大型 Next.js 全栈 SaaS 应用，希望把 `/docs` 无缝集成在同一个仓库、复用同一套用户鉴权与 React 组件库时，Nextra 是最顺滑的选择。
- **目录流派**：采用 `_meta.js` / `_meta.ts` 控制目录导航，支持在导航配置中直接写 JSX 逻辑，但耦合了完整的 Next.js 升级节奏（如 Pages Router 向 App Router 迁移的阵痛）。
