# 宏观经济学 · 从现象到机制

一套由 28 篇独立文章构成的中文宏观经济学开放课程，覆盖 GDP、价格、劳动市场、货币信用、IS–LM、AD–AS、政策、开放经济与增长。

- **站点首页**：`docs/index.html`
- **文章目录**：`docs/chapters/01.html` 至 `28.html`
- **在线地址（Pages 配置且工作流成功后）**：https://1998x-stack.github.io/macroeconomics-tutorial/
- **已深度精修**：第 01—10 章。其中第 06—10 章新增 18 张独立 SVG、5 项交互小实验及机构来源账本；第 11—28 章仍为原始迁移稿，待逐章审阅。
- **本地阅读**：直接用浏览器打开 `docs/index.html`，不需要构建工具。
- **校验**：`python3 scripts/validate_site.py`；浏览器检查：`python3 scripts/browser_check.py`（需安装 Playwright + Chromium）。

## 项目结构

```text
├── docs/                      # GitHub Pages 发布根
│   ├── index.html              # 新课程入口
│   ├── chapters/01.html … 28.html
│   ├── chapters/evidence/      # 每篇证据账本
│   ├── assets/js/econ-labs.js  # 06–10 章节的计算实验和动态 SVG
│   ├── assets/css/site.css     # 新版样式
│   ├── assets/js/experiments.js
│   ├── assets/svg/             # 自制 SVG
│   └── 01.html … 28.html      # 旧 Pages URL 的兼容重定向
├── scripts/validate_site.py
├── .github/workflows/         # 校验、部署
├── AGENTS.md                  # 编写与事实验收规则
└── 01.html … 28.html          # 根目录旧文件，过渡期保留
```

## 内容约定

每篇采用「问题 → 机制图 → 数学和统计定义 → 构造案例 → 边界条件 → 可查证来源」路线。**示例数字不是实际统计数据**。不同国家的宏观数据不能忽略机构、基期、统计范围和修订方式直接拼接。

## GitHub Pages 部署

`.github/workflows/pages.yml` 将 `docs/` 发布到 Pages。合并后在仓库 **Settings → Pages → Build and deployment** 将源设置为 **GitHub Actions**，以实际发布工作流成功及页面可访问为准。PR 不等于正式发布。

可视化教学原则参考 [Olah-style-posts](https://github.com/1998x-stack/Olah-style-posts)，文字和 SVG 重新独立创作。
