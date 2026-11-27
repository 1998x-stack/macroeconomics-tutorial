# 宏观经济学 · 从现象到机制

一套由 28 篇独立文章构成的中文宏观经济学开放课程，覆盖 GDP、价格、劳动市场、货币信用、IS–LM、AD–AS、政策、开放经济与增长。

- **站点首页**：`docs/index.html`
- **文章目录**：`docs/chapters/01.html` 至 `28.html`
- **在线地址（Pages 配置且工作流成功后）**：https://1998x-stack.github.io/macroeconomics-tutorial/
- **精修现状**：第 01—25 章已完成深度重构，逐章含独立证据账本（`chapters/evidence/`）；第 06—28 章的计算实验与动态 SVG 在离线环境随输入同步更新。第 26—28 章的图示、演算与证据账本已与前置章节统一，但其判断以框架和机制为主，具体数值请以各章「来源与阅读」列出的官方与央行来源为准。
- **本地阅读**：直接用浏览器打开 `docs/index.html`，不需要构建工具。
- **校验**：`python3 scripts/validate_site.py`；浏览器检查：`python3 scripts/browser_check.py`（需安装 Playwright + Chromium）。两项工具的实测覆盖范围如下：`validate_site.py` 检查 28 章的站内链接、图片 `alt`、`docs/assets/svg/` 下独立 SVG 的 `viewBox` 与 `<title>/<desc>`，以及 01—20 章各自唯一的 H1 与 `chapters/evidence/*.json` 证据账本字段；它**不检查** MathML、ARIA、`role` 等 Web 语义，也不扫描 HTML 内联 SVG。`browser_check.py` 覆盖 `index.html` 与 01—20 章，宽度 1440/390/360，检查横向溢出、断图、MathML 可见性、实验输出与动态图是否随输入更新、运行时错误。

## 项目结构

```text
├── docs/                      # GitHub Pages 发布根
│   ├── index.html              # 新课程入口
│   ├── chapters/01.html … 28.html
│   ├── chapters/evidence/      # 每篇证据账本
│   ├── assets/js/econ-labs.js  # 06–10 章节的计算实验和动态 SVG
│   ├── assets/js/econ-labs-basics.js   # 01–05、07 章节的离线图表（与数字输出同步）
│   ├── assets/js/econ-labs-advanced.js # 11–15 进阶实验
│   ├── assets/js/econ-labs-open.js     # 16–20 债务、通胀、风险、BOP、汇率实验
│   ├── assets/js/econ-labs-growth.js   # 21–25 增长、创意、周期、预期、DSGE实验
│   ├── assets/code/rbc_baseline.mod    # Dynare RBC 基准模型
│   ├── assets/css/site.css     # 新版样式
│   ├── assets/js/experiments.js
│   ├── assets/svg/             # 自制 SVG
│   └── 01.html … 28.html      # 旧 Pages URL 的兼容重定向
├── scripts/validate_site.py
├── scripts/verify_rbc_baseline.py
├── .github/workflows/         # 校验、部署
├── AGENTS.md                  # 编写与事实验收规则
└── 01.html … 28.html          # 根目录旧文件，过渡期保留
```

## 内容约定

每篇采用「问题 → 机制图 → 数学和统计定义 → 构造案例 → 边界条件 → 可查证来源」路线。**示例数字不是实际统计数据**。不同国家的宏观数据不能忽略机构、基期、统计范围和修订方式直接拼接。

## GitHub Pages 部署

`.github/workflows/pages.yml` 将 `docs/` 发布到 Pages。合并后在仓库 **Settings → Pages → Build and deployment** 将源设置为 **GitHub Actions**，以实际发布工作流成功及页面可访问为准。PR 不等于正式发布。

可视化教学原则参考 [Olah-style-posts](https://github.com/1998x-stack/Olah-style-posts)，文字和 SVG 重新独立创作。
