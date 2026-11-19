const pageHeader = document.querySelector('body > header');
const chapters = [...document.querySelectorAll('.chapter')];
const container = document.querySelector('.chapters');
const route = document.querySelector('.route');
const guide = route.querySelector('.route-guide');
const read = route.querySelector('.route-read');
const reveal = route.querySelector('clipPath rect');
let routeStart = 0;
let routeHeight = 0;
const staticRoute = matchMedia('(prefers-reduced-motion: reduce)');
let revealed = 0, revealTarget = 0, revealFrame = 0, revealTime = 0;
function easeReveal(now) {
  const elapsed = Math.max(0, now - revealTime);
  revealTime = now;
  revealed += (revealTarget - revealed) * (1 - Math.exp(-elapsed / 115));
  if (Math.abs(revealTarget - revealed) < .75) {
    revealed = revealTarget;
    revealFrame = 0;
  } else {
    revealFrame = requestAnimationFrame(easeReveal);
  }
  reveal.setAttribute('height', revealed);
}
let active;
function focusChapter(chapter) {
  if (active === chapter) return;
  active?.classList.remove('current');
  active = chapter;
  if (active) active.classList.add('current');
}
function sync(snap = false) {
  if (routeHeight > 0) {
    const readLine = innerWidth <= 720 ? .64 : .74;
    revealTarget = Math.max(0, Math.min(routeHeight, scrollY + innerHeight * readLine - routeStart));
    if (snap === true || staticRoute.matches) {
      cancelAnimationFrame(revealFrame);
      revealFrame = 0;
      revealed = revealTarget;
      reveal.setAttribute('height', revealed);
    } else if (!revealFrame && revealed !== revealTarget) {
      revealTime = performance.now();
      revealFrame = requestAnimationFrame(easeReveal);
    }
  } else if (revealFrame) {
    cancelAnimationFrame(revealFrame);
    revealFrame = 0;
  }
  const line = innerHeight / 2;
  const target = chapters.find(chapter => {
    const box = chapter.getBoundingClientRect();
    return box.top <= line && box.bottom >= line;
  });
  focusChapter(target);
}
function draw() {
  if (innerWidth > 720) {
    const box = container.getBoundingClientRect();
    const cta = document.querySelector('.opening-link')?.getBoundingClientRect();
    const offset = cta ? Math.min(0, cta.bottom + 26 - box.top) : 0;
    routeStart = box.top + scrollY + offset;
    routeHeight = box.height - offset;
    route.style.setProperty('--route-start', offset + 'px');
    const center = box.width / 2;
    const notes = chapters.map(chapter => {
      const card = chapter.querySelector('.evidence').getBoundingClientRect();
      return {
        x: card.left + card.width / 2 - box.left,
        y: card.top + card.height / 2 - box.top - offset
      };
    });
    const start = {x: cta ? cta.left + cta.width / 2 - box.left : center, y: 0};
    const points = [start, ...notes, {x: center, y: routeHeight}];
    let d = `M ${start.x} 0`;
    // One spacious S between successive notes. Matching vertical tangents meet underneath each card.
    for (let i = 1; i < points.length; i++) {
      const from = points[i - 1];
      const to = points[i];
      const handle = (to.y - from.y) * .52;
      d += ` C ${from.x} ${from.y+handle} ${to.x} ${to.y-handle} ${to.x} ${to.y}`;
    }
    guide.setAttribute('d', d);
    read.setAttribute('d', d);
  } else {
    const box = container.getBoundingClientRect();
    const cta = document.querySelector('.opening-link')?.getBoundingClientRect();
    const comparison = document.querySelector('.comparison-hero')?.getBoundingClientRect();
    const anchor = comparison || cta;
    const offset = anchor ? Math.min(0, anchor.bottom + 16 - box.top) : 0;
    routeStart = box.top + scrollY + offset;
    routeHeight = box.height - offset;
    route.style.setProperty('--route-start', offset + 'px');
    const atY = position => position - box.top - offset;
    const column = chapters[0].querySelector('.chaptertext').getBoundingClientRect();
    const left = (column.left - box.left) / 2;
    const right = box.width - (box.right - column.right) / 2;
    let x = anchor ? anchor.left + anchor.width / 2 - box.left : box.width / 2;
    let y = 0;
    let d = `M ${x} 0`;
    function curve(toX, toY) {
      const span = Math.max(0, toY-y);
      d += ` C ${x} ${y+span*.56} ${toX} ${toY-span*.56} ${toX} ${toY}`;
      x = toX;
      y = toY;
    }
    curve(left, Math.max(0, atY(column.top) - 7));
    for (const [i, chapter] of chapters.entries()) {
      const card = chapter.querySelector('.evidence').getBoundingClientRect();
      const bendStart = Math.max(y, atY(card.top) - 7);
      d += ` L ${x} ${bendStart}`;
      y = bendStart;
      curve(i % 2 === 0 ? right : left, atY(card.top) + Math.min(148, card.height * .45));
    }
    d += ` L ${x} ${Math.max(y, routeHeight - 12)}`;
    guide.setAttribute('d', d);
    read.setAttribute('d', d);
  }
  sync(true);
}
container.classList.add('enhanced');
container.addEventListener('focusin',event => {
  const chapter = event.target.closest('.chapter');
  if (innerWidth > 720 && chapter && event.target !== chapter && active !== chapter) chapter.scrollIntoView({block:'center',behavior:'instant'});
});
addEventListener('scroll',sync,{passive:true});
addEventListener('resize',draw);
addEventListener('pageshow', () => requestAnimationFrame(() => sync(true)));
staticRoute.addEventListener('change', () => sync(true));
const routeLayout = new ResizeObserver(draw);
routeLayout.observe(container);
for (const area of document.querySelectorAll('.journeyintro, .chaptertext, .evidence')) routeLayout.observe(area);
draw();

