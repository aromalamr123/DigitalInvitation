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
    startRings();
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
  document.querySelectorAll('.invitation,.quote-band,.event-card,.scratch-inner,footer').forEach((element) => {
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
  const label = document.querySelector('#countdown-label');
  if (label) label.textContent = remaining ? 'COUNTING DOWN TO “I DO”' : 'WE SAID “I DO” · THANK YOU FOR CELEBRATING WITH US';
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


// ---------------------------------------------------------------------------
// Floating rings
// After the envelope opens, one ring rests on each side of the screen. As the
// guest scrolls, the rings tumble gently along the edges; when the "Joined in
// love" section arrives they glide to the centre and lock together, then the
// ring photo appears. Scrolling back up separates them again.
// ---------------------------------------------------------------------------
const ringLeft = document.querySelector('.float-ring-left');
const ringRight = document.querySelector('.float-ring-right');
const ringSlot = document.querySelector('#ring-slot');
const ringSection = document.querySelector('#rings');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let ringsStartedAt = 0;
let ringsRunning = false;

const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

function setJoined(joined) {
  document.body.classList.toggle('rings-joined', joined);
  ringSection.classList.toggle('rings-joined', joined);
}

function startRings() {
  if (reduceMotion.matches) {
    setJoined(true);
    return;
  }
  ringsStartedAt = performance.now();
  document.body.classList.add('rings-live');
  if (!ringsRunning) {
    ringsRunning = true;
    requestAnimationFrame(drawRings);
  }
}

function placeRing(el, x, y, size, rotate, tilt) {
  el.style.setProperty('--size', `${size}px`);
  el.style.transform = `translate3d(${x - size / 2}px, ${y - size / 2}px, 0) rotate(${rotate}deg) rotateX(${tilt}deg)`;
}

function drawRings(now) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scrollY = window.scrollY;
  const slot = ringSlot.getBoundingClientRect();

  // Scroll position at which the join slot sits ~40% down the screen.
  const maxScroll = document.documentElement.scrollHeight - vh;
  const slotDocCentre = slot.top + scrollY + slot.height / 2;
  const joinScroll = clamp(slotDocCentre - vh * .4, 1, Math.max(1, maxScroll));
  const journey = clamp(scrollY / joinScroll);                  // 0 → 1 across the page
  const approach = easeInOut(clamp((scrollY - (joinScroll - vh * .85)) / (vh * .85)));
  const entry = easeOut(clamp((now - ringsStartedAt) / 1300)); // slide in after opening
  const t = now / 1000;

  const edgeSize = clamp(vw * .19, 62, 92);
  const joinSize = slot.height;
  const size = lerp(edgeSize, joinSize, approach);
  const wander = 1 - approach;

  // Resting spots on the edges, each partly tucked off-screen.
  const leftEdge = {
    x: lerp(-edgeSize, edgeSize * .06, entry) + Math.sin(t * .9) * 4,
    y: vh * (.3 + .07 * Math.sin(journey * Math.PI * 3)) + Math.sin(t * 1.3) * 7,
  };
  const rightEdge = {
    x: lerp(vw + edgeSize, vw - edgeSize * .06, entry) + Math.sin(t * .8 + 1) * 4,
    y: vh * (.66 - .07 * Math.sin(journey * Math.PI * 3 + .8)) + Math.sin(t * 1.2 + 2) * 7,
  };

  // Where each ring sits once they have joined (matches the SVG in #ring-slot).
  const offset = joinSize * .3;
  const cx = slot.left + slot.width / 2;
  const cy = slot.top + slot.height / 2;

  const spin = journey * 540;
  placeRing(
    ringLeft,
    lerp(leftEdge.x, cx - offset, approach),
    lerp(leftEdge.y, cy, approach),
    size,
    lerp(spin + Math.sin(t) * 10, 0, approach),
    (50 + Math.sin(t * .7) * 18) * wander,
  );
  placeRing(
    ringRight,
    lerp(rightEdge.x, cx + offset, approach),
    lerp(rightEdge.y, cy, approach),
    size,
    lerp(-spin - Math.sin(t + 1) * 10, 0, approach),
    (55 + Math.sin(t * .6 + 1.5) * 18) * wander,
  );

  const joined = document.body.classList.contains('rings-joined');
  if (!joined && approach > .995) setJoined(true);
  else if (joined && approach < .97) setJoined(false);

  requestAnimationFrame(drawRings);
}

reduceMotion.addEventListener?.('change', () => {
  if (reduceMotion.matches) setJoined(true);
});
