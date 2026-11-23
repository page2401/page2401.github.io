# 相似 `*.md` 多版本静态网站对比基准规范

## 1. 为什么采用“相似 `*.md`”而非字节级完全相同的 Markdown？

在真实文档工程中，不同静态网站生成器（甚至同一生成器的不同大版本）对扩展语法有着各自的方言与生态边界：

1. **Frontmatter 与元数据校验**：
   - 如 `vitepress-v1` 采用宽松 YAML，可任意附加字段并使用 `outline: [2, 3]`；
   - 如 `astro7-starlight` 基于 Astro 7 Content Layer Zod Schema 强类型校验，未知字段会直接阻断构建，目录层级需写作 `tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 }`。
2. **专属提示块 / 标注（Callouts / Admonitions）**：
   - `vitepress-v1` 使用空格分隔语法 `::: warning 自定义标题`，并原生支持 `::: details` 折叠容器与 GitHub `> [!NOTE]` 引用警报；
   - `astro7-starlight` 使用 `remark-directive` 语法 `:::caution[自定义标题]`（标题必须在方括号内，且警告名为 `caution`），折叠块采用原生 `<details>`。
3. **流程图（Mermaid）与大版本插件约束**：
   - `vitepress-v1` 通过 `vitepress-plugin-mermaid` 接入，但受插件 `peerDependencies` 限制锁定在 `mermaid@11.x`；
   - `astro7-starlight` 默认由 `astro-expressive-code` 接管代码块，需通过前置 `remark` 插件在高亮前转换节点，可直接打包最新 `mermaid@12.x`。
4. **数学公式（LaTeX Math）与底层解析器变革**：
   - `vitepress-v1` 内置 `math: true` 配合 `markdown-it-mathjax3@4.x`（尚不兼容 v5）在构建期输出内联矢量 SVG；
   - `astro7-starlight` 因 Astro 7 默认切换至 Sätteri 解析器，使用 `remark-math` + `rehype-katex` 时必须额外显式安装 `@astrojs/markdown-remark`，构建期输出 KaTeX HTML + CSS Webfont。

因此，本项目的核心原则是：**语义与测试算例 100% 对齐，标记语法遵循各框架特定版本的原生最佳实践**，再通过主站对比工作台将两者的“渲染结果”、“原始 `*.md` 差异”和“工程配置成本”并排呈现。

---

## 2. 标准四篇基准章节清单

每个接入的独立子模块都必须提供以下 4 个章节路由：

| 章节 ID | 路由约定 | 必测内容 |
| :--- | :--- | :--- |
| `index` | `/` | 框架与精确锁定版本清单、三大特性接入摘要、导航入口 |
| `01-annotations` | `/01-annotations` | Frontmatter 说明、Info/Tip(自定义标题)/Warning(Caution)/Danger 四类提示块、折叠块、原始 `> [!NOTE]` GFM Alert 兼容性实测 |
| `02-diagrams` | `/02-diagrams` | `flowchart TD`（含 `subgraph` 与中文标签）、`sequenceDiagram`（含 `alt` 与生命线激活）、`stateDiagram-v2` |
| `03-math` | `/03-math` | 行内公式中英文混排基线、`aligned` 多行高斯积分推导、`bmatrix` 注意力与雅可比矩阵、`cases` 分段函数、字面量 `\$` 转义 |
| `04-directory` | `/04-directory/` | 根目录隔离度 vs 目录深度、本地文件名前缀排序 vs Frontmatter `order` 干净 URL、`nested/` 多级子目录与自动侧边栏（`autogenerate` vs 手写配置）实测 |

---

## 3. 新增版本子模块的标准 4 步流程

例如未来新增 `vitepress-v2` 或 `hugo-v0.145`：

1. **创建独立仓库**：在 `page2401` 组织下创建公开仓库 `page2401/<ssg-version>`，`main` 分支存放源码与 `.github/workflows/deploy-page.yml`（构建输出含 `.nojekyll` 并推送到孤儿分支 `page`）。
2. **启用子仓库 GitHub Pages**：将 `page2401/<ssg-version>` 的 GitHub Pages 发布源设为 `page` 分支 `/`，即可自动通过 `https://page.2401.xyz/<ssg-version>/` 同源访问。
3. **挂载 Git Submodule**：在主仓库执行：
   ```bash
   git submodule add -b main https://github.com/page2401/<ssg-version>.git sites/<ssg-version>
   ```
4. **注册到 `sites.config.json`**：在 `sites` 数组追加该子模块的目录、跟踪包名与 4 篇 `.md` 路径，推送主仓库 `main` 分支后对比工作台与矩阵即自动生效。
