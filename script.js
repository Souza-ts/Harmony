const API_URL = "https://ocean-q2uw.onrender.com/music";
const WS_URL = "wss://ocean-q2uw.onrender.com";

const cover = document.getElementById("cover");
const title = document.getElementById("title");
const album = document.getElementById("album");
const artist = document.getElementById("artist");
const current = document.getElementById("current");
const duration = document.getElementById("duration");
const fill = document.getElementById("fill");
const lyricsEl = document.getElementById("lyrics");

let startTimestamp = 0;
let startMs = 0;
let totalMs = 0;
let rafId = null;
let lastTrackId = null;

/* ⏱️ Tempo em ms */
function parseMs(v) {
  if (typeof v === "number") return v;
  if (typeof v === "string" && /^\d+$/.test(v)) return Number(v);
  return 0;
}

function formatMs(ms) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/* ▶️ Progresso */
function startProgress() {
  cancelAnimationFrame(rafId);

  function tick() {
    const elapsed = Date.now() - startTimestamp;
    const currentMs = Math.min(startMs + elapsed, totalMs);

    current.textContent = formatMs(currentMs);
    fill.style.width = totalMs ? `${(currentMs / totalMs) * 100}%` : "0%";

    if (currentMs < totalMs) {
      rafId = requestAnimationFrame(tick);
    }
  }

  rafId = requestAnimationFrame(tick);
}

/* 🎤 Letras */
function renderLyrics(lyrics) {
  if (!lyrics) {
    lyricsEl.className = "lyrics empty";
    lyricsEl.textContent = "Nenhuma letra disponível";
    return;
  }

  lyricsEl.className = "lyrics";
  lyricsEl.innerHTML = "";

  lyrics.split("\n").forEach(line => {
    const div = document.createElement("div");
    div.className = "line";
    div.textContent = line.replace(/\[.*?\]/g, "").trim();
    lyricsEl.appendChild(div);
  });
}

/* 🔄 UI */
function updateUI(data) {
  if (!data || !data.titulo) return;

  const trackId = `${data.titulo}-${data.artista}-${data.album}`;

  cover.src = data.capa;
  title.textContent = data.titulo;
  artist.textContent = data.artista;
  album.textContent = data.album || "Single";

  if (data.cores) {
    document.body.style.setProperty(
      "--bg-gradient",
      `linear-gradient(135deg,
        ${data.cores.escura || data.cores.dominante},
        ${data.cores.dominante},
        ${data.cores.clara || data.cores.dominante}
      )`
    );
  }

  renderLyrics(data.lyrics);

  if (trackId !== lastTrackId) {
    startMs = parseMs(data.tempoAtual);
    totalMs = parseMs(data.duracao);

    current.textContent = formatMs(startMs);
    duration.textContent = formatMs(totalMs);

    startTimestamp = Date.now();
    startProgress();

    lastTrackId = trackId;
  }
}

fetch(API_URL).then(r => r.json()).then(updateUI).catch(() => {});

const ws = new WebSocket(WS_URL);
ws.onmessage = e => {
  const msg = JSON.parse(e.data);
  if (msg.type === "music_update") updateUI(msg.data);
};