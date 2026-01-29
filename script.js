const API_URL = "https://ocean-q2uw.onrender.com/music";
const WS_URL = "wss://ocean-q2uw.onrender.com";

const cover = document.getElementById("cover");
const title = document.getElementById("title");
const album = document.getElementById("album");
const artist = document.getElementById("artist");
const current = document.getElementById("current");
const duration = document.getElementById("duration");
const fill = document.getElementById("fill");

let startTimestamp = 0;
let startMs = 0;
let totalMs = 0;
let rafId = null;

function parseTimeMs(time) {
  if (typeof time === "number") return time;

  if (typeof time === "string") {
    if (time.includes(":")) {
      const [m, s] = time.split(":").map(Number);
      return ((m * 60) + s) * 1000;
    }
    const match = time.match(/(?:(\d+)m)?\s*(?:(\d+)s)?/);
    if (match) {
      const m = Number(match[1] || 0);
      const s = Number(match[2] || 0);
      return ((m * 60) + s) * 1000;
    }
  }

  return 0;
}

function formatMs(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function startProgress() {
  cancelAnimationFrame(rafId);

  function tick() {
    const elapsedMs = Date.now() - startTimestamp;
    const currentMs = Math.min(startMs + elapsedMs, totalMs);

    current.textContent = formatMs(currentMs);

    if (totalMs > 0) {
      fill.style.width = `${(currentMs / totalMs) * 100}%`;
    } else {
      fill.style.width = "0%";
    }

    if (currentMs < totalMs) {
      rafId = requestAnimationFrame(tick);
    }
  }

  rafId = requestAnimationFrame(tick);
}

function updateUI(data) {
  if (!data || !data.titulo) {
    title.textContent = "Nada tocando";
    artist.textContent = "—";
    album.textContent = "—";
    cover.src = "placeholder.png";
    current.textContent = "0:00";
    duration.textContent = "0:00";
    fill.style.width = "0%";
    cancelAnimationFrame(rafId);
    return;
  }

  cover.src = data.capa;
  title.textContent = data.titulo;
  album.textContent = data.album || "Single";
  artist.textContent = data.artista;

  startMs = parseTimeMs(data.tempoAtual);
  totalMs = parseTimeMs(data.duracao);

  current.textContent = formatMs(startMs);
  duration.textContent = formatMs(totalMs);

  startTimestamp = Date.now();
  startProgress();
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

fetch(API_URL)
  .then(r => r.json())
  .then(updateUI)
  .catch(() => updateUI(null));

const ws = new WebSocket(WS_URL);

ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.type === "music_update") {
    updateUI(msg.data);
  }
};

ws.onclose = () => {
  console.warn("WebSocket desconectado");
};

ws.onerror = () => {
  console.error("Erro no WebSocket");
};
