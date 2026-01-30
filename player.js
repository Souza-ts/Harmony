const canvas = document.getElementById('playerCanvas');
const ctx = canvas.getContext('2d');

const API_URL = "https://spotify-h40n.onrender.com/now-playing";

let track = null;
let coverImg = new Image();
let parsedLyrics = [];
let startTime = 0;
let duration = 0;

// ========================
// Função para pegar letras sincronizadas do LRCLIB
// ========================
async function fetchLyrics(trackTitle, artist) {
  try {
    const res = await fetch(`https://lrclib.net/api/get?track_name=${encodeURIComponent(trackTitle)}&artist_name=${encodeURIComponent(artist.split(',')[0].trim())}`);
    const data = await res.json();
    if (data && data.syncedLyrics) {
      return parseLRC(data.syncedLyrics);
    }
    return [];
  } catch {
    return [];
  }
}

// ========================
// Parser LRC para array de {time, text}
// ========================
function parseLRC(lrc) {
  return lrc
    .split('\n')
    .map(line => {
      const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
      if (!match) return null;
      return {
        time: (parseInt(match[1]) * 60 + parseFloat(match[2])) * 1000,
        text: match[3].trim()
      };
    })
    .filter(Boolean);
}

// ========================
// Pega 3 linhas sincronizadas
// ========================
function getLyricsBlock(elapsed) {
  if (!parsedLyrics.length) return ["", "♪", ""];
  let index = parsedLyrics.findIndex((l, i) => elapsed >= l.time && (!parsedLyrics[i+1] || elapsed < parsedLyrics[i+1].time));
  if (index === -1) index = 0;
  const prev = parsedLyrics[index-1]?.text || " ";
  const current = parsedLyrics[index]?.text || "♪";
  const next = parsedLyrics[index+1]?.text || " ";
  return [prev, current, next];
}

// ========================
// Pegar dados do Spotify
// ========================
async function fetchNowPlaying() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    if (!data.playing) {
      track = null;
      parsedLyrics = [];
      return;
    }

    track = data;
    duration = data.duration;
    startTime = Date.now() - data.progress;

    if (coverImg.src !== data.cover) coverImg.src = data.cover;

    // Pegar letras do LRCLIB
    parsedLyrics = await fetchLyrics(track.title, track.artist);

  } catch {
    track = null;
    parsedLyrics = [];
  }
}

// ========================
// Gradiente de fundo
// ========================
function drawGradient() {
  if (!coverImg.complete) return;
  const grad = ctx.createLinearGradient(0,0,canvas.width,0);
  grad.addColorStop(0,'#222');
  grad.addColorStop(1,'#444');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,canvas.width,canvas.height);
}

// ========================
// Renderização do player
// ========================
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  if (!track) {
    ctx.fillStyle = "#777";
    ctx.font = "24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Nada tocando", canvas.width/2, canvas.height/2);
    requestAnimationFrame(draw);
    return;
  }

  drawGradient();

  // Capa
  ctx.drawImage(coverImg, 40, 40, 300, 300);

  // Título e artista
  ctx.fillStyle = "#fff";
  ctx.textAlign = "left";
  ctx.font = "28px sans-serif";
  ctx.fillText(track.title, 370, 80);
  ctx.fillStyle = "#aaa";
  ctx.font = "20px sans-serif";
  ctx.fillText(track.artist, 370, 120);

  // Letras sincronizadas
  const elapsed = Date.now() - startTime;
  const [prev, current, next] = getLyricsBlock(elapsed);

  ctx.fillStyle = "#777";
  ctx.font = "18px sans-serif";
  ctx.fillText(prev, 370, 180);

  ctx.fillStyle = "#fff";
  ctx.font = "22px sans-serif";
  ctx.fillText(current, 370, 210);

  ctx.fillStyle = "#777";
  ctx.font = "18px sans-serif";
  ctx.fillText(next, 370, 240);

  // Barra de progresso
  const progress = Math.min(elapsed/duration, 1);
  ctx.fillStyle = "#555";
  ctx.fillRect(370, 270, 450, 6);
  ctx.fillStyle = "#fff";
  ctx.fillRect(370, 270, 450*progress, 6);

  requestAnimationFrame(draw);
}

// ========================
// Inicialização
// ========================
fetchNowPlaying();
setInterval(fetchNowPlaying, 5000);
draw();
