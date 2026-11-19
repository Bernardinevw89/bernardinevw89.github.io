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
  if (innerWidth > 720) {
    revealTarget = Math.max(0, Math.min(routeHeight, scrollY + innerHeight * .74 - routeStart));
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
  // Track only the mobile journey, from its top to the last chapter in view.
  if (innerWidth <= 720 && pageHeader) {
    const box = container.getBoundingClientRect();
    const headerHeight = pageHeader.offsetHeight;
    const readingSpan = Math.max(1, box.height - (innerHeight - headerHeight));
    const ratio = Math.min(1, Math.max(0, (headerHeight - box.top) / readingSpan));
    pageHeader.classList.toggle('journey-progress-visible', box.top <= headerHeight + 1 && box.bottom > headerHeight);
    pageHeader.style.setProperty('--journey-progress', (ratio * 100).toFixed(2) + '%');
  } else if (pageHeader) {
    pageHeader.classList.remove('journey-progress-visible');
  }
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
