// Utilizador de demonstração
const UTILIZADOR = "joao";
const PASSWORD = "1234";

// Lista fixa de canais.
// "logo": link de uma imagem do logótipo (se ficar vazio, aparece a inicial do nome)
// "url": link de um stream (.m3u8) que pode ser reproduzido dentro do site
// "pagina": em vez de "url", abre a emissão oficial do canal num separador novo
//           (usado na RTP, que não permite reproduzir o stream noutros sites)
const canais = [
  // Canais de teste (reproduzem dentro do site e entram no multiview)
  { nome: "Canal 1", logo: "", url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
  { nome: "Canal 2", logo: "", url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8" },
  { nome: "Canal 3", logo: "", url: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8" },
  { nome: "Canal 4", logo: "", url: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" },
  { nome: "Canal 5", logo: "", url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/bipbop_16x9/bipbop_16x9_variant.m3u8" },

  // Canais oficiais (abrem o site do canal num separador novo)
  { nome: "RTP1", logo: "https://cdn-images.rtp.pt/common/img/channels/logos/color/horizontal/5-372126260903.png?v=3&w=300", pagina: "https://www.rtp.pt/play/direto/rtp1" },
  { nome: "RTP2", logo: "", pagina: "https://www.rtp.pt/play/direto/rtp2" },
  { nome: "RTP Notícias", logo: "", pagina: "https://www.rtp.pt/play/direto/rtp3" },
  { nome: "RTP Desporto", logo: "", pagina: "https://www.rtp.pt/play/direto/rtpdesporto4" },
  { nome: "Sport TV", logo: "", pagina: "https://www.sporttv.pt" },
  { nome: "DAZN", logo: "", pagina: "https://www.dazn.com/pt-PT" }
];

// Começa no primeiro canal que tenha stream
let canalAtual = canais.findIndex(c => c.url);
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
// A roda do rato faz a barra andar para os lados
document.addEventListener("DOMContentLoaded", () => {
  const barra = document.getElementById("barra");
  barra.addEventListener("wheel", e => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      barra.scrollLeft += e.deltaY;
    }
  }, { passive: false });
});

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

    // Nome do canal (com ↗ se abrir num separador novo)
    const nome = document.createElement("span");
    nome.textContent = c.pagina ? c.nome + " ↗" : c.nome;
    div.appendChild(nome);

    if (c.pagina) {
      // Canal oficial: abre a emissão no site do canal
      div.onclick = () => window.open(c.pagina, "_blank");
    } else {
      // Clicar: muda para este canal
      div.onclick = () => {
        canalAtual = i;
        multiview = false;
        criarBarra();
        mostrarCanal(i);
      };
    }

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
    // Só os canais com stream entram no multiview (até 4)
    canais.filter(c => c.url).slice(0, 4).forEach(c => ecra.appendChild(criarVideo(c.url)));
    document.getElementById("tituloCanal").textContent = "Multiview";
  } else {
    mostrarCanal(canalAtual);
  }
  criarBarra();
}
