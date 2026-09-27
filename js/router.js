// Tiny hash-based router. Renders a view module into #view and updates nav.

const ROUTES = ['tests', 'catalog', 'progress', 'forms'];
const DEFAULT_ROUTE = 'tests';

let currentRoute = null;
let onNavigate = null;

export function parseHash(hash) {
  const raw = String(hash || '').replace(/^#\/?/, '').split('?')[0].trim();
  const route = raw || DEFAULT_ROUTE;
  return ROUTES.includes(route) ? route : DEFAULT_ROUTE;
}

export function getCurrentRoute() {
  return currentRoute;
}

function setActiveTab(route) {
  const tabs = document.querySelectorAll('[data-tab]');
  tabs.forEach((tab) => {
    const isActive = tab.dataset.tab === route;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
}

async function render() {
  const route = parseHash(globalThis.location ? globalThis.location.hash : '');
  const view = document.getElementById('view');
  if (!view) return;

  if (route === currentRoute) return;
  currentRoute = route;
  setActiveTab(route);

  try {
    const mod = await import(`./views/${route}.js`);
    view.innerHTML = '';
    const node = await mod.render();
    if (node) view.appendChild(node);
    view.classList.remove('view-enter');
    // Force reflow so the transition replays.
    void view.offsetWidth;
    view.classList.add('view-enter');
  } catch (err) {
    view.innerHTML = `<p class="error">Failed to load view: ${route}</p>`;
    if (globalThis.console) console.error(err);
  }

  if (typeof onNavigate === 'function') onNavigate(route);
}

export function navigate(route) {
  const target = ROUTES.includes(route) ? route : DEFAULT_ROUTE;
  if (globalThis.location) {
    globalThis.location.hash = `#/${target}`;
  } else {
    render();
  }
}

export function initRouter({ onRouteChange } = {}) {
  onNavigate = onRouteChange || null;
  if (globalThis.addEventListener) {
    globalThis.addEventListener('hashchange', render);
  }
  if (!globalThis.location || !globalThis.location.hash) {
    navigate(DEFAULT_ROUTE);
  } else {
    render();
  }
}
