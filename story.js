const power = document.querySelector('#power');
const desktop = document.querySelector('#desktop');
power.addEventListener('click', () => {
  document.querySelector('#lock').hidden = true;
  desktop.hidden = false;
  desktop.querySelector('button').focus({preventScroll: true});
});
const panel = document.querySelector('#panel');
panel.setAttribute('aria-labelledby', 'paneltitle');
for (const folder of document.querySelectorAll('.folder')) {
  folder.addEventListener('click', () => {
    const name = folder.dataset.open;
    if (name === 'journey') {
      location.hash = 'journey';
      document.querySelector('#journey').scrollIntoView();
      return;
    }
    for (const section of panel.querySelectorAll('section')) section.hidden = section.id !== name;
    document.querySelector('#paneltitle').textContent = folder.textContent;
    panel.showModal();
    panel.scrollTop = 0;
  });
}
document.querySelector('#close').onclick = () => panel.close();
const beats = [...document.querySelectorAll('.beat')];
const frames = [...document.querySelectorAll('.frame')];
function updateFrame() {
  const line = innerHeight * (innerWidth <= 700 ? 0.76 : 0.58);
  const index = Math.max(0, beats.filter(beat => beat.getBoundingClientRect().top <= line).length - 1);
  frames.forEach((frame, i) => { frame.hidden = index !== i; });
}
addEventListener('scroll', updateFrame, {passive: true});
addEventListener('resize', updateFrame);
updateFrame();
