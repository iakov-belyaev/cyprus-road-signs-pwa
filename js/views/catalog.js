// Catalog view: search, category chips, grid, detail modal.

import { SIGNS, CATEGORIES, searchSigns, getSignsByCategory } from '../signs-data.js';
import { el, signImage, categoryColor, categoryLabel, debounce, trapFocus } from '../ui.js';

let activeCategory = 'all';
let query = '';

function currentSigns() {
  const base = activeCategory === 'all' ? SIGNS : getSignsByCategory(activeCategory);
  if (!query) return base;
  const matched = new Set(searchSigns(query).map((s) => s.id));
  return base.filter((s) => matched.has(s.id));
}

function renderGrid() {
  const grid = document.getElementById('catalog-grid');
  if (!grid) return;
  const signs = currentSigns();
  grid.innerHTML = '';

  if (signs.length === 0) {
    grid.appendChild(el('p', { class: 'empty-state', text: 'No signs match your search.' }));
    return;
  }

  signs.forEach((sign) => {
    const card = el('button', {
      class: 'sign-card',
      type: 'button',
      'aria-label': `${sign.name}, ${categoryLabel(sign.category)}`,
      onclick: () => openModal(sign),
    });
    card.appendChild(el('span', {
      class: 'sign-card-stripe',
      style: `background:${categoryColor(sign.category)}`,
    }));
    card.appendChild(signImage(sign, { className: 'sign-img sign-img-card' }));
    card.appendChild(el('span', { class: 'sign-card-name', text: sign.name }));
    grid.appendChild(card);
  });
}

function openModal(sign) {
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

export function render() {
  const wrap = el('section', { class: 'view-catalog' });
  wrap.appendChild(el('h2', { class: 'view-title', text: 'Sign Catalog' }));

  const search = el('input', {
    class: 'search-input',
    type: 'search',
    placeholder: 'Search signs…',
    'aria-label': 'Search signs',
    value: query,
  });
  const debounced = debounce((value) => {
    query = value;
    renderGrid();
  }, 150);
  search.addEventListener('input', (e) => debounced(e.target.value));
  wrap.appendChild(search);

  const chips = el('div', { class: 'chips', role: 'group', 'aria-label': 'Filter by category' });
  const allChip = el('button', {
    class: `chip${activeCategory === 'all' ? ' is-active' : ''}`,
    type: 'button',
    text: 'All',
    onclick: () => selectCategory('all'),
  });
  chips.appendChild(allChip);
  CATEGORIES.forEach((cat) => {
    chips.appendChild(el('button', {
      class: `chip${activeCategory === cat.id ? ' is-active' : ''}`,
      type: 'button',
      text: cat.label,
      style: `--chip-color:${cat.color}`,
      onclick: () => selectCategory(cat.id),
    }));
  });
  wrap.appendChild(chips);

  const grid = el('div', { class: 'catalog-grid', id: 'catalog-grid' });
  wrap.appendChild(grid);

  // Defer grid render until mounted.
  setTimeout(renderGrid, 0);

  return wrap;
}

function selectCategory(id) {
  activeCategory = id;
  const view = document.getElementById('view');
  if (view) {
    view.innerHTML = '';
    view.appendChild(render());
  }
}
