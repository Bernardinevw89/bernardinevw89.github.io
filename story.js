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
  chapter.querySelector('.play').textContent = step === 2 ? 'Replay scene' : 'Next step';
}
function play(chapter) {
  clearInterval(timer);
  if (!chapter || reduced.matches || document.hidden) return;
  timer = setInterval(() => {
    const step = Number(chapter.dataset.step);
    if (step < 2) show(chapter, step + 1);
    if (step >= 1) clearInterval(timer);
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
    if (next === 0) play(chapter);
  };
}
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

const pageHeader = document.querySelector('body > header');
const opening = document.querySelector('.opening');
if (opening) {
  function fitOpening() {
    opening.style.setProperty('--nav-height', pageHeader.offsetHeight + 'px');
  }
  fitOpening();
  new ResizeObserver(fitOpening).observe(pageHeader);
}
