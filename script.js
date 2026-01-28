const API_URL = "https://ocean-q2uw.onrender.com/music";
const WS_URL = "wss://ocean-q2uw.onrender.com";

const cover = document.getElementById("cover");
const title = document.getElementById("title");
const artist = document.getElementById("artist");
const current = document.getElementById("current");
const duration = document.getElementById("duration");
const fill = document.getElementById("fill");

let currentSeconds = 0;
let totalSeconds = 0;
let timer = null;

/* "2m 4s" → segundos */
function parseTime(time) {
  if (!time) return 0;

  const match = time.match(/(\d+)m\s*(\d+)s/);
  if (!match) return 0;

  return Number(match[1]) * 60 + Number(match[2]);
}

/* segundos → "m:ss" */
function formatSeconds(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* Inicia / reinicia o timer */
function startTimer() {
  if (timer) clearInterval(timer);

  timer = setInterval(() => {
    if (currentSeconds >= totalSeconds) return;

    currentSeconds++;

    current.textContent = formatSeconds(currentSeconds);

    const progress = (currentSeconds / totalSeconds) * 100;
    fill.style.width = `${progress}%`;
  }, 1000);
}

function updateUI(data) {
  cover.src = data.capa;
  title.textContent = data.titulo;
  artist.textContent = data.artista;

  currentSeconds = parseTime(data.tempoAtual);
  totalSeconds = parseTime(data.duracao);

  current.textContent = formatSeconds(currentSeconds);
  duration.textContent = formatSeconds(totalSeconds);

  fill.style.width = `${(currentSeconds / totalSeconds) * 100}%`;

  startTimer();

  /* Background */
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

/* Estado inicial */
fetch(API_URL)
  .then(res => res.json())
  .then(updateUI)
  .catch(() => {});

/* WebSocket */
const ws = new WebSocket(WS_URL);

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);

  if (msg.type === "music_update") {
    updateUI(msg.data);
  }
};
