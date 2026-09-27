// Forms view: DMV Form Delta 7 resource with graceful offline fallback.

import { el } from '../ui.js';

const PDF_PATH = 'assets/forms/delta7.pdf';
const OFFICIAL_URL = 'https://www.mcw.gov.cy/mcw/rtd/rtd.nsf/index_en/index_en?OpenDocument';

export function render() {
  const wrap = el('section', { class: 'view-forms' });
  wrap.appendChild(el('h2', { class: 'view-title', text: 'Licensing Forms' }));

  const card = el('div', { class: 'form-card' });
  card.appendChild(el('h3', { class: 'form-title', text: 'Form Delta 7' }));
  card.appendChild(el('p', {
    class: 'form-desc',
    text: 'Application form for a driving licence issued by the Cyprus Department of Road Transport. Use it to apply for a new licence, renew, or replace a lost or damaged one.',
  }));

  const actions = el('div', { class: 'form-actions' });

  const openBtn = el('a', {
    class: 'btn btn-primary',
    href: PDF_PATH,
    target: '_blank',
    rel: 'noopener',
    text: 'Open / View',
  });

  const downloadBtn = el('a', {
    class: 'btn btn-secondary',
    href: PDF_PATH,
    download: 'delta7.pdf',
    text: 'Download',
  });

  actions.appendChild(openBtn);
  actions.appendChild(downloadBtn);
  card.appendChild(actions);

  const notice = el('div', { class: 'form-notice' });
  notice.appendChild(el('p', {
    text: 'Always use the latest official version from the government portal.',
  }));
  notice.appendChild(el('a', {
    class: 'link-btn',
    href: OFFICIAL_URL,
    target: '_blank',
    rel: 'noopener',
    text: 'Open official government portal',
  }));
  card.appendChild(notice);

  // Graceful fallback if the PDF asset is not yet available.
  const fallback = el('div', { class: 'form-fallback', hidden: 'hidden' });
  fallback.appendChild(el('p', {
    text: 'The form is not bundled offline yet. Fetch the latest version from the official site.',
  }));
  fallback.appendChild(el('a', {
    class: 'btn btn-primary',
    href: OFFICIAL_URL,
    target: '_blank',
    rel: 'noopener',
    text: 'Get Form Delta 7 from official site',
  }));
  card.appendChild(fallback);

  // Probe the asset; if missing, hide the direct actions and show fallback.
  if (globalThis.fetch) {
    fetch(PDF_PATH, { method: 'HEAD' })
      .then((res) => {
        if (!res || !res.ok) throw new Error('missing');
      })
      .catch(() => {
        actions.hidden = true;
        fallback.hidden = false;
      });
  }

  wrap.appendChild(card);
  return wrap;
}
