// ==UserScript==
// @name         Javinizer Web 简体中文
// @namespace    https://github.com/Sakura-wcs/Javinizer_web_zh
// @version      0.1.0
// @description  使用 GitHub Raw 翻译源将 Javinizer 原版 Web UI 翻译为简体中文。
// @author       Sakura-wcs
// @match        http://127.0.0.1:8080/*
// @match        http://localhost:8080/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      raw.githubusercontent.com
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  const TRANSLATION_URL = 'https://raw.githubusercontent.com/Sakura-wcs/Javinizer_web_zh/main/translations/zh-CN.json';
  const SUPPORTED_HOSTS = new Set(['127.0.0.1', 'localhost']);
  const SUPPORTED_PORT = '8080';
  const TEXT_NODE = 3;
  const ELEMENT_NODE = 1;
  const TRANSLATABLE_ATTRIBUTES = ['placeholder', 'title', 'aria-label', 'alt'];
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'PRE', 'TEXTAREA']);

  const FALLBACK_DICTIONARY = {
    locale: 'zh-CN',
    exact: {
      Dashboard: '控制台',
      Scrape: '刮削',
      Jobs: '任务',
      Actresses: '演员',
      Genres: '类型',
      Words: '词库',
      Settings: '设置',
      'Start Scrape': '开始刮削',
      'Review & Organize': '检查并整理',
      Refresh: '刷新',
      Search: '搜索',
      Export: '导出',
      Import: '导入',
      Add: '添加',
      Edit: '编辑',
      Delete: '删除',
      Clear: '清空',
      'Save Changes': '保存更改'
    },
    patterns: [
      { match: '^(\\d+) files$', replace: '$1 个文件' },
      { match: '^(\\d+) done$', replace: '$1 个完成' },
      { match: '^(\\d+) failed$', replace: '$1 个失败' },
      { match: '^Active jobs: (\\d+)$', replace: '活动任务：$1' }
    ]
  };

  function normalizeText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function isSupportedJavinizerUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' && SUPPORTED_HOSTS.has(url.hostname) && url.port === SUPPORTED_PORT;
    } catch (_) {
      return false;
    }
  }

  function shouldSkipText(value) {
    const text = normalizeText(value);
    if (!text) return true;
    if (text.length > 180) return true;
    if (/^[A-Z]{2,8}-?\d{2,6}(?:-[A-Z0-9]+)?$/i.test(text)) return true;
    if (/^[A-Z]:\\/.test(text)) return true;
    if (/^(\\\\|\/)([^ ]+[\\/])+/.test(text)) return true;
    if (/\.(mp4|mkv|avi|wmv|flv|ts|srt|ass|nfo|jpg|jpeg|png|webp)$/i.test(text)) return true;
    if (/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{1,2}, \d{4}/.test(text)) return true;
    if (/^\d{1,2}:\d{2}(?:\s?[AP]M)?$/i.test(text)) return true;
    if (/^#\d+$/.test(text)) return true;
    return false;
  }

  function compilePatterns(patterns) {
    return (patterns || []).map((item) => ({
      regex: new RegExp(item.match),
      replace: item.replace
    }));
  }

  function createTranslator(dictionary) {
    const exact = dictionary.exact || {};
    const patterns = compilePatterns(dictionary.patterns);

    function translateText(value) {
      const original = String(value || '');
      const text = normalizeText(original);
      if (Object.prototype.hasOwnProperty.call(exact, text)) return exact[text];
      if (shouldSkipText(text)) return original;

      for (const pattern of patterns) {
        if (pattern.regex.test(text)) {
          return text.replace(pattern.regex, pattern.replace);
        }
      }
      return original;
    }

    function translateTextNode(node) {
      const translated = translateText(node.nodeValue);
      if (translated !== node.nodeValue) node.nodeValue = translated;
    }

    function translateAttributes(element) {
      for (const name of TRANSLATABLE_ATTRIBUTES) {
        const value = element.getAttribute && element.getAttribute(name);
        if (!value) continue;
        const translated = translateText(value);
        if (translated !== value) element.setAttribute(name, translated);
      }
    }

    function translateElement(root) {
      if (!root) return;
      if (root.nodeType === TEXT_NODE) {
        translateTextNode(root);
        return;
      }
      if (root.nodeType !== ELEMENT_NODE && root.nodeType !== document.nodeType && root.nodeType !== document.DOCUMENT_FRAGMENT_NODE) return;
      if (root.tagName && SKIP_TAGS.has(root.tagName)) return;

      if (root.nodeType === ELEMENT_NODE) translateAttributes(root);

      const walker = document.createTreeWalker(root, 1 | 4);
      let node = walker.currentNode;
      while (node) {
        if (node.nodeType === ELEMENT_NODE) {
          if (!SKIP_TAGS.has(node.tagName)) translateAttributes(node);
        } else if (node.nodeType === TEXT_NODE) {
          const parent = node.parentElement;
          if (!parent || !SKIP_TAGS.has(parent.tagName)) translateTextNode(node);
        }
        node = walker.nextNode();
      }
    }

    return {
      translateText,
      translateElement
    };
  }

  function loadTranslation() {
    return new Promise((resolve) => {
      if (typeof GM_xmlhttpRequest !== 'function') {
        resolve(FALLBACK_DICTIONARY);
        return;
      }

      GM_xmlhttpRequest({
        method: 'GET',
        url: `${TRANSLATION_URL}?t=${Date.now()}`,
        timeout: 10000,
        onload(response) {
          try {
            if (response.status >= 200 && response.status < 300) {
              resolve(JSON.parse(response.responseText));
              return;
            }
          } catch (_) {
            // Fall through to fallback dictionary.
          }
          resolve(FALLBACK_DICTIONARY);
        },
        onerror() {
          resolve(FALLBACK_DICTIONARY);
        },
        ontimeout() {
          resolve(FALLBACK_DICTIONARY);
        }
      });
    });
  }

  function installStatusBadge(message) {
    const badge = document.createElement('div');
    badge.id = 'javinizer-web-zh-status';
    badge.textContent = message;
    document.documentElement.appendChild(badge);
    setTimeout(() => badge.remove(), 2600);
  }

  function debounce(fn, delay) {
    let timer = 0;
    return function debounced() {
      clearTimeout(timer);
      timer = setTimeout(fn, delay);
    };
  }

  async function main() {
    if (!isSupportedJavinizerUrl(location.href)) return;

    GM_addStyle(`
      #javinizer-web-zh-status {
        position: fixed;
        right: 16px;
        bottom: 16px;
        z-index: 2147483647;
        padding: 8px 10px;
        border-radius: 6px;
        background: rgba(24, 24, 27, 0.92);
        color: #fff;
        font-size: 12px;
        line-height: 1.4;
        box-shadow: 0 8px 24px rgba(0,0,0,.22);
      }
    `);

    const dictionary = await loadTranslation();
    const translator = createTranslator(dictionary);
    const run = () => translator.translateElement(document.body || document.documentElement);
    const schedule = debounce(run, 80);

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run, { once: true });
    } else {
      run();
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' || mutation.type === 'characterData' || mutation.type === 'attributes') {
          schedule();
          break;
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: TRANSLATABLE_ATTRIBUTES
    });

    installStatusBadge('Javinizer Web 中文翻译已启用');
  }

  main();
})();
