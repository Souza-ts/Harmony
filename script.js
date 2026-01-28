const API_URL = "https://sua-api.onrender.com/music";
const WS_URL = "wss://sua-api.onrender.com";

/* ELEMENTOS */
const cover = document.getElementById("cover");
const title = document.getElementById("title");
const artist = document.getElementById("artist");
const current = document.getElementById("current");
const duration = document.getElementById("duration");
const fill = document.getElementById("fill");
const player = document.getElementById("player");

/* ESTADO */
let currentSeconds = 0;
let totalSeconds = 0;
let progressInterval = null;

/* =========================
   UTILIDADES
========================= */

function normalizeTime(time) {
  if (!time) return "0:00";
  if (time.includes(":")) return time;

  const min = time.match(/(\d+)m/);
  const sec = time.match(/(\d+)s/);

  const m = min ? Number(min[1]) : 0;
  const s = sec ? Number(sec[1]) : 0;

  return `${m}:${s.toString().padStart(2, "0")}`;
}

function timeToSeconds(time) {
  const [m, s] = normalizeTime(time).split(":").map(Number);
  return m * 60 + s;
}

function secondsToTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* =========================
   BACKGROUND ANIMADO
========================= */

function setBackground(cores) {
  const c1 = cores?.dominante || "#18181d";
  const c2 = cores?.escura || cores?.clara || "#0f0f12";

  document.body.style.background = `
    linear-gradient(120deg, ${c1}, ${c2})
  `;

  document.body.style.backgroundSize = "400% 400%";
  document.body.style.animation = "bgMove 12s ease infinite";
}

/* =========================
   PROGRESSO EM TEMPO REAL
========================= */

function startProgress() {
  clearInterval(progressInterval);

  progressInterval = setInterval(() => {
    if (currentSeconds >= totalSeconds) {
      clearInterval(progressInterval);
      return;
    }

    currentSeconds += 1;

    current.textContent = secondsToTime(currentSeconds);
    fill.style.width = `${(currentSeconds / totalSeconds) * 100}%`;
  }, 1000);
}

/* =========================
   ATUALIZAR UI
========================= */

function updateUI(data) {
  cover.src = data.capa;
  title.textContent = data.titulo;
  artist.textContent = data.artista;

  const currentTime = normalizeTime(data.tempoAtual);
  const durationTime = normalizeTime(data.duracao);

  current.textContent = currentTime;
  duration.textContent = durationTime;

  currentSeconds = timeToSeconds(currentTime);
  totalSeconds = timeToSeconds(durationTime);

  fill.style.width = `${(currentSeconds / totalSeconds) * 100}%`;

  setBackground(data.cores);
  startProgress();

  /* Animação suave ao trocar música */
  player.animate(
    [
      { transform: "scale(0.96)", opacity: 0.6 },
      { transform: "scale(1)", opacity: 1 }
    ],
    { duration: 500, easing: "ease-out" }
  );
}

/* =========================
   ESTADO INICIAL (GET)
========================= */

fetch(API_URL)
  .then(res => res.json())
  .then(updateUI)
  .catch(() => {});

/* =========================
   WEBSOCKET
========================= */

const ws = new WebSocket(WS_URL);

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);

  if (msg.type === "music_update") {
    updateUI(msg.data);
  }
};

/* =========================
   CSS DINÂMICO (ANIMAÇÕES)
========================= */

const style = document.createElement("style");
style.innerHTML = `
@keyframes bgMove {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  background: inherit;
  filter: blur(60px);
  opacity: 0.6;
  z-index: -1;
}
`;
document.head.appendChild(style);
