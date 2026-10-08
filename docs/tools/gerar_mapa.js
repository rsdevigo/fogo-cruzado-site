// Gera o mapa de ilhas em docs/assets/mapa_tiled.tmx.
// Uso: node docs/tools/gerar_mapa.js [seed]
//
// - Relevo por ruído de valor (2 oitavas), periódico em Y para o mapa rolar em loop.
// - Fora do mapa em X conta como a própria borda, então as ilhas podem encostar nas laterais.
// - Cada ilha (componente 8-conexa) é toda "Verde" ou toda "Marrom".
// - Os tiles vêm dos wangsets do próprio TMX. Células de terra cujo padrão não existe
//   no tileset (istmos de 1 tile, pontas, diagonais) são removidas até estabilizar.
const fs = require("fs");
const path = require("path");

const TMX = path.join(__dirname, "..", "assets", "mapa_tiled.tmx");
const COBERTURA = 0.70; // fração aproximada de terra
const ILHA_MIN = 4; // ilhas menores que isso somem
const SEED = parseInt(process.argv[2] ?? "7", 10);

// top, topright, right, bottomright, bottom, bottomleft, left, topleft (ordem do wangid)
const DIRS = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];

const texto = fs.readFileSync(TMX, "utf8");
const W = +texto.match(/<map [^>]*\bwidth="(\d+)"/)[1];
const H = +texto.match(/<map [^>]*\bheight="(\d+)"/)[1];

const wang = {};
for (const m of texto.matchAll(/<wangset name="(Verde|Marrom)"[^>]*>([\s\S]*?)<\/wangset>/g)) {
  const tabela = {};
  for (const t of m[2].matchAll(/<wangtile tileid="(\d+)" wangid="([\d,]+)"/g)) {
    tabela[t[2]] ??= +t[1];
  }
  wang[m[1]] = tabela;
}
const AGUA_KEY = "1,1,1,1,1,1,1,1";
const AGUA = wang.Verde[AGUA_KEY];
const VALIDOS = new Set(Object.keys(wang.Verde).filter((k) => k !== AGUA_KEY));

// PRNG determinístico (mulberry32)
let estado = SEED >>> 0;
const rand = () => {
  estado = (estado + 0x6d2b79f5) >>> 0;
  let t = estado;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const smooth = (t) => t * t * (3 - 2 * t);
const grades = {};
// Ruído de valor; X preso na borda, Y periódico (H divisível por passo).
function ruido(x, y, passo) {
  const nx = Math.ceil(W / passo) + 2;
  const ny = H / passo;
  grades[passo] ??= Array.from({ length: ny }, () => Array.from({ length: nx }, rand));
  const g = grades[passo];
  const fx = x / passo, fy = y / passo;
  const x0 = Math.floor(fx), y0 = Math.floor(fy);
  const tx = smooth(fx - x0), ty = smooth(fy - y0);
  const v = (i, j) => g[j % ny][i];
  const a = v(x0, y0) * (1 - tx) + v(x0 + 1, y0) * tx;
  const b = v(x0, y0 + 1) * (1 - tx) + v(x0 + 1, y0 + 1) * tx;
  return a * (1 - ty) + b * ty;
}

const campo = Array.from({ length: H }, (_, y) =>
  Array.from({ length: W }, (_, x) => ruido(x + 0.5, y + 0.5, 6) + 0.5 * ruido(x + 0.5, y + 0.5, 3)));
const corte = campo.flat().sort((a, b) => a - b)[Math.floor((1 - COBERTURA) * W * H)];
const terra = campo.map((linha) => linha.map((v) => v >= corte));

const éTerra = (x, y) => terra[((y % H) + H) % H][Math.min(Math.max(x, 0), W - 1)];

// wangid da célula: aresta = 2 se célula e vizinho são terra; canto = 2 se os 4 ao redor são.
function padrao(x, y) {
  const v = DIRS.map(([dx, dy]) => éTerra(x + dx, y + dy));
  return v.map((_, i) => (i % 2 === 0 ? v[i] : v[i] && v[i - 1] && v[(i + 1) % 8]) ? 2 : 1).join(",");
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
if (comps.length > 1 && new Set(tipos).size === 1) tipos[0] = tipos[0] === "Verde" ? "Marrom" : "Verde";
const tipo = {};
comps.forEach((comp, i) => comp.forEach(([x, y]) => (tipo[y * W + x] = tipos[i])));

const linhas = [];
for (let y = 0; y < H; y++) {
  const linha = [];
  for (let x = 0; x < W; x++) {
    const id = terra[y][x] ? wang[tipo[y * W + x]][padrao(x, y)] : AGUA;
    linha.push(id + 1);
  }
  linhas.push(linha.join(","));
}
const csv = linhas.join(",\n");
fs.writeFileSync(TMX, texto.replace(/(<data encoding="csv">\r?\n)[\s\S]*?(\r?\n<\/data>)/, (_, a, b) => a + csv + b));

const total = terra.flat().filter(Boolean).length;
console.log(`seed=${SEED} ilhas=${comps.length} terra=${Math.round((100 * total) / (W * H))}%`);
for (let y = 0; y < H; y++)
  console.log(terra[y].map((t, x) => (!t ? " " : tipo[y * W + x] === "Verde" ? "g" : "m")).join("") + "|");
