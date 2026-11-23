---
title: "Docusaurus 特色与生命周期档案 (v1–v3)"
description: "Meta 开源 React 旗舰文档生成器：2017 至今三代生命周期、原生多版本文档快照与 _category_.json 流派。"
---

# Docusaurus 特色剖析（图鉴收录 · React + MDX 3）

- **上游仓库**：`facebook/docusaurus`
- **底层技术栈**：Node.js + React 18/19 + Webpack / Rspack (`@docusaurus/faster`) + MDX 3

## 生命周期档案

| 阶段指标 | 时间节点与状态 |
| :--- | :--- |
| **开始时间** | **`2017-06-20`** 由 Meta（原 Facebook）开源团队创立；`2022-08` 正式发布历时四年重写的 React 架构 `v2.0`；`2023-10` 发布 MDX 3 架构 `v3.0` |
| **活跃时间** | **`2018–至今` 持续稳健维护**（最新 `v3.10.2` 发布于 `2026-07-10`，最近代码提交 `2026-11-20`） |
| **废弃 / 演进时间** | **Docusaurus v1 已于 `2022` 正式废弃 EOL**；**v2 (MDX 1) 已停止新特性开发**；**`v3.x` 当前主力活跃维护中** |

## 1. 不可替代的杀手锏特色

1. **业界最成熟的“文档多版本管理（Docs Versioning）”**：只需一行 CLI 命令 `docusaurus docs:version 1.0`，就能为当前文档自动创建历史版本快照（`versioned_docs/version-1.0`）并自动生成顶部版本切换下拉框！对于需要同时维护 v1、v2、v3 多代 API 文档的大型基础软件（如 React Native、Jest、Supabase），这是 VitePress 与 Starlight 原生最难望其项背的能力。
2. **`_category_.json` 解决自动侧边栏命名难题**：在开启自动侧边栏扫描时，Docusaurus 允许在任意子目录放一个 `_category_.json`（声明 `{ "label": "嵌套子目录", "position": 2 }`），精准补上了 Starlight `autogenerate` 直接暴露英文文件夹名的短板。
3. **文档 + 博客 + 独立营销落地页三合一**：天然内置双引擎（Docs 插件 + Blog 插件 + React Pages），无需拼凑即可支撑完整开源产品官网。

## 2. 架构妥协与真实痛点

- **MDX 3 语法严格度高**：升级至 v3（MDX 3）后，旧 Markdown 里常见的裸 `<` 号（如 `<= 10ms` 或 `<T>`）和未转义 `{}` 会直接导致 Acorn/JSX 编译失败，迁移存量散漫 Markdown 文档清洗成本较高。
- **目录散落 JSON 与包体偏重**：纯文档文件夹中会混入大量 `_category_.json`；传统 Webpack 构建在数千页规模下偏慢（近年已推出基于 Rust Rspack 的 `@docusaurus/faster` 缓解）。
- **提示块方言**：采用 `:::note`、`:::tip`、`:::info`、`:::warning`、`:::danger`（标题支持空格或方括号 `:::tip[标题]`）。
