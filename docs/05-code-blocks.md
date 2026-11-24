---
title: "05. 高阶代码块与语法高亮"
description: "标准 GFM 母版：测试代码块标题栏、行高亮、增删 Diff 着色与多语言代码切换组在 Shiki / Prism / Pygments / Chroma / Giallo 下的方言分化。"
---

# 05. 高阶代码块与语法高亮（母版 GFM 基准）

技术文档中超过 40% 的篇幅由代码块构成，但标准 CommonMark / GitHub Flavored Markdown **仅定义了围栏语言标识（```` ```ts ````）**，并未定义文件名标题栏、指定行高亮、带语法着色的行级 Diff 以及多语言 Tab 代码组。本文件作为原始 GFM 母版，记录最中立的标准写法，供各子模块派生对照。

## 1. 代码块文件名标题栏与基础语法高亮

在纯正 GitHub Markdown 中，代码块信息串（Info String）后的额外元数据会被忽略，因此母版只能在代码块上方以粗体路径标注文件名（派生到 VitePress 改写为 `[vite.config.ts]`，派生到 Starlight / Docusaurus / Fumadocs / Rspress / MkDocs 改写为 `title="vite.config.ts"`，派生到 Sphinx 改写为 `:caption:`）：

**`scripts/resolve-route.ts`**

```ts
export interface RouteContext {
  basePath: string
  slug: string
  cleanUrls: boolean
}

export function formatDocRoute(ctx: RouteContext): string {
  const prefix = ctx.basePath.endsWith('/') ? ctx.basePath : `${ctx.basePath}/`
  const normalized = ctx.slug.replace(/^\/+|\/+$/g, '')
  if (!normalized || normalized === 'index') return prefix
  return ctx.cleanUrls ? `${prefix}${normalized}/` : `${prefix}${normalized}.html`
}
```

## 2. 关键行聚焦与高亮（Line Highlighting）

当需要在长配置中引导读者注意第 `3` 行与第 `7–9` 行时，标准 GFM 仅能依赖代码注释提示（派生到各 SSG 时分别启用 `{3,7-9}`、`// [!code highlight]`、`hl_lines` 或 `:emphasize-lines:`）：

```json
{
  "id": "ssg-benchmark",
  "routeStyle": "clean",
  "strictZeroCdn": true,
  "markdown": {
    "mathEngine": "katex",
    "diagramEngine": "mermaid",
    "lineHighlight": true,
    "codeTransformers": ["diff", "focus"]
  }
}
```

## 3. 代码增删对比着色（Diff Highlighting）

标准 GFM 使用独立的 `diff` 语言标识表达补丁增删（优点是 GitHub 原生红绿着色，缺点是丢失了底层 TypeScript 关键字词法高亮；基于 Shiki 的现代框架在派生时可通过 `// [!code --]` 与 `// [!code ++]` 同时保留 TS 语法着色与增删背景）：

```diff
 export function mountSubsite(baseDir: string, subPath: string): string | null {
-  const cleanRel = decodeURIComponent(subPath).replace(/\.\./g, '')
-  return `${baseDir}/${cleanRel}`
+  const resolvedBase = path.resolve(baseDir)
+  const target = path.resolve(resolvedBase, decodeURIComponent(subPath).replace(/^\/+/, ''))
+  return target.startsWith(`${resolvedBase}${path.sep}`) ? target : null
 }
```

## 4. 多语言运行时命令组（Code Groups / Tabs）

面对跨语言工具链安装说明，标准 GFM 不支持原生横向标签页（Tabs），只能顺序平铺或使用 `<details>` 折叠（派生到 VitePress 改写为 `::: code-group`，MDX 系改写为 `<Tabs>`，MkDocs 改写为 `=== "Tab"`，Sphinx 改写为 `{tab-set}`）：

- **Node.js (`package.json`)**

```bash
npm ci && npm run build
```

- **Deno 2 (`deno.json`)**

```bash
deno task build
```

- **Python (`requirements.txt`)**

```bash
pip install -r requirements.txt && sphinx-build -b dirhtml . _build/dirhtml
```

- **Ruby (`Gemfile`)**

```bash
bundle install && bundle exec jekyll build
```

## 5. 四大底层高亮引擎能力对照小结

| 高亮引擎代表 | 典型采用框架 | 构建期零运行时 JS | 原生行号 / 行高亮 | 保留词法着色的 Diff |
| :--- | :--- | :--- | :--- | :--- |
| **Shiki / Expressive Code** | VitePress、Starlight、Fumadocs、Nextra、Rspress、Nuxt、Quartz | ✅ 纯静态内联样式 | ✅ `{1,3-5}` / `[!code highlight]` | ✅ `// [!code ++]` |
| **Prism.js** | Docusaurus、VuePress、Eleventy (plugin)、Gatsby | ✅ 静态 Token 类名 | ✅ `{1,3-5}` / 魔法注释 | ⚠️ 需配 diff-highlight 插件 |
| **Pygments / Rouge** | MkDocs Material、Sphinx、Pelican、Jekyll | ✅ Python/Ruby 编译直出 | ✅ `hl_lines` / `emphasize-lines` | ⚠️ 仅标准 `diff` 块红绿 |
| **Chroma / Giallo / hljs** | Hugo (Go Chroma)、Zola (Rust Giallo)、mdBook (hljs) | ✅ (mdBook 为客户端 hljs) | ✅ Hugo/Zola 原生 `hl_lines` | ⚠️ 仅标准 `diff` 块红绿 |
