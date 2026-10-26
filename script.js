// Utilizador de demonstração
const UTILIZADOR = "joao";
const PASSWORD = "1234";

// Lista fixa de canais.
// "logo": link de uma imagem do logótipo (se ficar vazio, aparece a inicial do nome)
// "url": link do stream (.m3u8). Estes são streams de teste públicos e legais.
const canais = [
  { nome: "RTP1", logo: "
https://iplayer24.me/bloop/7279c8c1c86b6e270b70e343fc2c2292.m3u8" },
  { nome: "Canal 2", logo: "", url: "https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8" },
  { nome: "Canal 3", logo: "", url: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8" },
  { nome: "Canal 4", logo: "", url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" }
];

let canalAtual = 0;
let multiview = false;
let players = [];

// ---------- LOGIN ----------
function entrar() {
  const u = document.getElementById("user").value;
  const p = document.getElementById("pass").value;
  if (u === UTILIZADOR && p === PASSWORD) {
    document.getElementById("login").classList.add("escondido");
    document.getElementById("painel").classList.remove("escondido");
    criarBarra();
    mostrarCanal(canalAtual);
  } else {
    document.getElementById("erro").textContent = "Dados errados!";
  }
}

// Permite fazer login carregando em Enter
document.addEventListener("keydown", e => {
  const loginVisivel = !document.getElementById("login").classList.contains("escondido");
  if (e.key === "Enter" && loginVisivel) entrar();
});

// ---------- BARRA DE CANAIS ----------
function criarBarra() {
  const barra = document.getElementById("barra");
  barra.innerHTML = "";

  canais.forEach((c, i) => {
    const div = document.createElement("div");
    div.className = "canal" + (i === canalAtual && !multiview ? " ativo" : "");

    // Logo (ou inicial do nome)
    if (c.logo) {
      const img = document.createElement("img");
      img.src = c.logo;
      img.alt = c.nome;
      div.appendChild(img);
    } else {
      const inicial = document.createElement("div");
      inicial.className = "inicial";
      inicial.textContent = c.nome[0];
      div.appendChild(inicial);
    }

    // Nome do canal
    const nome = document.createElement("span");
    nome.textContent = c.nome;
    div.appendChild(nome);

    // Passar o rato: pré-visualização no fundo
    div.onmouseenter = () => { if (!multiview) mostrarCanal(i); };
    // Tirar o rato: volta ao canal escolhido
    div.onmouseleave = () => { if (!multiview) mostrarCanal(canalAtual); };
    // Clicar: escolhe o canal
    div.onclick = () => {
      canalAtual = i;
      multiview = false;
      criarBarra();
      mostrarCanal(i);
    };

    barra.appendChild(div);
  });
}

// ---------- VÍDEO ----------
function limparPlayers() {
  players.forEach(h => h.destroy());
  players = [];
}

function criarVideo(url) {
  const video = document.createElement("video");
  video.muted = true;       // sem som, para o navegador deixar arrancar sozinho
  video.autoplay = true;
  video.playsInline = true;
  video.controls = true;

  if (window.Hls && Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(video);
    players.push(hls);
  } else {
    video.src = url;        // Safari reproduz .m3u8 diretamente
  }
  return video;
}

function mostrarCanal(i) {
  limparPlayers();
  const ecra = document.getElementById("ecra");
  ecra.className = "um";
  ecra.innerHTML = "";
  ecra.appendChild(criarVideo(canais[i].url));
  document.getElementById("tituloCanal").textContent = canais[i].nome;
}

// ---------- MULTIVIEW ----------
function alternarMultiview() {
  multiview = !multiview;
  if (multiview) {
    limparPlayers();
    const ecra = document.getElementById("ecra");
    ecra.className = "quatro";
    ecra.innerHTML = "";
    canais.slice(0, 4).forEach(c => ecra.appendChild(criarVideo(c.url)));
    document.getElementById("tituloCanal").textContent = "Multiview";
  } else {
    mostrarCanal(canalAtual);
  }
  criarBarra();
}