const opening = document.querySelector('.opening');
if (opening) {
  function fitOpening() {
    document.documentElement.style.setProperty('--nav-height', pageHeader.offsetHeight + 'px');
    sync();
  }
  fitOpening();
  new ResizeObserver(fitOpening).observe(pageHeader);
}

const comparison = document.querySelector('.comparison-hero');
if (comparison) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const range = comparison.querySelector('input');
  let animation;
  function display(value) {
    range.value = value;
    comparison.style.setProperty('--split', range.value + '%');
    range.setAttribute('aria-valuetext', range.value + '% design, ' + (100 - range.value) + '% storefront');
  }
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    if (reduced.matches) return;
    const start = performance.now();
    function sweep(now) {
      const t = Math.min(1, (now - start) / 2400);
      display(Math.round(50 + 35 * Math.sin(t * Math.PI * 2) * Math.sin(t * Math.PI)));
      if (t < 1) animation = requestAnimationFrame(sweep);
    }
    animation = requestAnimationFrame(sweep);
  }, {threshold:0.5});
  function stop() { observer.disconnect(); cancelAnimationFrame(animation); }
  for (const event of ['pointerdown','focus','keydown']) range.addEventListener(event,stop);
  reduced.addEventListener('change',stop);
  range.addEventListener('input', () => { stop(); display(range.value); });
  display(50);
  observer.observe(comparison);
}

// Animate only the visual copy. The full accessible heading is static.
(() => {
  const output = document.querySelector('[data-type-output]');
  if (!output || !window.matchMedia) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const phrases = ['Shopify themes', 'Shopify apps', 'web interfaces'];
  let index = 0, count = phrases[0].length, deleting = true, timer;

  function schedule(delay) {
    window.clearTimeout(timer);
    if (!motion.matches && !document.hidden) timer = window.setTimeout(tick, delay);
  }

  function tick() {
    if (motion.matches || document.hidden) return;
    count += deleting ? -1 : 1;
    output.textContent = phrases[index].slice(0, count);
    if (deleting && count === 0) {
      index = (index + 1) % phrases.length;
      deleting = false;
      schedule(150);
    } else if (!deleting && count === phrases[index].length) {
      deleting = true;
      schedule(1800);
    } else {
      schedule(deleting ? 39 : 65);
    }
  }

  document.addEventListener('visibilitychange', () => schedule(450));
  if (motion.addEventListener) motion.addEventListener('change', () => {
    if (motion.matches) {
      index = 0;
      count = phrases[0].length;
      deleting = true;
      output.textContent = phrases[0];
    }
    schedule(1800);
  });
  schedule(1800);
})();

