const API_URL = "https://ocean-q2uw.onrender.commusic";
const WS_URL = "wss://ocean-q2uw.onrender.com";

const cover = document.getElementById("cover");
const title = document.getElementById("title");
const artist = document.getElementById("artist");
const current = document.getElementById("current");
const duration = document.getElementById("duration");
const fill = document.getElementById("fill");
const player = document.getElementById("player");

function timeToSeconds(time) {
  const [m, s] = time.split(":").map(Number);
  return m * 60 + s;
}

function updateUI(data) {
  cover.src = data.capa;
  title.textContent = data.titulo;
  artist.textContent = data.artista;
  current.textContent = data.tempoAtual;
  duration.textContent = data.duracao;

  const progress =
    (timeToSeconds(data.tempoAtual) /
      timeToSeconds(data.duracao)) * 100;

  fill.style.width = `${progress}%`;

  player.style.background = data.cores.dominante || "#18181d";
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
