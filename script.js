const API_URL = "https://ocean-q2uw.onrender.com/music";

const cover = document.getElementById("cover");
const title = document.getElementById("title");
const artist = document.getElementById("artist");
const lyricsEl = document.getElementById("lyrics");
const background = document.getElementById("background");

let lastMusicId = null;
let currentLine = -1;

/* Atualiza UI */
function updatePlayer(music) {
  title.textContent = music.titulo;
  artist.textContent = `${music.artista}${music.album ? " • " + music.album : ""}`;
  cover.src = music.capa;

  /* GRADIENTE COM CORES DA CAPA */
  const { dominante, escura, clara } = music.cores;

  background.style.background = `
    radial-gradient(circle at top left, ${clara || dominante}, transparent 60%),
    radial-gradient(circle at bottom right, ${escura || dominante}, transparent 60%),
    linear-gradient(120deg, ${dominante}, ${escura || dominante})
  `;

  renderLyrics(music.lyrics || []);
}

/* Renderiza letras */
function renderLyrics(lyrics) {
  lyricsEl.innerHTML = "";

  if (!lyrics.length) {
    lyricsEl.innerHTML = `<p class="empty">Nenhuma letra disponível</p>`;
    return;
  }

  lyrics.forEach(l => {
    const div = document.createElement("div");
    div.className = "line";
    div.dataset.time = l.time; // segundos
    div.textContent = l.text;
    lyricsEl.appendChild(div);
  });

  currentLine = -1;
}

/* Sincronização */
function syncLyrics(currentTime) {
  const lines = document.querySelectorAll(".line");

  lines.forEach((line, i) => {
    const time = Number(line.dataset.time);
    const nextTime = lines[i + 1]
      ? Number(lines[i + 1].dataset.time)
      : Infinity;

    if (currentTime >= time && currentTime < nextTime) {
      if (currentLine !== i) {
        if (lines[currentLine]) {
          lines[currentLine].classList.remove("active");
        }

        line.classList.add("active");
        currentLine = i;

        line.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
    }
  });
}

/* Busca música atual */
async function fetchMusic() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) return;

    const music = await res.json();

    if (music.nome !== lastMusicId) {
      lastMusicId = music.nome;
      updatePlayer(music);
    }

    /* tempoAtual vem em MS */
    syncLyrics(Math.floor(music.tempoAtual / 1000));

  } catch (err) {
    console.error("Erro ao buscar música:", err);
  }
}

/* Atualiza a cada 1s */
setInterval(fetchMusic, 1000);