// Native dialog provides a modal focus trap and makes the rest of the page inert.
(() => {
  const menu = document.querySelector('.mobile-menu');
  const toggle = document.querySelector('.mobile-menu-toggle');
  if (!menu || !toggle || typeof menu.showModal !== 'function') return;
  const close = menu.querySelector('.mobile-menu-close');
  const mobile = window.matchMedia('(max-width: 720px)');
  document.documentElement.classList.add('menu-enhanced');
  let destination = null;
  toggle.addEventListener('click', () => {
    if (!mobile.matches || menu.open) return;
    destination = null;
    menu.showModal();
    toggle.setAttribute('aria-expanded','true');
  });
  close.addEventListener('click', () => menu.close());
  menu.addEventListener('click', (event) => { if (event.target === menu) menu.close(); });
  menu.addEventListener('close', () => {
    toggle.setAttribute('aria-expanded','false');
    if (destination) destination.focus({preventScroll:true});
    else if (mobile.matches) toggle.focus({preventScroll:true});
    destination = null;
  });
  menu.querySelectorAll('nav a').forEach((a) => a.addEventListener('click', () => {
    const href = a.getAttribute('href');
    if (href.startsWith('#')) {
      destination = document.getElementById(href.slice(1));
      if (destination && !destination.hasAttribute('tabindex')) destination.setAttribute('tabindex','-1');
    }
    menu.close();
  }));
  if (mobile.addEventListener) mobile.addEventListener('change', () => {
    if (!mobile.matches && menu.open) {
      destination = document.querySelector('body > header > nav a');
      menu.close();
    }
  });
})();

