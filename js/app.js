// App entry: wires the router, service worker, and cross-view events.

import { initRouter } from './router.js';
import { createStore } from './storage.js';
import { el, signImage, categoryColor, categoryLabel, trapFocus } from './ui.js';

// Ensure a default state exists on first run.
const store = createStore();
if (store.get('state', null) == null) {
  store.setState(store.getState());
}

// Cross-view event: open a sign detail modal (used by Progress view).
document.addEventListener('cyrs:open-sign', (e) => {
  const sign = e.detail;
  if (sign) openSignModal(sign);
});

function openSignModal(sign) {
  const backdrop = el('div', { class: 'modal-backdrop', role: 'presentation' });
  const modal = el('div', {
    class: 'modal',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': sign.name,
  });

  const closeBtn = el('button', {
    class: 'modal-close',
    type: 'button',
    'aria-label': 'Close',
    text: '×',
    onclick: close,
  });

  modal.appendChild(closeBtn);
  modal.appendChild(signImage(sign, { className: 'sign-img sign-img-modal' }));
  modal.appendChild(el('h3', { class: 'modal-title', text: sign.name }));
  modal.appendChild(el('p', { class: 'modal-greek', text: sign.nameEl }));
  modal.appendChild(el('span', {
    class: 'category-badge',
    style: `background:${categoryColor(sign.category)}`,
    text: categoryLabel(sign.category),
  }));
  modal.appendChild(el('p', { class: 'modal-meaning', text: sign.meaning }));

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  const releaseFocus = trapFocus(modal);
  const previouslyFocused = document.activeElement;

  function onKey(e) {
    if (e.key === 'Escape') close();
  }
  function onBackdrop(e) {
    if (e.target === backdrop) close();
  }
  function close() {
    document.removeEventListener('keydown', onKey);
    backdrop.removeEventListener('click', onBackdrop);
    releaseFocus();
    backdrop.remove();
    if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
  }

  document.addEventListener('keydown', onKey);
  backdrop.addEventListener('click', onBackdrop);
  closeBtn.focus();
}

// Register the service worker when supported; fail silently otherwise.
if ('serviceWorker' in navigator) {
  globalThis.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

initRouter();
