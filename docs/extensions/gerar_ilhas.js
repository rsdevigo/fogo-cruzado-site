// Extensão do Tiled: Map > Gerar ilhas (Ctrl+Shift+G).
// Preenche a camada de blocos selecionada com ilhas Verde/Marrom geradas por ruído.
//
// Instalação: copie este arquivo para a pasta de extensões do Tiled
// (Edit > Preferences > Plugins > Open) ou para a pasta do projeto, e reinicie ou use
// "Reload scripts". Erros aparecem em View > Show Console.
//
// Mesma lógica de gerar_mapa.js (linha de comando), mas lendo os wangsets "Verde" e
// "Marrom" pela API do tileset e gravando pela camada (dá para desfazer com Ctrl+Z).

// top, topright, right, bottomright, bottom, bottomleft, left, topleft (ordem do wangid)
const DIRS = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
const ILHA_MIN = 4; // ilhas menores que isso somem

function criarRand(seed) {
  let estado = seed >>> 0; // mulberry32
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// id do tile por wangid ("1,1,2,...") de um wangset
function tabelaWang(tileset, nome) {
  const ws = tileset.wangSets.find((w) => w.name === nome);
  if (!ws) throw new Error('Wangset "' + nome + '" não encontrado em ' + tileset.name);
  // o nome do método varia entre versões do Tiled
  const nomeFn = ["wangId", "wangIdOfTile"].find((n) => typeof ws[n] === "function");
  if (!nomeFn) throw new Error("API de wangset desconhecida: " + Object.getOwnPropertyNames(ws).join(", "));
  const tabela = {};
  for (const tile of tileset.tiles) {
    const id = ws[nomeFn](tile);
    const chave = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => id[i]).join(",");
    if (chave !== "0,0,0,0,0,0,0,0" && !(chave in tabela)) tabela[chave] = tile.id;
  }
  return tabela;
}

