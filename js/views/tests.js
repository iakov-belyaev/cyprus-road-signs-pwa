// Tests view: start screen, question screen, result screen.

import { SIGNS, getSignById } from '../signs-data.js';
import {
  TEST_LENGTH,
  buildTest,
  buildOptions,
  recordAnswer,
  finishTest,
  accuracy,
} from '../quiz-engine.js';
import { isAnswerCorrect } from '../fuzzy.js';
import { createStore } from '../storage.js';
import { el, signImage, announce } from '../ui.js';

const store = createStore();

let session = null;

function freshSession(mode, signs) {
  return {
    mode,
    signs,
    index: 0,
    score: 0,
    missed: [],
    answered: false,
  };
}

function startTest(mode, signs) {
  const state = store.getState();
  const selected = buildTest(signs, state.weights, { length: TEST_LENGTH });
  session = freshSession(mode, selected);
  renderQuestion();
}

function renderStart() {
  const state = store.getState();
  const mode = state.settings.mode || 'multiple-choice';

  const wrap = el('section', { class: 'view-tests' });

  wrap.appendChild(el('h2', { class: 'view-title', text: 'Theory Test' }));
  wrap.appendChild(el('p', { class: 'view-sub', text: 'Prepare for the Cyprus DMV theory test with 25-question practice runs.' }));

  const segmented = el('div', { class: 'segmented', role: 'group', 'aria-label': 'Answer mode' });
  const mcBtn = el('button', {
    class: `segmented-btn${mode === 'multiple-choice' ? ' is-active' : ''}`,
    type: 'button',
    text: 'Multiple-Choice',
    'aria-pressed': mode === 'multiple-choice' ? 'true' : 'false',
    onclick: () => setMode('multiple-choice'),
  });
  const ffBtn = el('button', {
    class: `segmented-btn${mode === 'freeform' ? ' is-active' : ''}`,
    type: 'button',
    text: 'Freeform',
    'aria-pressed': mode === 'freeform' ? 'true' : 'false',
    onclick: () => setMode('freeform'),
  });
  segmented.appendChild(mcBtn);
  segmented.appendChild(ffBtn);
  wrap.appendChild(segmented);

  wrap.appendChild(el('button', {
    class: 'btn btn-primary btn-large',
    type: 'button',
    text: `Start ${TEST_LENGTH}-Question Test`,
    onclick: () => startTest(store.getState().settings.mode || 'multiple-choice', SIGNS),
  }));

  wrap.appendChild(el('p', {
    class: 'explainer',
    text: 'Signs you miss gain extra weight and appear more often in later tests, so you focus on your weak spots.',
  }));

  return wrap;
}

function setMode(mode) {
  const state = store.getState();
  state.settings.mode = mode;
  store.setState(state);
  const view = document.getElementById('view');
  if (view) {
    view.innerHTML = '';
    view.appendChild(renderStart());
  }
}

function renderQuestion() {
  const view = document.getElementById('view');
  if (!view || !session) return;

  const sign = session.signs[session.index];
  const state = store.getState();
  const acc = accuracy(state);

  const wrap = el('section', { class: 'view-tests question-view' });

  // Sticky header
  const header = el('div', { class: 'question-header' });
  header.appendChild(el('div', { class: 'question-meta' }, [
    el('span', { class: 'question-count', text: `Question ${session.index + 1}/${session.signs.length}` }),
    el('span', { class: 'question-accuracy', text: `Accuracy: ${acc}%` }),
  ]));
  const bar = el('div', { class: 'progress-track' });
  const fill = el('div', {
    class: 'progress-fill',
    style: `width:${((session.index) / session.signs.length) * 100}%`,
  });
  bar.appendChild(fill);
  header.appendChild(bar);
  wrap.appendChild(header);

  // Sign image
  const imageArea = el('div', { class: 'question-image' });
  imageArea.appendChild(signImage(sign, { className: 'sign-img sign-img-large' }));
  wrap.appendChild(imageArea);

  if (session.mode === 'multiple-choice') {
    wrap.appendChild(renderMultipleChoice(sign));
  } else {
    wrap.appendChild(renderFreeform(sign));
  }

  view.innerHTML = '';
  view.appendChild(wrap);
  announce(`Question ${session.index + 1} of ${session.signs.length}`);
}

function renderMultipleChoice(sign) {
  const options = buildOptions(sign, SIGNS, { count: 3 });
  const container = el('div', { class: 'options' });

  const buttons = options.map((opt) => {
    const btn = el('button', {
      class: 'option-card',
      type: 'button',
      text: opt.name,
      onclick: () => handleChoice(btn, opt, sign, buttons),
    });
    container.appendChild(btn);
    return btn;
  });

  return container;
}

