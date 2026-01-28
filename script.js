const API_URL = "https://ocean-q2uw.onrender.com/music";
const WS_URL = "wss://ocean-q2uw.onrender.com";

const cover = document.getElementById("cover");
const title = document.getElementById("title");
const artist = document.getElementById("artist");
const current = document.getElementById("current");
const duration = document.getElementById("duration");
const fill = document.getElementById("fill");
const player = document.getElementById("player");

/* Converte "2m 4s" → "2:04" */
function formatTime(time) {
  if (!time) return "0:00";

  const match = time.match(/(\d+)m\s*(\d+)s/);
  if (!match) return time;

  return `${match[1]}:${match[2].padStart(2, "0")}`;
}

/* "mm:ss" → segundos */
function timeToSeconds(time) {
  const [m, s] = time.split(":").map(Number);
  return m * 60 + s;
}

function updateUI(data) {
  const currentFormatted = formatTime(data.tempoAtual);
  const durationFormatted = formatTime(data.duracao);

  cover.src = data.capa;
  title.textContent = data.titulo;
  artist.textContent = data.artista;
  current.textContent = currentFormatted;
  duration.textContent = durationFormatted;

  const progress =
    (timeToSeconds(currentFormatted) /
      timeToSeconds(durationFormatted)) * 100;

  fill.style.width = `${progress}%`;

  /* CORES NO BACKGROUND (BODY) */
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
