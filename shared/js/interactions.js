/* bridgeway-interactions */
document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.bw-kpi-card, .platform-metrics > button').forEach(card => {
    const detail = document.createElement('span');
    detail.className = 'bw-bridge-detail';
    detail.setAttribute('aria-hidden', 'true');
    card.append(detail);
  });
  const grids = [...document.querySelectorAll('.bw-kpi-grid, .platform-metrics, .platform-overview-grid')];
  grids.forEach((grid, gridIndex) => {
    if (grid.matches('.platform-overview-grid') && grid.parentElement.querySelector('.platform-metrics')) return;
    const companion = grid.matches('.platform-metrics') ? grid.parentElement.querySelector('.platform-overview-grid') : null;
    const allGrids = companion ? [grid, companion] : [grid];
    const states = allGrids.map(area => ({ area, cards:[...area.children], key:`bridgeway:card-order:v1:${location.pathname.split('/').pop()}:${grids.indexOf(area)}` }));
    const original = states.flatMap(state => state.cards);
    if (original.length < 2) return;
    const labels = original.map(card => (card.querySelector('.bw-kpi-label, h2') || card.querySelector('span') || card).textContent.trim().replace(/\s+/g, ' ').slice(0, 65));
    original.forEach((card, index) => { card.dataset.arrangeId = String(index); });
    function order() { return states.map(state => [...state.area.children].map(card => state.cards.indexOf(card))); }
    function applyOrder(orders) { states.forEach((state, index) => orders[index].forEach(id => state.area.append(state.cards[id]))); }
    states.forEach(state => {
      try {
        const saved = JSON.parse(localStorage.getItem(state.key));
        if (Array.isArray(saved) && saved.length === state.cards.length && new Set(saved).size === state.cards.length && saved.every(id => Number.isInteger(id) && id >= 0 && id < state.cards.length)) saved.forEach(id => state.area.append(state.cards[id]));
      } catch (_) { /* Storage may be disabled. */ }
      state.area.classList.add('bw-arrange-grid');
      if (!state.area.id) state.area.id = `bw-arrange-grid-${grids.indexOf(state.area)}`;
    });
    const bar = document.createElement('div');
    bar.className = 'bw-arrange-bar';
    bar.innerHTML = '<span class="bw-arrange-hint">Your workspace, your order</span><div class="bw-arrange-actions"><div class="bw-arrange-tools" hidden><button type="button" data-move="-1">Move earlier</button><button type="button" data-move="1">Move later</button><button type="button" data-reset>Reset order</button><button type="button" data-cancel>Cancel</button></div><button type="button" class="bw-arrange-toggle" aria-pressed="false">Arrange cards</button></div><span class="bw-arrange-status" role="status" aria-live="polite"></span>';
    const toolbarHost = grid.dataset.arrangeToolbar && document.querySelector(grid.dataset.arrangeToolbar);
    if (toolbarHost) toolbarHost.append(bar);
    else grid.before(bar);
    const toggle = bar.querySelector('.bw-arrange-toggle');
    toggle.setAttribute('aria-controls', allGrids.map(area => area.id).join(' '));
    const tools = bar.querySelector('.bw-arrange-tools');
    const originalTabIndex = new Map(original.map(card => [card, card.getAttribute('tabindex')]));
    const status = bar.querySelector('[role="status"]');
    const hint = bar.querySelector('.bw-arrange-hint');
    let editing = false, selected = original[0], dragged = null, beforeEdit = order();
    function refresh() {
      allGrids.forEach(area => [...area.children].forEach((card, index) => {
        card.dataset.arrangePosition = String(index + 1);
        card.classList.toggle('is-selected', editing && card === selected);
      }));
      const cards = [...selected.parentElement.children];
      const position = cards.indexOf(selected);
      bar.querySelector('[data-move="-1"]').disabled = position === 0;
      bar.querySelector('[data-move="1"]').disabled = position === cards.length - 1;
    }
    function announce() {
      const cards = [...selected.parentElement.children];
      status.textContent = `${labels[Number(selected.dataset.arrangeId)]} moved to position ${cards.indexOf(selected) + 1} of ${cards.length}.`;
    }
    function rearrange(change) {
      const positions = new Map(original.map(card => [card, card.getBoundingClientRect()]));
      change(); refresh(); announce();
      if (!reduceMotion.matches) original.forEach(card => {
        const previous = positions.get(card), next = card.getBoundingClientRect();
        card.animate([{ transform:`translate(${previous.left - next.left}px, ${previous.top - next.top}px)` }, { transform:'translate(0, 0)' }], { duration:260, easing:'cubic-bezier(.22,1,.36,1)' });
      });
    }
    function setEditing(value) {
      editing = value;
      allGrids.forEach(area => area.classList.toggle('is-arranging', value));
      tools.hidden = !value;
      toggle.textContent = value ? 'Done' : 'Arrange cards';
      toggle.setAttribute('aria-pressed', String(value));
      original.forEach(card => {
        card.draggable = value; card.classList.remove('is-dragging', 'is-drop-target');
        if (value) card.tabIndex = 0;
        else if (originalTabIndex.get(card) === null) card.removeAttribute('tabindex');
        else card.setAttribute('tabindex', originalTabIndex.get(card));
      });
      hint.textContent = value ? 'Drag a card, or select one and use the move buttons' : 'Your workspace, your order';
      refresh();
    }
    toggle.addEventListener('click', () => {
      if (!editing) { beforeEdit = order(); setEditing(true); }
      else {
        try { const orders = order(); states.forEach((state, index) => localStorage.setItem(state.key, JSON.stringify(orders[index]))); hint.textContent = 'Layout saved on this device'; }
        catch (_) { hint.textContent = 'Layout updated for this visit'; }
        const message = hint.textContent; setEditing(false); hint.textContent = message; status.textContent = message;
      }
    });
    bar.querySelectorAll('[data-move]').forEach(button => button.addEventListener('click', () => {
      const area = selected.parentElement, cards = [...area.children], index = cards.indexOf(selected), next = index + Number(button.dataset.move);
      if (next < 0 || next >= cards.length) return;
      rearrange(() => { [cards[index], cards[next]] = [cards[next], cards[index]]; cards.forEach(card => area.append(card)); });
    }));
    bar.querySelector('[data-reset]').addEventListener('click', () => {
      rearrange(() => applyOrder(states.map(state => state.cards.map((_, index) => index))));
      status.textContent = 'Default card order restored. Choose Done to save.';
    });
    function cancel() { applyOrder(beforeEdit); setEditing(false); status.textContent = 'Changes cancelled'; toggle.focus(); }
    bar.querySelector('[data-cancel]').addEventListener('click', cancel);
    function updateAvailability() {
      const available = allGrids.some(area => [...area.children].filter(card => card.getClientRects().length > 0).length > 1);
      bar.hidden = !available;
      if (!available && editing) { applyOrder(beforeEdit); setEditing(false); status.textContent = ''; }
    }
    const visibility = new ResizeObserver(updateAvailability);
    const changes = new MutationObserver(updateAvailability);
    allGrids.forEach(area => {
      visibility.observe(area);
      changes.observe(area, { childList:true, subtree:true, attributes:true, attributeFilter:['class', 'hidden', 'style'] });
    });
    updateAvailability();
    function findCard(target) { return original.find(card => card === target || card.contains(target)); }
    [bar, ...allGrids].forEach(area => area.addEventListener('keydown', event => { if (editing && event.key === 'Escape') { event.preventDefault(); cancel(); } }));
    allGrids.forEach(grid => {
    grid.addEventListener('click', event => {
      if (!editing) return;
      event.preventDefault(); event.stopImmediatePropagation();
      selected = findCard(event.target) || selected; refresh();
    }, true);
    grid.addEventListener('keydown', event => {
      if (editing && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); event.stopImmediatePropagation(); selected = findCard(event.target) || selected; refresh(); }
    }, true);
    grid.addEventListener('dragstart', event => {
      if (!editing) return;
      dragged = findCard(event.target); if (!dragged) return;
      selected = dragged; refresh();
      event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', dragged.dataset.arrangeId);
      dragged.classList.add('is-dragging');
    });
    grid.addEventListener('dragover', event => {
      if (!editing || !dragged || dragged.parentElement !== grid) return;
      event.preventDefault(); event.dataTransfer.dropEffect = 'move';
      const target = findCard(event.target);
      original.forEach(card => card.classList.toggle('is-drop-target', card === target && card !== dragged));
    });
    grid.addEventListener('drop', event => {
      if (!editing || !dragged || dragged.parentElement !== grid) return;
      event.preventDefault(); const target = findCard(event.target);
      if (target && target !== dragged) rearrange(() => {
        const cards = [...grid.children], from = cards.indexOf(dragged), to = cards.indexOf(target);
        cards.splice(from, 1); cards.splice(to, 0, dragged); cards.forEach(card => grid.append(card));
      });
      original.forEach(card => card.classList.remove('is-dragging', 'is-drop-target'));
    });
    grid.addEventListener('dragend', () => { dragged = null; original.forEach(card => card.classList.remove('is-dragging', 'is-drop-target')); });
    });
    refresh();
    if (!reduceMotion.matches) original.forEach((card, index) => {
      card.animate([{ opacity:0, transform:'translateY(12px)' }, { opacity:1, transform:'translateY(0)' }], { duration:420, delay:index * 55, easing:'cubic-bezier(.22,1,.36,1)', fill:'backwards' });
    });
  });
});