function handleChoice(btn, opt, sign, buttons) {
  if (session.answered) return;
  session.answered = true;

  const isCorrect = opt.id === sign.id;

  // Apply visual state synchronously.
  buttons.forEach((b) => { b.disabled = true; });
  if (isCorrect) {
    btn.classList.add('is-correct');
  } else {
    btn.classList.add('is-wrong');
    buttons.forEach((b) => {
      if (b.textContent === sign.name) b.classList.add('is-correct');
    });
  }

  announce(isCorrect ? 'Correct' : 'Incorrect');
  commitAnswer(sign, isCorrect);

  setTimeout(() => advance(), 900);
}

function renderFreeform(sign) {
  const container = el('div', { class: 'freeform' });
  const feedback = el('div', { class: 'feedback', 'aria-live': 'polite' });

  const input = el('input', {
    class: 'text-input',
    type: 'text',
    placeholder: 'Type the sign name…',
    'aria-label': 'Your answer',
    autocomplete: 'off',
    autocapitalize: 'off',
    spellcheck: 'false',
  });

  const submit = () => {
    if (session.answered) return;
    const value = input.value;
    const isCorrect = isAnswerCorrect(value, sign);
    session.answered = true;
    input.disabled = true;
    checkBtn.disabled = true;

    if (isCorrect) {
      feedback.className = 'feedback is-correct';
      feedback.textContent = `Correct — ${sign.name}`;
    } else {
      feedback.className = 'feedback is-wrong';
      feedback.textContent = `Correct answer: ${sign.name}`;
    }

    announce(isCorrect ? 'Correct' : 'Incorrect');
    commitAnswer(sign, isCorrect);
    setTimeout(() => advance(), 1200);
  };

  const checkBtn = el('button', {
    class: 'btn btn-primary',
    type: 'button',
    text: 'Check',
    onclick: submit,
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  });

  const skip = el('button', {
    class: 'link-btn',
    type: 'button',
    text: 'Skip',
    onclick: () => {
      if (session.answered) return;
      session.answered = true;
      input.disabled = true;
      checkBtn.disabled = true;
      feedback.className = 'feedback is-wrong';
      feedback.textContent = `Correct answer: ${sign.name}`;
      announce('Skipped');
      commitAnswer(sign, false);
      setTimeout(() => advance(), 1200);
    },
  });

  container.appendChild(input);
  container.appendChild(checkBtn);
  container.appendChild(skip);
  container.appendChild(feedback);

  setTimeout(() => input.focus(), 50);
  return container;
}

function commitAnswer(sign, isCorrect) {
  const state = store.getState();
  const next = recordAnswer(state, sign.id, isCorrect);
  store.setState(next);

  if (isCorrect) {
    session.score += 1;
  } else {
    session.missed.push(sign.id);
  }
}

function advance() {
  session.index += 1;
  session.answered = false;
  if (session.index >= session.signs.length) {
    renderResult();
  } else {
    renderQuestion();
  }
}

function renderResult() {
  const view = document.getElementById('view');
  if (!view || !session) return;

  const total = session.signs.length;
  const score = session.score;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  const state = store.getState();
  const finished = finishTest(state, {
    score,
    total,
    mode: session.mode,
    dateISO: new Date().toISOString(),
  });
  store.setState(finished);

  const wrap = el('section', { class: 'view-tests result-view' });
  wrap.appendChild(el('h2', { class: 'view-title', text: 'Test Complete' }));

  const scoreCard = el('div', { class: 'result-score' });
  scoreCard.appendChild(el('div', { class: 'result-big', text: `${score}/${total}` }));
  scoreCard.appendChild(el('div', { class: 'result-pct', text: `${pct}%` }));
  scoreCard.appendChild(el('div', { class: 'result-acc', text: `Overall accuracy: ${accuracy(finished)}%` }));
  wrap.appendChild(scoreCard);

  if (session.missed.length > 0) {
    wrap.appendChild(el('h3', { class: 'section-heading', text: 'Missed Signs' }));
    const list = el('ul', { class: 'missed-list' });
    const unique = [...new Set(session.missed)];
    unique.forEach((id) => {
      const sign = getSignById(id);
      if (!sign) return;
      const li = el('li', { class: 'missed-item' });
      li.appendChild(signImage(sign, { className: 'sign-img sign-img-thumb' }));
      li.appendChild(el('span', { class: 'missed-name', text: sign.name }));
      list.appendChild(li);
    });
    wrap.appendChild(list);

    wrap.appendChild(el('button', {
      class: 'btn btn-secondary btn-large',
      type: 'button',
      text: 'Retry Missed Signs Only',
      onclick: () => {
        const missedSigns = unique.map((id) => getSignById(id)).filter(Boolean);
        session = freshSession(session.mode, missedSigns);
        renderQuestion();
      },
    }));
  }

  wrap.appendChild(el('button', {
    class: 'btn btn-primary btn-large',
    type: 'button',
    text: 'New Test',
    onclick: () => {
      session = null;
      const v = document.getElementById('view');
      if (v) {
        v.innerHTML = '';
        v.appendChild(renderStart());
      }
    },
  }));

  view.innerHTML = '';
  view.appendChild(wrap);
  announce(`Test complete. Score ${score} out of ${total}`);
}

export function render() {
  session = null;
  return renderStart();
}
