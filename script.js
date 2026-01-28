const API_URL = "https://ocean-q2uw.onrender.com/music"; // ajuste se precisar

let currentSeconds = 0;
let totalSeconds = 0;
let timerInterval = null;

/* Converte 2m 20s → 2:20 */
function formatTime(raw) {
  const match = raw.match(/(?:(\d+)m)?\s*(?:(\d+)s)?/i);
  const m = Number(match?.[1] || 0);
  const s = Number(match?.[2] || 0);
  return {
    formatted: `${m}:${String(s).padStart(2, "0")}`,
    seconds: m * 60 + s
  };
}

async function loadNowPlaying() {
  const res = await fetch(API_URL);
  const data = await res.json();

  document.getElementById("title").textContent = data.titulo;
  document.getElementById("artist").textContent = data.artista;
  document.getElementById("cover").src = data.capa;

  const duration = formatTime(data.duracao);
  const current = formatTime(data.tempoAtual);

  totalSeconds = duration.seconds;
  currentSeconds = current.seconds;

  document.getElementById("duration").textContent = duration.formatted;
  document.getElementById("current").textContent = current.formatted;

  applyBackground(data.cores);
  startTimer();
}

function applyBackground(colors) {
  const bg = document.getElementById("background");

  bg.style.background = `
    linear-gradient(
      120deg,
      ${colors.primary},
      ${colors.secondary}
    )
  `;
}

function startTimer() {
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (currentSeconds >= totalSeconds) return;

    currentSeconds++;

    const m = Math.floor(currentSeconds / 60);
    const s = currentSeconds % 60;

    document.getElementById("current").textContent =
      `${m}:${String(s).padStart(2, "0")}`;

    const progress = (currentSeconds / totalSeconds) * 100;
    document.querySelector(".progress").style.width = `${progress}%`;
  }, 1000);
}

/* Atualiza a música automaticamente a cada 5s */
setInterval(loadNowPlaying, 5000);

loadNowPlaying();
