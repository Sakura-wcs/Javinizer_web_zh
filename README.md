# Javinizer Web 简体中文

这是 Javinizer 原版 Web UI 的浏览器端中文翻译项目。它不修改 Javinizer 程序本体，只通过 Tampermonkey/油猴脚本在本地 Web 页面加载后替换 UI 文案。

## 安装

1. 安装 Tampermonkey 或 Violentmonkey。
2. 打开脚本文件：

   `userscripts/javinizer-web-zh.user.js`

3. 将脚本内容安装到油猴。
4. 打开 Javinizer 原版 Web：

   `http://127.0.0.1:8080/`

脚本默认只在以下地址生效：

- `http://127.0.0.1:8080/*`
- `http://localhost:8080/*`

## 翻译源

油猴脚本运行时会读取 GitHub Raw 翻译源：

```text
https://raw.githubusercontent.com/Sakura-wcs/Javinizer_web_zh/main/translations/zh-CN.json
```

如果 GitHub Raw 暂时不可访问，脚本会使用内置的精简兜底词表，至少保证导航和常用按钮可读。

## 覆盖范围

当前翻译覆盖：

- 登录页
- 控制台
- 浏览与刮削
- 任务/历史
- 演员数据库
- 类型替换
- 词语替换
- 设置入口
- 常见计数、状态和动态按钮

脚本会使用 `MutationObserver` 监听页面变化，因此 WebSocket 推送、切换页面、任务状态刷新后会自动补翻译。

## 不翻译的内容

为避免破坏业务数据，脚本默认跳过：

- Windows/Unix 路径
- 视频文件名
- 番号
- 演员名、片商名、影片标题
- 日志和错误详情
- 时间戳

## 开发验证

```powershell
node --test tests\translator-core.test.js
```

## 维护翻译

新增翻译优先加入 `translations/zh-CN.json` 的 `exact` 字段。动态文本、计数文本和状态文本加入 `patterns`。

示例：

```json
{
  "exact": {
    "Start Scrape": "开始刮削"
  },
  "patterns": [
    { "match": "^(\\d+) files$", "replace": "$1 个文件" }
  ]
}
```

