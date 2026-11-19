const scenes = document.querySelectorAll('.scene');
const links = document.querySelectorAll('.rail a');
const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      links.forEach(link => link.toggleAttribute('data-current', link.hash === '#' + entry.target.id));
    }
  }
}, {rootMargin: '-20% 0px -45%'});
scenes.forEach(scene => observer.observe(scene));

const byId = id => document.getElementById(id);
function selectButton(button, selector) {
  for (const item of document.querySelectorAll(selector)) {
    item.setAttribute('aria-pressed', String(item === button));
  }
}
for (const button of document.querySelectorAll('[data-colour]')) {
  button.onclick = () => {
    selectButton(button, '[data-colour]');
    byId('colour').textContent = button.dataset.colour;
    document.querySelector('.fabric').style.setProperty('--swatch', button.dataset.colour === 'Moss' ? '#708369' : '#bf8168');
  };
}
byId('test-cart').onclick = () => {
  const selected = byId('colour').textContent;
  const added = byId('app-enabled').checked ? 'Moss' : selected;
  byId('cart-result').textContent = 'Cart received: ' + added + '. ' + (selected !== added ? 'That differs from your selection. Pause the swatch app and retest.' : 'That matches your selection.');
};
const repairSteps = [
  ['Apply theme fix', 'Ready to edit', 'A preview copy is ready. The live storefront is still published.'],
  ['Send preview to support', 'Fix applied', 'The fix is on the duplicate. Support needs the theme name to hand it back.'],
  ['Start again', 'Awaiting merchant review', 'Support has the preview name. The merchant can test the fix and decide when to publish.']
];
let repairIndex = 0;
byId('repair').onclick = () => {
  if (repairIndex === repairSteps.length) {
    repairIndex = 0;
    byId('copy-card').hidden = true;
    byId('repair').textContent = 'Duplicate theme';
    byId('repair-result').textContent = 'The ticket is assigned to theme escalations.';
    return;
  }
  const [action, state, message] = repairSteps[repairIndex++];
  byId('copy-card').hidden = false;
  byId('repair').textContent = action;
  byId('copy-state').textContent = state;
  byId('repair-result').textContent = message;
};
function updateBuild() {
  byId('build').style.gridTemplateColumns = 'repeat(' + byId('columns').value + ', 1fr)';
  byId('build').style.gap = byId('gutter').value + 'px';
  byId('qa-result').textContent = 'Preview updated. Run QA to check the build.';
}
byId('columns').onchange = byId('gutter').onchange = updateBuild;
byId('qa').onclick = () => {
  byId('qa-result').textContent = byId('columns').value !== '2' ? 'QA returned the ticket: the two blocks should sit side by side.' : byId('gutter').value !== '16' ? 'QA returned the ticket: check the spacing between blocks.' : 'QA passed. The section matches the reference and is ready for lead review.';
};
const items = [...document.querySelectorAll('.item')];
for (const item of items) {
  item.onchange = () => {
    const picked = items.filter(input => input.checked);
    items.forEach(input => { input.disabled = picked.length === 2 && !input.checked; });
    byId('slot1').textContent = picked[0]?.value || 'Empty slot';
    byId('slot2').textContent = picked[1]?.value || 'Empty slot';
    byId('bundle-result').textContent = picked.length + ' of 2 selected.';
  };
}
byId('bundle').onclick = () => {
  const picked = items.filter(input => input.checked);
  byId('bundle-result').textContent = picked.length === 2 ? 'Bundle accepted: ' + picked.map(input => input.value).join(' + ') + '.' : 'Bundle incomplete. Choose two items before adding it.';
};
let checkedMobile = false;
for (const button of document.querySelectorAll('[data-size]')) {
  button.onclick = () => {
    selectButton(button, '[data-size]');
    const mobile = button.dataset.size === 'Mobile';
    checkedMobile ||= mobile;
    byId('viewport').classList.toggle('mobile', mobile);
    byId('review-result').textContent = mobile ? 'Mobile preview: the quick-buy control is clipped.' : 'Desktop preview: the quick-buy control fits.';
  };
}
byId('approve').onclick = () => { byId('review-result').textContent = checkedMobile ? 'Hold approval. Shoppers need the whole quick-buy control on mobile.' : 'Check the mobile viewport before approving.'; };
byId('request').onclick = () => { byId('review-result').textContent = checkedMobile ? 'Changes requested: allow the control to wrap, then retest both widths.' : 'Open the mobile preview to identify the change needed.'; };