function gerar(W, H, tileset, seed, cobertura) {
  const wang = { Verde: tabelaWang(tileset, "Verde"), Marrom: tabelaWang(tileset, "Marrom") };
  const AGUA_KEY = "1,1,1,1,1,1,1,1";
  const AGUA = wang.Verde[AGUA_KEY];
  const VALIDOS = new Set(Object.keys(wang.Verde).filter((k) => k !== AGUA_KEY));
  const rand = criarRand(seed);

  // Ruído de valor; X preso na borda, Y periódico (o mapa rola em loop).
  const smooth = (t) => t * t * (3 - 2 * t);
  const grades = {};
  function ruido(x, y, passo) {
    const nx = Math.ceil(W / passo) + 2;
    const ny = Math.max(1, Math.round(H / passo));
    const passoY = H / ny;
    grades[passo] = grades[passo] || Array.from({ length: ny }, () => Array.from({ length: nx }, rand));
    const g = grades[passo];
    const fx = x / passo, fy = y / passoY;
    const x0 = Math.floor(fx), y0 = Math.floor(fy);
    const tx = smooth(fx - x0), ty = smooth(fy - y0);
    const v = (i, j) => g[j % ny][i];
    const a = v(x0, y0) * (1 - tx) + v(x0 + 1, y0) * tx;
    const b = v(x0, y0 + 1) * (1 - tx) + v(x0 + 1, y0 + 1) * tx;
    return a * (1 - ty) + b * ty;
  }

  const campo = [];
  for (let y = 0; y < H; y++) {
    campo.push([]);
    for (let x = 0; x < W; x++) campo[y].push(ruido(x + 0.5, y + 0.5, 6) + 0.5 * ruido(x + 0.5, y + 0.5, 3));
  }
  const ordenado = [].concat(...campo).sort((a, b) => a - b);
  const corte = ordenado[Math.floor((1 - cobertura) * W * H)];
  const terra = campo.map((linha) => linha.map((v) => v >= corte));

  const éTerra = (x, y) => terra[((y % H) + H) % H][Math.min(Math.max(x, 0), W - 1)];

  // wangid da célula: aresta = 2 se célula e vizinho são terra; canto = 2 se os 4 ao redor são.
  function padrao(x, y) {
    const v = DIRS.map((d) => éTerra(x + d[0], y + d[1]));
    return v.map((_, i) => ((i % 2 === 0 ? v[i] : v[i] && v[i - 1] && v[(i + 1) % 8]) ? 2 : 1)).join(",");
  }

  function componentes() {
    const visto = new Set();
    const comps = [];
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (!terra[y][x] || visto.has(y * W + x)) continue;
        const pilha = [[x, y]];
        const comp = [];
        visto.add(y * W + x);
        while (pilha.length) {
          const [cx, cy] = pilha.pop();
          comp.push([cx, cy]);
          for (const [dx, dy] of DIRS) {
            const nx = cx + dx, ny = (cy + dy + H) % H;
            if (nx >= 0 && nx < W && terra[ny][nx] && !visto.has(ny * W + nx)) {
              visto.add(ny * W + nx);
              pilha.push([nx, ny]);
            }
          }
        }
        comps.push(comp);
      }
    }
    return comps;
  }

  // remove células sem tile e ilhas pequenas até estabilizar
  for (let mudou = true; mudou;) {
    mudou = false;
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++)
        if (terra[y][x] && !VALIDOS.has(padrao(x, y))) { terra[y][x] = false; mudou = true; }
    for (const comp of componentes())
      if (comp.length < ILHA_MIN) { comp.forEach(([x, y]) => (terra[y][x] = false)); mudou = true; }
  }

  const comps = componentes();
  const tipos = comps.map(() => (rand() < 0.5 ? "Verde" : "Marrom"));
  if (comps.length > 1 && tipos.every((t) => t === tipos[0])) tipos[0] = tipos[0] === "Verde" ? "Marrom" : "Verde";
  const tipo = {};
  comps.forEach((comp, i) => comp.forEach(([x, y]) => (tipo[y * W + x] = tipos[i])));

  const ids = [];
  for (let y = 0; y < H; y++) {
    ids.push([]);
    for (let x = 0; x < W; x++) ids[y].push(terra[y][x] ? wang[tipo[y * W + x]][padrao(x, y)] : AGUA);
  }
  return { ids, ilhas: comps.length };
}

const acao = tiled.registerAction("GerarIlhas", () => {
  const mapa = tiled.activeAsset;
  if (!mapa || !mapa.isTileMap) return tiled.alert("Abra um mapa antes.");

  let camada = mapa.currentLayer;
  if (!camada || !camada.isTileLayer) {
    camada = null;
    for (let i = 0; i < mapa.layerCount; i++) if (mapa.layerAt(i).isTileLayer) { camada = mapa.layerAt(i); break; }
  }
  if (!camada) return tiled.alert("O mapa não tem camada de blocos.");
  const tileset = mapa.tilesets[0];
  if (!tileset) return tiled.alert("O mapa não tem tileset.");

  const entradaSeed = tiled.prompt("Seed (número)", "7", "Gerar ilhas");
  if (!entradaSeed) return;
  const entradaCob = tiled.prompt("Cobertura de terra (%)", "50", "Gerar ilhas");
  if (!entradaCob) return;
  const seed = parseInt(entradaSeed, 10) || 0;
  const cobertura = Math.min(Math.max(parseFloat(entradaCob) || 50, 5), 90) / 100;

  try {
    const { ids, ilhas } = gerar(mapa.width, mapa.height, tileset, seed, cobertura);
    const edicao = camada.edit();
    for (let y = 0; y < mapa.height; y++)
      for (let x = 0; x < mapa.width; x++) edicao.setTile(x, y, tileset.tile(ids[y][x]));
    edicao.apply();
    tiled.log("Ilhas geradas: seed=" + seed + ", " + ilhas + " ilhas.");
  } catch (e) {
    tiled.alert("Falha ao gerar ilhas: " + e.message);
  }
});

acao.text = "Gerar ilhas...";
acao.shortcut = "Ctrl+Shift+G";
tiled.extendMenu("Map", [{ separator: true }, { action: "GerarIlhas" }]);
