# Javinizer Web 中文翻译项目

本仓库维护 Javinizer 原版 Web UI 的中文翻译源和 Tampermonkey/油猴脚本。

## 目标

- 不修改 Javinizer 原版程序和配置。
- 只在浏览器端翻译 `http://127.0.0.1:8080/` 和 `http://localhost:8080/` 的 Web UI。
- 翻译源使用独立 JSON 文件，油猴脚本运行时从 GitHub Raw 地址加载。
- 保留用户数据、番号、路径、演员名、片名、错误详情，不做机器翻译或猜测性改写。

## 文件结构

```text
translations/zh-CN.json          # 简体中文翻译源
userscripts/javinizer-web-zh.user.js
src/translator-core.js           # 可测试的翻译核心逻辑
tests/translator-core.test.js    # Node 测试
docs/pages.md                    # 原版 Web 页面和词条覆盖说明
```

## 维护规则

- 翻译词条优先使用精确匹配。
- 动态计数、状态和时间类文本使用 `patterns` 正则规则。
- 不翻译明显的用户数据：
  - Windows/Unix 路径
  - 番号，如 `IPX-535`、`SONE-573`
  - 文件名、演员名、片商名、影片标题
  - 错误原文和日志详情
- 更新油猴脚本后必须运行：

```powershell
node --test tests\translator-core.test.js
```

## GitHub Raw 链接

油猴脚本默认读取：

```text
https://raw.githubusercontent.com/Sakura-wcs/Javinizer_web_zh/main/translations/zh-CN.json
```

