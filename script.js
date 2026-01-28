const API_URL = "https://ocean-q2uw.onrender.com/music";
const WS_URL = "wss://ocean-q2uw.onrender.com";

const cover = document.getElementById("cover");
const title = document.getElementById("title");
const artist = document.getElementById("artist");
const current = document.getElementById("current");
const duration = document.getElementById("duration");
const fill = document.getElementById("fill");

let startTimestamp = 0;
let startSeconds = 0;
let totalSeconds = 0;
let rafId = null;

/* "2m 4s" → segundos */
function parseTime(time) {
  const match = time?.match(/(\d+)m\s*(\d+)s/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : 0;
}

/* segundos → m:ss */
function format(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function startProgress() {
  cancelAnimationFrame(rafId);

  function tick() {
    const elapsed = (Date.now() - startTimestamp) / 1000;
    const currentSec = Math.min(startSeconds + elapsed, totalSeconds);

    current.textContent = format(currentSec);
    fill.style.width = `${(currentSec / totalSeconds) * 100}%`;

    if (currentSec < totalSeconds) {
      rafId = requestAnimationFrame(tick);
    }
  }

  rafId = requestAnimationFrame(tick);
}

function updateUI(data) {
  cover.src = data.capa;
  title.textContent = data.titulo;
  artist.textContent = data.artista;

  startSeconds = parseTime(data.tempoAtual);
  totalSeconds = parseTime(data.duracao);

  current.textContent = format(startSeconds);
  duration.textContent = format(totalSeconds);

  startTimestamp = Date.now();
  startProgress();

  /* background */
  if (data.cores) {
    document.body.style.setProperty(
      "--bg-gradient",
      `linear-gradient(135deg,
        ${data.cores.escura},
        ${data.cores.dominante},
        ${data.cores.clara}
      )`
    );
  }
}

/* inicial */
fetch(API_URL)
  .then(r => r.json())
  .then(updateUI);

/* websocket */
const ws = new WebSocket(WS_URL);
ws.onmessage = e => {
  const msg = JSON.parse(e.data);
  if (msg.type === "music_update") {
    updateUI(msg.data);
  }
};