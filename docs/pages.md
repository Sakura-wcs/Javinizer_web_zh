# 原版 Web 页面分析

采集时间：2026-06-19

目标页面：

- `http://127.0.0.1:8080/`
- `http://127.0.0.1:8080/browse`
- `http://127.0.0.1:8080/jobs`
- `http://127.0.0.1:8080/actresses`
- `http://127.0.0.1:8080/genres`
- `http://127.0.0.1:8080/words`
- `http://127.0.0.1:8080/settings`

## 路由与模块

| 路由 | 原文标题 | 中文含义 |
| --- | --- | --- |
| `/` | Javinizer Control Center | Javinizer 控制中心 |
| `/browse` | Browse & Scrape | 浏览与刮削 |
| `/jobs` | Jobs | 任务 |
| `/actresses` | Actress Database | 演员数据库 |
| `/genres` | Genre Replacements | 类型替换 |
| `/words` | Word Replacements | 词语替换 |
| `/settings` | Settings | 设置 |

## 翻译策略

翻译源分为两类：

- `exact`：稳定 UI 文案的精确匹配，例如按钮、标题、说明文字。
- `patterns`：动态短句和计数文本，例如 `235 files`、`Active jobs: 0`。

油猴脚本不会翻译明显的用户数据，包括文件路径、影片番号、视频文件名、演员名、片商名、影片标题和错误详情。

## 已知限制

- 设置页内部折叠面板较多，目前优先翻译入口级标题和说明。展开后的高级字段可以后续继续补充。
- 类型库和词库里有大量业务词条，项目只翻译 UI 控件，不默认翻译替换库内容。
- 原版页面如果新增路由，只需补充 `translations/zh-CN.json`，通常不需要改脚本。

