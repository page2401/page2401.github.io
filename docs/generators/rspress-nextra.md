---
title: "Rspress & Nextra 特色与生命周期档案"
description: "现代前端新锐：Rspress (2023–至今极度活跃) 与 Nextra (2020–至今) 的生命周期对比与特色剖析。"
---

# Rspress & Nextra 特色剖析（图鉴收录 · 新锐 React/Rust 文档框架）

## 生命周期档案对照

| 阶段指标 | Rspress (`web-infra-dev/rspress`) | Nextra (`shuding/nextra`) |
| :--- | :--- | :--- |
| **开始时间** | **`2023-06-27`** 由字节跳动 Web Infra 团队开源 | **`2020-06-15`** 由 Shu Ding（Vercel 核心成员）开源 |
| **活跃时间** | **`2023–至今` 极高频迭代上升期**（`v2.1.4` 发布于 `2026-11-19`，最近提交 `2026-11-23`） | `2021–2025` 为 React/Vercel 社区爆款；**`2026` 转入低频平缓维护期**（最近提交 `2026-07-31`） |
| **废弃 / 演进时间** | `v1` 已平滑升级至 **`v2.x`（当前极度活跃，无废弃风险）** | **Nextra v1/v2 (Pages Router) 已进入历史淘汰阶段**；v3/v4 (App Router) 维护放缓，部分 Vercel/Next.js 新文档站开始分流至 Fumadocs 或 Starlight |

---

## 1. Rspress（字节跳动出品 · Rust Rspack + MDX RS）

- **核心特色**：用 Rust 编写的 `Rspack` + `mdx-rs` 解决了传统 React/Docusaurus 文档站在页面规模破千后的构建缓慢痛点（编译速度比传统 JS 管线快 5~10 倍）；同时结合了 VitePress 的清爽 UI 与 Docusaurus 的 `_meta.json` 目录编排能力。
- **目录流派**：采用每个目录下的 `_meta.json` 控制当前层级文件的顺序与中文分组名（与 Docusaurus `_category_.json` 异曲同工，同样有 JSON 文件散落目录的取舍）。

## 2. Nextra（Vercel 生态 · Next.js + MDX）

- **核心特色**：直接运行在 Next.js 之上——当你的主站本身就是一个大型 Next.js 全栈 SaaS 应用，希望把 `/docs` 无缝集成在同一个仓库、复用同一套用户鉴权与 React 组件库时，Nextra 是最顺滑的选择。
- **目录流派**：采用 `_meta.js` / `_meta.ts` 控制目录导航，支持在导航配置中直接写 JSX 逻辑，但耦合了完整的 Next.js 升级节奏（如 Pages Router 向 App Router 迁移的阵痛）。
