const scenes = document.querySelectorAll('.scene');
for (const scene of scenes) {
  const steps = scene.querySelectorAll('.step');
  const panels = scene.querySelectorAll('.panel');
  steps.forEach((step, index) => step.addEventListener('click', () => {
    steps.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    panels.forEach((panel, i) => { panel.hidden = i !== index; });
  }));
}
const links = document.querySelectorAll('.rail a');
const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      links.forEach(link => link.toggleAttribute('data-current', link.hash === '#' + entry.target.id));
    }
  }
}, {rootMargin: '-20% 0px -45%'});
scenes.forEach(scene => observer.observe(scene));
