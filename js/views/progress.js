// Progress view: stat cards, most-missed list, history, reset.

import { SIGNS, getSignById } from '../signs-data.js';
import { accuracy, mostMissed, TEST_LENGTH } from '../quiz-engine.js';
import { createStore } from '../storage.js';
import { el, signImage, announce } from '../ui.js';

const store = createStore();

function openDetail(sign) {
  // Reuse the catalog modal by dispatching a lightweight custom event.
  const event = new CustomEvent('cyrs:open-sign', { detail: sign });
  document.dispatchEvent(event);
}

function statCard(label, value) {
  const card = el('div', { class: 'stat-card' });
  card.appendChild(el('div', { class: 'stat-value', text: String(value) }));
  card.appendChild(el('div', { class: 'stat-label', text: label }));
  return card;
}

export function render() {
  const state = store.getState();
  const wrap = el('section', { class: 'view-progress' });
  wrap.appendChild(el('h2', { class: 'view-title', text: 'Your Progress' }));

  const stats = el('div', { class: 'stats-grid' });
  stats.appendChild(statCard('Questions Answered', state.stats.totalAnswered));
  stats.appendChild(statCard('Overall Accuracy', `${accuracy(state)}%`));
  stats.appendChild(statCard('Tests Completed', state.stats.testsCompleted));
  stats.appendChild(statCard('Best Score', `${state.stats.bestScore}/${TEST_LENGTH}`));
  wrap.appendChild(stats);

  // Most missed
  wrap.appendChild(el('h3', { class: 'section-heading', text: 'Most Missed Signs' }));
  const missed = mostMissed(state, SIGNS, 5);
  if (missed.length === 0) {
    wrap.appendChild(el('p', { class: 'empty-state', text: 'No missed signs yet. Take a test to start tracking.' }));
  } else {
    const list = el('ul', { class: 'missed-list' });
    missed.forEach(({ sign, count }) => {
      const li = el('li', { class: 'missed-item missed-item-tappable' });
      const btn = el('button', {
        class: 'missed-btn',
        type: 'button',
        'aria-label': `${sign.name}, missed ${count} times`,
        onclick: () => openDetail(sign),
      });
      btn.appendChild(signImage(sign, { className: 'sign-img sign-img-thumb' }));
      btn.appendChild(el('span', { class: 'missed-name', text: sign.name }));
      btn.appendChild(el('span', { class: 'missed-count', text: `${count}×` }));
      li.appendChild(btn);
      list.appendChild(li);
    });
    wrap.appendChild(list);
  }

  // History
  wrap.appendChild(el('h3', { class: 'section-heading', text: 'Session History' }));
  if (state.history.length === 0) {
    wrap.appendChild(el('p', { class: 'empty-state', text: 'No sessions recorded yet.' }));
  } else {
    const list = el('ul', { class: 'history-list' });
    state.history.forEach((entry) => {
      const li = el('li', { class: 'history-item' });
      const date = entry.dateISO ? new Date(entry.dateISO) : null;
      const dateText = date && !isNaN(date) ? date.toLocaleDateString() : '—';
      li.appendChild(el('span', { class: 'history-date', text: dateText }));
      li.appendChild(el('span', { class: 'history-mode', text: entry.mode === 'freeform' ? 'Freeform' : 'Multiple-Choice' }));
      li.appendChild(el('span', { class: 'history-score', text: `${entry.score}/${entry.total}` }));
      list.appendChild(li);
    });
    wrap.appendChild(list);
  }

  wrap.appendChild(el('button', {
    class: 'btn btn-danger btn-large',
    type: 'button',
    text: 'Reset All Progress',
    onclick: () => {
      if (globalThis.confirm && !globalThis.confirm('Reset all progress? This cannot be undone.')) return;
      store.clearAll();
      announce('Progress reset');
      const view = document.getElementById('view');
      if (view) {
        view.innerHTML = '';
        view.appendChild(render());
      }
    },
  }));

  return wrap;
}
