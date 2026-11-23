---
title: "01. 专属标注与元数据"
description: "标准 GFM 母版：使用最通用的 YAML 元数据、GitHub Alerts (> [!NOTE]) 与原生 HTML <details> 编写。"
---

# 01. 专属标注与元数据（母版 GFM 基准）

不同静态网站生成器对“提示框 / 标注（Callouts / Admonitions）”和页面元数据的语法约定存在显著分歧。本文件为**未经任何框架方言污染的原始 GFM 母版**，各子模块对应文件均由此派生改造。

## 1. Frontmatter 元数据机制

母版仅保留跨平台最通用的两个基础 YAML 字段：

- **当前页标题字段**：`title: "01. 专属标注与元数据"`
- **页面摘要字段**：`description: "..."`
- **派生观察点**：当派生到各框架时，VitePress 往往追加 `outline: [2, 3]` 与内联 `<Badge>`；Astro Starlight 强制要求通过 Zod Schema 校验并改写为嵌套的 `tableOfContents` 与 `sidebar.badge`；而 Docsify 若不加装插件甚至无法剥离这段 YAML。

## 2. 标准提示语义块（母版采用 GFM Alerts 表达）

在纯标准 GitHub Markdown 母版中，不存在 `::: warning` 或 `:::caution[标题]` 等私有三冒号语法，所有提示语义统一采用标准 GFM 引用警报表达（各子模块在派生时再将其改写为各自的 `:::` 或 `?>` 原生容器以对比表现）：

> [!NOTE]
> 默认信息提示块：静态站点对比平台的每个子模块均独立维护 `main`（源码）与 `page`（构建产物）双分支，互不污染提交历史。

> [!TIP]
> **性能优化建议（自定义标题语义）**：在派生到三冒号体系时，VitePress / VuePress 写作 `::: tip 性能优化建议`，而 Astro Starlight 必须写作方括号形式 `:::tip[性能优化建议]`。

> [!WARNING]
> **版本边界注意**：注意区分各派系关键字命名——VitePress 与 VuePress 使用 `warning`，Starlight 使用 `caution`，Docsify 传统语法则使用 `!>`。

> [!CAUTION]
> **不可逆分支覆盖警告**：自动化流水线在向 `page` 分支推送构建产物时会启用 `force_orphan: true`，切勿在 `page` 分支直接手工修改代码！

## 3. 可折叠详情容器（母版采用标准 HTML `<details>`）

标准 CommonMark / GFM 使用原生 `<details>` 与 `<summary>` 标签实现折叠（VitePress 与 VuePress 子模块在派生时将其改写为各自的 `::: details` 语法进行测试）：

<details>
<summary>点击展开查看母版折叠容器源码结构</summary>

```markdown
> [!TIP]
> 母版使用纯正 GFM 语法，在 GitHub 仓库网页端可直接原样渲染。
```

除了代码块，折叠容器内同样支持列表、表格与数学公式 $f(x) = x^2 + 1$。

</details>

## 4. GitHub 风格引用警报（GFM Alerts）跨框架直通测试

以下三段在**所有 7 个派生子模块中均保持一字不改**，用于测试：如果不做任何方言改写、直接把母版 `.md` 丢进目标生成器，哪些框架能原样渲染，哪些会退化为普通引用文本：

> [!NOTE]
> 这是一段标准的 GitHub Flavored Markdown `[!NOTE]` 警报文本，用于检验各生成器对母版语法的零改造直通能力。

> [!IMPORTANT]
> 跨平台迁移 Markdown 文档时，是否原生兼容 `> [!IMPORTANT]` 与 `> [!WARNING]` 直接决定了母版文档的派生改造成本。

> [!CAUTION]
> 若目标生成器未内置 GFM Alert 解析器（如 VuePress v1、Starlight 默认配置、Docsify v4 旧插件），上方标记会退化为普通引用块并原样露出 `[!CAUTION]` 字符串。
