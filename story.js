const chapters = [...document.querySelectorAll('.chapter')];
const container = document.querySelector('.chapters');
const path = document.querySelector('.route path');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let active;
let timer;
function show(chapter, step) {
  chapter.dataset.step = step;
  chapter.querySelectorAll('.shot').forEach((shot,i) => { shot.hidden = i !== step; });
  chapter.querySelectorAll('.stages i').forEach((dot,i) => dot.classList.toggle('done',i <= step));

}
function play(chapter) {
  clearInterval(timer);
  if (!chapter || reduced.matches || document.hidden) return;
  timer = setInterval(() => {
    show(chapter, (Number(chapter.dataset.step) + 1) % chapter.querySelectorAll('.shot').length);
  }, 2700);
}
function focusChapter(chapter) {
  if (active === chapter) return;
  active?.classList.remove('current');
  active = chapter;
  if (active) {
    active.classList.add('current');
    show(active,0);
  }
  play(active);
}
function sync() {
  if (!reduced.matches) path.style.strokeDashoffset = String(-scrollY * 0.1);
  const line = innerHeight / 2;
  const target = chapters.find(chapter => {
    const box = chapter.getBoundingClientRect();
    return box.top <= line && box.bottom >= line;
  });
  focusChapter(target);
}
function draw() {
  const w = container.clientWidth;
  const mobile = innerWidth <= 720;
  let d = 'M ' + w * (mobile ? .05 : .5) + ' 0';
  for (const [i,chapter] of chapters.entries()) {
    const y = chapter.offsetTop;
    const h = chapter.offsetHeight;
    const x = w * (mobile ? .055 : .5);
    const bend = w * (mobile ? .04 : .29) * (i % 2 ? -1 : 1);
    d += ' C '+(x+bend)+' '+(y+h*.32)+' '+(x-bend)+' '+(y+h*.7)+' '+x+' '+(y+h);
  }
  path.setAttribute('d',d);
  sync();
}
for (const chapter of chapters) {
  show(chapter,0);
  chapter.querySelector('.play').onclick = () => {
    clearInterval(timer);
    const next = (Number(chapter.dataset.step)+1)%3;
    show(chapter,next);
    play(chapter);
  };
}
if (container) {
  container.classList.add('enhanced');
  container.addEventListener('focusin',event => {
    const chapter = event.target.closest('.chapter');
    if (chapter && active !== chapter) chapter.scrollIntoView({block:'center',behavior:'instant'});
  });
  addEventListener('scroll',sync,{passive:true});
  addEventListener('resize',draw);
  new ResizeObserver(draw).observe(container);
  document.addEventListener('visibilitychange',() => play(active));
  reduced.addEventListener('change',() => play(active));
  draw();
}

const pageHeader = document.querySelector('body > header');
const opening = document.querySelector('.opening');
if (opening) {
  function fitOpening() {
    opening.style.setProperty('--nav-height', pageHeader.offsetHeight + 'px');
  }
  fitOpening();
  new ResizeObserver(fitOpening).observe(pageHeader);
}

const comparison = document.querySelector('.comparison-hero');
if (comparison) {
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

const bench = document.querySelector('.demo-workbench');
if (bench) {
  const title = bench.querySelector('#section-title');
  const heading = bench.querySelector('.demo-heading');
  const note = bench.querySelector('#demo-note');
  const fix = bench.querySelector('#fix-wrap');
  const modeButtons = [...bench.querySelectorAll('[data-mode]')];
  const widthButtons = [...bench.querySelectorAll('[data-width]')];
  let mode = 'build';
  let narrow = false;
  let repaired = false;
  function renderDemo() {
    const qa = mode === 'qa';
    bench.classList.toggle('compact', narrow || qa);
    bench.classList.toggle('regression', qa && !repaired);
    heading.textContent = mode === 'reuse' ? title.value : title.defaultValue;
    modeButtons.forEach(button => {
      const selected = button.dataset.mode === mode;
      button.setAttribute('aria-pressed', String(selected));
      bench.querySelector('#' + button.dataset.mode + '-controls').hidden = !selected;
    });
    widthButtons.forEach(button => button.setAttribute('aria-pressed', String((button.dataset.width === 'narrow') === narrow)));
    fix.setAttribute('aria-pressed', String(repaired));
    fix.textContent = repaired ? 'Show original issue' : 'Apply layout fix';
    if (qa) note.textContent = repaired ? 'The actions wrap onto two lines, so both labels fit.' : 'The size guide is clipped at this width. Apply the fix to check both actions.';
    if (mode === 'reuse') note.textContent = 'Edit the heading to see one section take different content.';
    if (mode === 'build') note.textContent = narrow ? 'At a narrow width, the content stacks below the image.' : 'Resize the preview to see the image and text move from two columns to one.';
  }
  modeButtons.forEach(button => button.onclick = () => { mode = button.dataset.mode; renderDemo(); });
  widthButtons.forEach(button => button.onclick = () => { narrow = button.dataset.width === 'narrow'; renderDemo(); });
  fix.onclick = () => { repaired = !repaired; renderDemo(); };
  title.oninput = () => { heading.textContent = title.value; };
  renderDemo();
}
