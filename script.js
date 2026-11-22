// Wedding details live in one place so the invitation is easy to personalize.
const wedding = {
  date: new Date('2026-10-17T16:00:00-07:00'),
};

const intro = document.querySelector('#intro');
const openButton = document.querySelector('#open-invitation');
const audio = document.querySelector('#wedding-audio');
const audioToggle = document.querySelector('#audio-toggle');
const audioStatus = document.querySelector('#audio-status');

function updateAudioControl() {
  const isMuted = audio.muted || audio.paused;
  audioToggle.classList.toggle('is-muted', isMuted);
  audioToggle.setAttribute('aria-pressed', String(!isMuted));
  audioToggle.setAttribute('aria-label', isMuted ? 'Play wedding music' : 'Mute wedding music');
  audioToggle.title = isMuted ? 'Play wedding music' : 'Mute wedding music';
}

audio.addEventListener('play', updateAudioControl);
audio.addEventListener('pause', updateAudioControl);
audio.addEventListener('volumechange', updateAudioControl);
audio.addEventListener('error', () => {
  audioToggle.classList.add('is-muted');
  audioToggle.setAttribute('aria-label', 'Wedding music is unavailable');
  audioToggle.title = 'Wedding music is unavailable';
});
audioToggle.addEventListener('click', async () => {
  if (audio.paused) {
    audio.muted = false;
    try { await audio.play(); } catch { updateAudioControl(); }
  } else {
    audio.muted = !audio.muted;
    updateAudioControl();
  }
});
updateAudioControl();

document.body.style.overflow = 'hidden';
openButton.addEventListener('click', () => {
  if (intro.classList.contains('is-opening')) return;
  intro.classList.add('is-opening');
  audio.play().then(() => {
    if (audioStatus) audioStatus.textContent = 'Wedding music is playing';
    updateAudioControl();
  }).catch(() => {
    if (audioStatus) audioStatus.textContent = 'Tap the headphones to play the music';
    updateAudioControl();
  });
  window.setTimeout(() => {
    intro.classList.add('is-done');
    intro.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.querySelector('#home').scrollIntoView({ behavior: 'smooth' });
  }, 850);
});

// The card can be scratched with a finger or mouse; the button and Enter key
// provide the same reveal for guests who prefer not to use a scratch gesture.
const scratchCard = document.querySelector('#scratch-card');
const canvas = document.querySelector('#scratch-canvas');
const countdown = document.querySelector('#countdown');
const brush = canvas.getContext('2d', { willReadFrequently: true });
let scratching = false;
let checks = 0;

function paintScratchCard() {
  const bounds = canvas.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(bounds.width * ratio);
  canvas.height = Math.round(bounds.height * ratio);
  brush.setTransform(ratio, 0, 0, ratio, 0, 0);
  brush.globalCompositeOperation = 'source-over';
  brush.fillStyle = '#bc9181';
  brush.fillRect(0, 0, bounds.width, bounds.height);
  brush.strokeStyle = '#ead7c7';
  brush.lineWidth = 1;
  for (let x = 9; x < bounds.width; x += 13) {
    brush.globalAlpha = .19;
    brush.beginPath();
    brush.moveTo(x, 0);
    brush.lineTo(x + 22, bounds.height);
    brush.stroke();
  }
  brush.globalAlpha = 1;
  brush.fillStyle = '#fff5e8';
  brush.textAlign = 'center';
  brush.font = '10px "DM Sans", sans-serif';
  brush.letterSpacing = '2px';
  brush.fillText('SCRATCH TO REVEAL', bounds.width / 2, bounds.height / 2 + 4);
  brush.globalCompositeOperation = 'destination-out';
}

function revealDate() {
  scratchCard.classList.add('revealed');
  canvas.setAttribute('aria-hidden', 'true');
  document.querySelector('#reveal-date').hidden = true;
  countdown.hidden = false;
  countdown.classList.add('countdown-visible');
}

function scratchAt(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  brush.beginPath();
  brush.arc(x, y, 20, 0, Math.PI * 2);
  brush.fill();
  if (++checks % 12 === 0) {
    const pixels = brush.getImageData(0, 0, canvas.width, canvas.height).data;
    let erased = 0;
    let total = 0;
    for (let i = 3; i < pixels.length; i += 4 * 24) {
      total++;
      if (pixels[i] === 0) erased++;
    }
    if (erased / total > .4) revealDate();
  }
}

paintScratchCard();
window.addEventListener('resize', paintScratchCard);
canvas.addEventListener('pointerdown', (event) => {
  if (scratchCard.classList.contains('revealed')) return;
  scratching = true;
  canvas.setPointerCapture(event.pointerId);
  scratchAt(event);
});
canvas.addEventListener('pointermove', (event) => {
  if (scratching) scratchAt(event);
});
canvas.addEventListener('pointerup', () => { scratching = false; });
canvas.addEventListener('pointercancel', () => { scratching = false; });
canvas.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    revealDate();
  }
});
document.querySelector('#reveal-date').addEventListener('click', revealDate);

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: .12 });
  document.querySelectorAll('.invitation,.quote-band,.event-card,.scratch-inner,.rings-journey,footer').forEach((element) => {
    element.classList.add('js-reveal');
    revealObserver.observe(element);
  });
}

const fields = {
  days: document.querySelector('#days'),
  hours: document.querySelector('#hours'),
  minutes: document.querySelector('#minutes'),
  seconds: document.querySelector('#seconds'),
};

function updateCountdown() {
  let remaining = Math.max(0, wedding.date.getTime() - Date.now());
  const day = 86400000;
  const hour = 3600000;
  const minute = 60000;
  fields.days.textContent = Math.floor(remaining / day);
  remaining %= day;
  fields.hours.textContent = Math.floor(remaining / hour);
  remaining %= hour;
  fields.minutes.textContent = Math.floor(remaining / minute);
  fields.seconds.textContent = Math.floor((remaining % minute) / 1000);
}

updateCountdown();
setInterval(updateCountdown, 1000);

