// ✅ URLs da API e WebSocket
const API_URL = "https://ocean-q2uw.onrender.com/music";
const WS_URL = "wss://ocean-q2uw.onrender.com";

// ✅ Elementos do DOM
const cover = document.getElementById("cover");
const title = document.getElementById("title");
const artist = document.getElementById("artist");
const current = document.getElementById("current");
const duration = document.getElementById("duration");
const fill = document.getElementById("fill");

// ⏱️ Variáveis de controle de progresso
let startTimestamp = 0;
let startSeconds = 0;
let totalSeconds = 0;
let rafId = null;

// 🌟 Defina o guildId que você quer monitorar
const guildId = "1451385262692368476"; // Coloque o ID real do servidor

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

/* Atualiza barra de progresso */
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

/* Atualiza elementos do player */
function updateUI(data) {
  if (!data) return;

  cover.src = data.capa || "";
  title.textContent = data.titulo || "Desconhecido";
  artist.textContent = data.artista || "Desconhecido";

  startSeconds = parseTime(data.tempoAtual);
  totalSeconds = parseTime(data.duracao);

  current.textContent = format(startSeconds);
  duration.textContent = format(totalSeconds);

  startTimestamp = Date.now();
  startProgress();

  /* Atualiza background */
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

/* Inicial: busca música atual do guild */
fetch(`${API_URL}/${guildId}`)
  .then(r => r.json())
  .then(updateUI)
  .catch(err => console.error("Falha ao buscar música:", err));

/* WebSocket: atualizações em tempo real */
const ws = new WebSocket(WS_URL);

ws.onopen = () => console.log("Conectado ao WebSocket");
ws.onclose = () => console.log("WebSocket desconectado");
ws.onerror = e => console.error("Erro no WebSocket:", e);

ws.onmessage = e => {
  try {
    const msg = JSON.parse(e.data);
    if (msg.type === "music_update" && msg.guildId === guildId) {
      updateUI(msg.data);
    }
  } catch (err) {
    console.error("Falha ao processar mensagem WS:", err);
  }
};