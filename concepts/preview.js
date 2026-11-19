const beats = [...document.querySelectorAll('.beat')];
const shots = [...document.querySelectorAll('.shot')];
if (beats.length) {
  function frame() {
    const line = innerHeight * (innerWidth <= 700 ? 0.72 : 0.56);
    const active = beats.filter(beat => beat.getBoundingClientRect().top <= line).length - 1;
    shots.forEach((shot, i) => { shot.hidden = i !== Math.max(0, active); });
  }
  addEventListener('scroll', frame, {passive:true});
  addEventListener('resize', frame);
  frame();
}
const stops = [...document.querySelectorAll('[data-stop]')];
if (stops.length) {
  const records = document.querySelectorAll('[data-record]');
  const advance = document.querySelector('#advance');
  let current = 0;
  function show(i) {
    current = i;
    stops.forEach((button, n) => button.setAttribute('aria-pressed', String(n === i)));
    records.forEach((record, n) => { record.hidden = n !== i; });
    advance.textContent = ['Trace the ticket →','Open the preview →','Follow the handoff →','Replay the case'][i];
  }
  stops.forEach((stop,i) => stop.onclick = () => show(i));
  advance.onclick = () => show((current + 1) % stops.length);
}
const range = document.querySelector('#divider');
if (range) {
  const wipe = document.querySelector('.wipe');
  const adjust = () => wipe.style.setProperty('--split', range.value + '%');
  range.oninput = adjust;
  function drag(event) {
    const rect = wipe.getBoundingClientRect();
    range.value = String(100 * (event.clientX - rect.left) / rect.width);
    adjust();
  }
  wipe.onpointerdown = event => { wipe.setPointerCapture(event.pointerId); drag(event); };
  wipe.onpointermove = event => { if (wipe.hasPointerCapture(event.pointerId)) drag(event); };
  document.querySelector('#resume').onclick = () => {
    document.querySelector('.interrupt').open = false;
    document.querySelector('#resumed').textContent = 'Back in the sprint. Your layout comparison is just where you left it.';
    range.focus({preventScroll:true});
  };
}
