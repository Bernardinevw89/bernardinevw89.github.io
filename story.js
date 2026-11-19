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

const reel = document.querySelector('.reel');
if (reel) {
  const frames = [...reel.querySelectorAll('.reel-frame')];
  const buttons = [...reel.querySelectorAll('.reel-steps button')];
  const toggle = reel.querySelector('.reel-toggle');
  const video = reel.querySelector('.sway-video');
  const boardRecording = reel.querySelector('.board-recording');
  const boardTarget = reel.querySelector('.capture-target');
  const designLink = reel.querySelector('.ticket-hotspot');
  const ticketTime = 2;
  let index = 0;
  let playing = !reduced.matches;
  let visible = true;
  let timeout;
  function setStage(next) {
    index = next;
    const frameIndex = Math.max(0, index - 1);
    frames.forEach((frame,i) => { frame.hidden = i !== frameIndex; });
    buttons.forEach((button,i) => button.setAttribute('aria-pressed', String(i === index)));
    boardTarget.hidden = index !== 0;
    designLink.hidden = index !== 1;
  }
  function renderReel() {
    clearTimeout(timeout);
    const running = playing && visible && !document.hidden;
    const label = playing ? 'Pause' : 'Play';
    toggle.textContent = label;
    toggle.setAttribute('aria-label', label + ' animation');
    reel.classList.toggle('stopped', !running);
    const clip = index < 2 ? boardRecording : index === 4 ? video : null;
    for (const media of [boardRecording,video]) if (media !== clip || !running) media.pause();
    if (!running) return;
    if (clip) {
      clip.play().catch(error => {
        if (error.name !== 'AbortError' && playing && visible && !document.hidden)
          timeout = setTimeout(() => go(clip === boardRecording ? 2 : 0),4500);
      });
    } else timeout = setTimeout(() => go(index + 1),4500);
  }
  function go(next) {
    setStage(next);
    if (next < 2) boardRecording.currentTime = next === 0 ? 0 : ticketTime;
    if (next === 4) video.currentTime = 0;
    renderReel();
  }
  boardRecording.addEventListener('timeupdate', () => {
    if (index === 0 && boardRecording.currentTime >= ticketTime) setStage(1);
  });
  boardRecording.addEventListener('ended', () => go(2));
  video.addEventListener('ended', () => go(0));
  boardTarget.onclick = () => { go(1); designLink.focus({preventScroll:true}); };
  designLink.onclick = event => {
    event.preventDefault();
    go(2);
    buttons[2].focus({preventScroll:true});
  };
  reel.querySelectorAll('.dock-icon').forEach((target,i) => {
    target.onclick = () => { go(i + 3); buttons[index].focus({preventScroll:true}); };
  });
  buttons.forEach((button,i) => button.onclick = () => {
    reel.classList.toggle('manual', !playing);
    go(i);
  });
  toggle.onclick = () => {
    playing = !playing;
    if (playing) reel.classList.remove('manual');
    renderReel();
  };
  reduced.addEventListener('change', () => { playing = !reduced.matches; renderReel(); });
  document.addEventListener('visibilitychange',renderReel);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; renderReel(); }).observe(reel);
  if (location.hash === '#hero-design') go(2);
  else renderReel();
}
