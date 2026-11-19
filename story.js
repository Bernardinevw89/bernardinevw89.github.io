const timeline = document.querySelector('.timeline');
const art = document.querySelector('.art');
const milestones = [...document.querySelectorAll('.milestone')];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
function updateMotion() {
  if (art) {
    const offset = reduced.matches ? 0 : Math.min(1, scrollY / innerHeight);
    art.style.setProperty('--motion', offset);
  }
  if (timeline) {
    const bounds = timeline.getBoundingClientRect();
    const readingLine = innerHeight * 0.62;
    const progress = Math.max(0, Math.min(1, (readingLine - bounds.top) / bounds.height));
    timeline.style.setProperty('--progress', reduced.matches ? '100%' : progress * 100 + '%');
    for (const milestone of milestones) {
      const box = milestone.getBoundingClientRect();
      milestone.classList.toggle('passed', box.top + box.height / 2 <= readingLine);
    }
  }
}
let queued = false;
function scheduleMotion() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { updateMotion(); queued = false; });
}
addEventListener('scroll', scheduleMotion, {passive:true});
addEventListener('resize', scheduleMotion);
reduced.addEventListener('change', scheduleMotion);
updateMotion();
if ('IntersectionObserver' in window) {
  document.documentElement.classList.add('js');
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.remove('pending');
        observer.unobserve(entry.target);
      }
    }
  }, {threshold:0.1});
  for (const element of document.querySelectorAll('.cards article, .milestone, .more h2')) {
    element.classList.add('reveal','pending');
    observer.observe(element);
  }
}
