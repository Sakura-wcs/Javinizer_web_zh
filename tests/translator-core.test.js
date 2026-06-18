const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  createTranslator,
  shouldSkipText,
  isSupportedJavinizerUrl,
} = require('../src/translator-core');

const dictionary = {
  locale: 'zh-CN',
  exact: {
    Dashboard: '控制台',
    Scrape: '刮削',
    Jobs: '任务',
    'Start Scrape': '开始刮削',
    'Scrape 0 Files': '刮削 0 个文件',
    'Review & Organize': '检查并整理',
  },
  patterns: [
    { match: '^(\\d+) files$', replace: '$1 个文件' },
    { match: '^(\\d+) done$', replace: '$1 个完成' },
    { match: '^(\\d+) failed$', replace: '$1 个失败' },
    { match: '^Active jobs: (\\d+)$', replace: '活动任务：$1' },
  ],
};

test('supports only local Javinizer web URLs on port 8080', () => {
  assert.equal(isSupportedJavinizerUrl('http://127.0.0.1:8080/'), true);
  assert.equal(isSupportedJavinizerUrl('http://127.0.0.1:8080/jobs'), true);
  assert.equal(isSupportedJavinizerUrl('http://localhost:8080/settings'), true);
  assert.equal(isSupportedJavinizerUrl('http://127.0.0.1:8097/'), false);
  assert.equal(isSupportedJavinizerUrl('https://github.com/Sakura-wcs/Javinizer_web_zh'), false);
});

test('translates exact UI labels and regex status counters', () => {
  const translator = createTranslator(dictionary);

  assert.equal(translator.translateText('Dashboard'), '控制台');
  assert.equal(translator.translateText('Review & Organize'), '检查并整理');
  assert.equal(translator.translateText('235 files'), '235 个文件');
  assert.equal(translator.translateText('233 done'), '233 个完成');
  assert.equal(translator.translateText('2 failed'), '2 个失败');
  assert.equal(translator.translateText('Active jobs: 0'), '活动任务：0');
});

test('does not translate likely user data or media metadata', () => {
  assert.equal(shouldSkipText('E:\\Backup\\ZW\\2-JP\\240218\\ADN-396.ts'), true);
  assert.equal(shouldSkipText('/mnt/media/JP-Plex/MOODYZ/MIDV-818.ts'), true);
  assert.equal(shouldSkipText('IPZZ-611'), true);
  assert.equal(shouldSkipText('Jun 19, 2026, 4:58 AM'), true);
  assert.equal(shouldSkipText('Javinizer Control Center'), false);
});

test('walks a DOM tree and translates text, placeholders, titles, and aria labels', () => {
  const translator = createTranslator(dictionary);
  const button = {
    nodeType: 1,
    attributes: {
      title: 'Start Scrape',
      'aria-label': 'Review & Organize',
      placeholder: 'Dashboard',
    },
    childNodes: [
      { nodeType: 3, nodeValue: 'Scrape 0 Files' },
    ],
  };
  translator.translateElement(button);

  assert.equal(button.attributes.title, '开始刮削');
  assert.equal(button.attributes['aria-label'], '检查并整理');
  assert.equal(button.attributes.placeholder, '控制台');
  assert.equal(button.childNodes[0].nodeValue, '刮削 0 个文件');
});

test('real zh-CN dictionary contains required Javinizer web entries', () => {
  const dictionaryPath = path.join(__dirname, '..', 'translations', 'zh-CN.json');
  const realDictionary = JSON.parse(fs.readFileSync(dictionaryPath, 'utf8'));
  const translator = createTranslator(realDictionary);

  assert.equal(translator.translateText('Browse & Scrape'), '浏览与刮削');
  assert.equal(translator.translateText('Operation Mode'), '操作模式');
  assert.equal(translator.translateText('File Operations'), '文件操作');
  assert.equal(translator.translateText('235 files'), '235 个文件');
  assert.equal(translator.translateText('Active jobs: 0'), '活动任务：0');
});

test('real zh-CN dictionary covers expanded settings fields', () => {
  const dictionaryPath = path.join(__dirname, '..', 'translations', 'zh-CN.json');
  const realDictionary = JSON.parse(fs.readFileSync(dictionaryPath, 'utf8'));
  const translator = createTranslator(realDictionary);

  assert.equal(translator.translateText('Host'), '主机');
  assert.equal(translator.translateText('Allowed Directories'), '允许访问的目录');
  assert.equal(translator.translateText('Max Files Per Scan'), '每次扫描最大文件数');
  assert.equal(translator.translateText('Request Timeout Seconds'), '请求超时时间（秒）');
  assert.equal(translator.translateText('Binary Path'), '浏览器路径');
  assert.equal(translator.translateText('Window Width'), '窗口宽度');
  assert.equal(translator.translateText('Apply To Primary'), '写回主字段');
  assert.equal(translator.translateText('Overwrite Existing Target'), '覆盖已有目标译文');
  assert.equal(translator.translateText('Folder Format'), '文件夹格式');
  assert.equal(translator.translateText('Subfolder Format'), '子文件夹格式');
  assert.equal(translator.translateText('Min Size Mb'), '最小大小（MB）');
  assert.equal(translator.translateText('Regex Pattern'), '番号正则表达式');
  assert.equal(translator.translateText('Default Review View'), '默认检查视图');
});
