---
title: "Zola & mdBook 特色档案"
description: "Rust 生态双星：Zola 全能单二进制构建与 mdBook 经典的 SUMMARY.md 图书目录流派。"
---

# Zola & mdBook 特色剖析（图鉴收录 · Rust 零依赖流）

## 1. Zola（Rust 版“人性化 Hugo”）

- **核心特色**：与 Hugo 同样是单二进制毫秒级极速编译，且内置 Sass 编译、语法高亮与多语言搜索，**但模板引擎采用了极其易读的类 Jinja2 语法（Tera）**，显著降低了 Hugo Go Template 的学习陡坡。
- **目录与方言**：同样采用 `content/` + `_index.md` 分支章节约定，提示框与扩展元素依赖 Tera Shortcodes（`{% callout(type="warning") %}...{% end %}`）。

## 2. mdBook（《Rust 程序设计语言》同款电子书引擎）

- **核心特色**：专为**线性阅读的成体系技术书籍 / 教程**而生！整个目录结构只受控于 `src/SUMMARY.md` 一个纯 Markdown 列表文件（甚至如果在 `SUMMARY.md` 写了一个尚不存在的章节链接，运行 `mdbook build` 会贴心地自动帮你创建对应的空 `.md` 文件！）。
- **妥协与边界**：功能高度聚焦于“书”，不适合做复杂 API 门户或多维落地页；内置 MathJax 开关但扩展插件需要编写独立的预处理器可执行程序。
