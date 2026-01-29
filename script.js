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
let lastTrackId = null;

function parseMs(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && /^\d+$/.test(value)) return Number(value);
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
  if (!data || !data.titulo) return;

  const trackId = `${data.titulo}-${data.artista}-${data.album}`;

  cover.src = data.capa;
  title.textContent = data.titulo;
  artist.textContent = data.artista;
  album.textContent = data.album || "Single";

  const newStartMs = parseMs(data.tempoAtual);
  const newTotalMs = parseMs(data.duracao);

  if (trackId !== lastTrackId) {
    startMs = newStartMs;
    totalMs = newTotalMs;

    current.textContent = formatMs(startMs);
    duration.textContent = formatMs(totalMs);

    startTimestamp = Date.now();
    startProgress();

    lastTrackId = trackId;
  }
}

fetch(API_URL)
  .then(r => r.json())
  .then(updateUI)
  .catch(() => {});

const ws = new WebSocket(WS_URL);

ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.type === "music_update") {
    updateUI(msg.data);
  }
};

ws.onerror = () => {
  console.error("Erro no WebSocket");
};

ws.onclose = () => {
  console.warn("WebSocket desconectado");
};