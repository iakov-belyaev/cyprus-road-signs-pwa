// Shared DOM helpers for views. Kept small and dependency-free.

import { CATEGORIES } from './signs-data.js';
import { imageCandidates, initials as imageInitials, categoryColorFor } from './images.js';

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'html') node.innerHTML = value;
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'dataset') {
      Object.assign(node.dataset, value);
    } else {
      node.setAttribute(key, value);
    }
  }
  const list = Array.isArray(children) ? children : [children];
  for (const child of list) {
    if (child == null) continue;
    node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

export function categoryColor(categoryId) {
  const cat = CATEGORIES.find((c) => c.id === categoryId);
  return cat ? cat.color : '#888';
}

export function categoryLabel(categoryId) {
  const cat = CATEGORIES.find((c) => c.id === categoryId);
  return cat ? cat.label : categoryId;
}

/**
 * Build a sign image element with a graceful placeholder fallback.
 * Walks the candidate list from js/images.js exactly once per candidate,
 * then replaces the image with an inline placeholder.
 */
export function signImage(sign, { className = 'sign-img', alt } = {}) {
  const wrap = el('div', { class: 'sign-img-wrap' });
  const image = el('img', {
    class: className,
    alt: alt || (sign && sign.name) || '',
    loading: 'lazy',
    decoding: 'async',
  });

  const placeholder = el('div', {
    class: 'sign-placeholder',
    style: `--cat-color:${categoryColorFor(sign)}`,
    'aria-hidden': 'true',
  }, [
    el('span', { class: 'sign-placeholder-initials', text: imageInitials(sign && sign.name) }),
  ]);

  const candidates = imageCandidates(sign);
  let index = 0;
  if (candidates.length > 0) image.src = candidates[0];

  image.addEventListener('error', () => {
    try {
      index += 1;
      if (index < candidates.length) {
        image.src = candidates[index];
      } else {
        image.remove();
        if (!wrap.contains(placeholder)) wrap.appendChild(placeholder);
      }
    } catch {
      image.remove();
      if (!wrap.contains(placeholder)) wrap.appendChild(placeholder);
    }
  });

  wrap.appendChild(image);
  return wrap;
}

/** Simple debounce. */
export function debounce(fn, wait = 150) {
  let timer = null;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

/** Trap focus within a container; returns a cleanup function. */
export function trapFocus(container) {
  const selector = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
  function onKeydown(e) {
    if (e.key !== 'Tab') return;
    const focusable = Array.from(container.querySelectorAll(selector)).filter(
      (n) => n.offsetParent !== null || n === document.activeElement
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
  container.addEventListener('keydown', onKeydown);
  return () => container.removeEventListener('keydown', onKeydown);
}

/** Announce a message to screen readers via the aria-live region. */
export function announce(message) {
  const region = document.getElementById('live-region');
  if (!region) return;
  region.textContent = '';
  // Force re-announcement of identical strings.
  setTimeout(() => {
    region.textContent = message;
  }, 20);
}