(() => {
  const work = document.querySelector('#work');
  const track = work?.querySelector('.project-track');
  if (!track) return;
  const cards = [...track.querySelectorAll('.project-card')];
  const controls = work.querySelector('.project-controls');
  const [previous, next] = controls.querySelectorAll('button');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const maxScroll = () => Math.max(0, track.scrollWidth - track.clientWidth);
  function updateButtons() {
    previous.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= maxScroll() - 2;
  }
  function step(direction) {
    const first = cards[0].getBoundingClientRect().left;
    const stops = [...new Set(cards.map(c => Math.min(maxScroll(), Math.round(c.getBoundingClientRect().left - first))))];
    const position = track.scrollLeft;
    const nextStop = direction > 0 ? stops.find(stop => stop > position + 3) : stops.reverse().find(stop => stop < position - 3);
    if (nextStop !== undefined) track.scrollTo({left:nextStop, behavior:motion.matches ? 'instant' : 'smooth'});
  }
  controls.hidden = false;
  previous.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  track.addEventListener('scroll',updateButtons,{passive:true});
  new ResizeObserver(updateButtons).observe(track);
  updateButtons();

  const dialog = work.querySelector('.project-dialog');
  if (typeof dialog.showModal !== 'function') return;
  const close = dialog.querySelector('.project-dialog-close');
  const title = dialog.querySelector('h3');
  const type = dialog.querySelector('.project-dialog-type');
  let image = dialog.querySelector('.project-dialog-media>img');
  const thumbnails = dialog.querySelector('.project-thumbnails');
  const caption = dialog.querySelector('figcaption');
  const description = dialog.querySelector('.project-dialog-description');
  const presets = dialog.querySelector('.project-presets');
  const swatches = dialog.querySelector('.project-swatches');
  const liveText = dialog.querySelector('.project-update');
  const link = dialog.querySelector('.project-dialog-link');
  let opener;
  let pointerDownOnBackdrop = false;

  function showPreset(data, announce) {
    const {name, src, alt, app} = data;
    title.textContent = name;
    // A cold image request must not display the previous preset underneath the new name.
    const nextImage = document.createElement('img');
    nextImage.alt = alt;
    nextImage.decoding = 'async';
    nextImage.src = src;
    image.replaceWith(nextImage);
    image = nextImage;
    caption.textContent = app ? 'Artwork from the Shopify App Store.' : name + ' preset demo storefront.';
    link.href = data.url;
    link.textContent = 'View on Shopify';
    if (announce) liveText.textContent = name + ' preset selected.';
  }

  for (const card of cards) {
    const button = card.querySelector('.project-preview');
    const fallback = card.querySelector('.project-fallback');
    const name = card.querySelector('h3').textContent;
    const variants = [...card.querySelectorAll('.project-fallback [data-image]')].map(variant => ({
      name:variant.textContent, src:variant.dataset.image, color:variant.dataset.color, url:variant.dataset.shopifyUrl,
      alt:variant.textContent + ' theme demo storefront', app:false
    }));
    const app = card.dataset.kind === 'app';
    button.hidden = false;
    let activeIndex = 0;
    let art = card.querySelector('.project-image img');
    const cardChoices = [];
    if (!app) {
      const section = card.querySelector('.project-card-presets');
      const label = section.querySelector('.project-card-selection');
      const group = section.querySelector('.project-card-swatches');
      group.setAttribute('aria-label', name + ' presets');
      function selectCard(index) {
        const data = variants[index];
        if (index !== activeIndex) {
          const nextArt = art.cloneNode();
          nextArt.alt = data.alt;
          nextArt.src = data.src;
          nextArt.decoding = 'async';
          art.replaceWith(nextArt);
          art = nextArt;
        }
        activeIndex = index;
        label.textContent = 'Preset: ' + data.name;
        cardChoices.forEach((choice, i) => choice.setAttribute('aria-pressed', String(i === index)));
      }
      variants.forEach((data, index) => {
        const choice = document.createElement('button');
        const square = document.createElement('i');
        choice.type = 'button';
        choice.title = data.name;
        choice.setAttribute('aria-label', data.name + ' preset');
        square.style.setProperty('--preset-color', data.color);
        square.setAttribute('aria-hidden','true');
        choice.append(square);
        choice.addEventListener('click', () => selectCard(index));
        cardChoices.push(choice);
        group.append(choice);
      });
      selectCard(0);
      section.hidden = false;
      card.selectPreset = selectCard;
    }
    if (fallback) fallback.hidden = true;
    button.addEventListener('click', () => {
      opener = button;
      pointerDownOnBackdrop = false;
      type.textContent = app ? 'Shopify app' : name + ' theme family';
      description.textContent = app
        ? 'I contributed to the bundle appearance editor with the Kitenzo team, alongside other features and fixes.'
        : 'I contributed to this theme family at Eight. Explore its current presets, which include later releases.';
      liveText.textContent = '';
      swatches.replaceChildren();
      thumbnails.replaceChildren();
      presets.hidden = thumbnails.hidden = app;
      if (app) {
        const original = card.querySelector('.project-image');
        const art = original.querySelector('img');
        showPreset({name, url:card.querySelector('.project-actions a').href, src:art.src, alt:art.alt, app}, false);
      } else {
        const choices = [];
        function select(index, announce) {
          if (announce && index === activeIndex) return;
          card.selectPreset(index);
          choices.forEach(({choice, thumb}, i) => {
            const pressed = String(i === index);
            choice.setAttribute('aria-pressed', pressed);
            thumb.setAttribute('aria-pressed', pressed);
          });
          showPreset(choices[index].data, announce);
        }
        variants.forEach(data => {
          const choice = document.createElement('button');
          const dot = document.createElement('i');
          const thumb = document.createElement('button');
          const preview = document.createElement('img');
          const {name} = data;
          choice.type = thumb.type = 'button';
          thumb.setAttribute('aria-label', name + ' thumbnail');
          preview.src = data.src;
          preview.alt = '';
          preview.decoding = 'async';
          thumb.append(preview);
          dot.style.setProperty('--preset-color', data.color);
          dot.setAttribute('aria-hidden','true');
          choice.append(dot, name);
          const index = choices.push({choice, thumb, data}) - 1;
          choice.addEventListener('click', () => select(index, true));
          thumb.addEventListener('click', () => select(index, true));
          swatches.append(choice);
          thumbnails.append(thumb);
        });
        select(activeIndex, false);
      }
      dialog.showModal();
      dialog.scrollTop = 0;
    });
  }
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('pointerdown', e => { pointerDownOnBackdrop = e.target === dialog; });
  dialog.addEventListener('click', e => {
    if (e.target === dialog && pointerDownOnBackdrop) dialog.close();
    pointerDownOnBackdrop = false;
  });
  dialog.addEventListener('close', () => {
    opener?.focus({preventScroll:true});
    opener = undefined;
  });
})();
