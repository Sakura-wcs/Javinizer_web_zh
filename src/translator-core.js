'use strict';

const SUPPORTED_HOSTS = new Set(['127.0.0.1', 'localhost']);
const SUPPORTED_PORT = '8080';
const TEXT_NODE = 3;
const ELEMENT_NODE = 1;
const DOCUMENT_NODE = 9;
const DOCUMENT_FRAGMENT_NODE = 11;
const TRANSLATABLE_ATTRIBUTES = ['placeholder', 'title', 'aria-label', 'alt'];

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function isSupportedJavinizerUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' && SUPPORTED_HOSTS.has(url.hostname) && url.port === SUPPORTED_PORT;
  } catch {
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
  if (/^[A-Z]:\\/.test(text.replace(/\s+/g, ''))) return true;
  if (/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{1,2}, \d{4}/.test(text)) return true;
  if (/^\d{1,2}:\d{2}(?:\s?[AP]M)?$/i.test(text)) return true;
  if (/^#\d+$/.test(text)) return true;
  return false;
}

function compilePatterns(patterns) {
  return (patterns || []).map((item) => ({
    regex: new RegExp(item.match),
    replace: item.replace,
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

  function readAttribute(element, name) {
    if (typeof element.getAttribute === 'function') return element.getAttribute(name);
    return element.attributes ? element.attributes[name] : undefined;
  }

  function writeAttribute(element, name, value) {
    if (typeof element.setAttribute === 'function') {
      element.setAttribute(name, value);
      return;
    }
    if (!element.attributes) element.attributes = {};
    element.attributes[name] = value;
  }

  function translateAttributes(element) {
    for (const name of TRANSLATABLE_ATTRIBUTES) {
      const value = readAttribute(element, name);
      const translated = translateText(value);
      if (value && translated !== value) writeAttribute(element, name, translated);
    }
  }

  function translateElement(root) {
    if (!root) return;
    if (root.nodeType === TEXT_NODE) {
      translateTextNode(root);
      return;
    }
    if (![ELEMENT_NODE, DOCUMENT_NODE, DOCUMENT_FRAGMENT_NODE].includes(root.nodeType) && root.nodeType !== undefined) return;

    translateAttributes(root);
    const childNodes = Array.from(root.childNodes || []);
    for (const child of childNodes) {
      if (child.nodeType === TEXT_NODE) translateTextNode(child);
      else translateElement(child);
    }
  }

  return {
    translateText,
    translateElement,
  };
}

module.exports = {
  createTranslator,
  isSupportedJavinizerUrl,
  normalizeText,
  shouldSkipText,
};
