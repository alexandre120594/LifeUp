import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();
const sourcePath = path.join(
  root,
  "plano-trt-ti-auditoria-2017-2025-4-topicos-separado.html"
);
const outputPath = path.join(root, "src", "data", "trt-audit-study-plan.json");
const html = await readFile(sourcePath, "utf8");

function decodeHtml(value) {
  const entities = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };

  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCodePoint(Number.parseInt(code, 16))
    )
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&([a-z]+);/gi, (match, name) => entities[name] ?? match)
    .replace(/\s+/g, " ")
    .trim();
}

function repairMojibake(value) {
  if (!/[ÃÂâ]/.test(value)) {
    return value;
  }

  const windows1252 = {
    0x20ac: 0x80,
    0x201a: 0x82,
    0x0192: 0x83,
    0x201e: 0x84,
    0x2026: 0x85,
    0x2020: 0x86,
    0x2021: 0x87,
    0x02c6: 0x88,
    0x2030: 0x89,
    0x0160: 0x8a,
    0x2039: 0x8b,
    0x0152: 0x8c,
    0x017d: 0x8e,
    0x2018: 0x91,
    0x2019: 0x92,
    0x201c: 0x93,
    0x201d: 0x94,
    0x2022: 0x95,
    0x2013: 0x96,
    0x2014: 0x97,
    0x02dc: 0x98,
    0x2122: 0x99,
    0x0161: 0x9a,
    0x203a: 0x9b,
    0x0153: 0x9c,
    0x017e: 0x9e,
    0x0178: 0x9f,
  };
  const bytes = Array.from(value, (char) => {
    const code = char.charCodeAt(0);
    return windows1252[code] ?? code;
  });

  return Buffer.from(bytes).toString("utf8");
}

function cleanText(value) {
  return repairMojibake(decodeHtml(value))
    .replaceAll("Portugu�s", "Português")
    .replaceAll(" � ", " — ")
    .replaceAll("Pontua��o", "Pontuação")
    .replaceAll("Concord�ncia", "Concordância")
    .replaceAll("Per�odo", "Período")
    .replaceAll("coordena��o", "coordenação")
    .replaceAll("subordina��o", "subordinação")
    .replaceAll("sem�ntica", "semântica")
    .replaceAll("sem�ntico", "semântico")
    .replaceAll("formul�rios", "formulários")
    .replaceAll("m�dia", "mídia")
    .replaceAll("no��es", "noções")
    .replaceAll("equival�ncia", "equivalência")
    .replaceAll("corre��o", "correção")
    .replaceAll("aceita��o", "aceitação")
    .replaceAll("mitiga��o", "mitigação")
    .replaceAll("transfer�ncia", "transferência")
    .replaceAll("elimina��o", "eliminação")
    .replaceAll("evita��o", "evitação")
    .replaceAll("redund�ncia", "redundância")
    .replaceAll("Desnormaliza��o", "Desnormalização")
    .replaceAll("inser��o", "inserção")
    .replaceAll("atualiza��o", "atualização")
    .replaceAll("exclus�o", "exclusão")
    .replaceAll("Vac�ncia", "Vacância")
    .replaceAll("vac�ncia", "vacância")
    .replaceAll("remo��o", "remoção")
    .replaceAll("redistribui��o", "redistribuição")
    .replaceAll("substitui��o", "substituição")
    .replaceAll("proibi��es", "proibições")
    .replaceAll("sindic�ncia", "sindicância")
    .replaceAll("prescri��o", "prescrição")
    .replaceAll("toler�ncia", "tolerância")
    .replaceAll("consist�ncia", "consistência")
    .replaceAll("parti��o", "partição")
    .replaceAll("Din�micos", "Dinâmicos")
    .replaceAll("est�tico", "estático")
    .replaceAll("padr�o", "padrão")
    .replaceAll("dist�ncia", "distância")
    .replaceAll("m�trica", "métrica")
    .replaceAll("limita��es", "limitações")
    .replaceAll("converg�ncia", "convergência")
    .replaceAll("din�mico", "dinâmico")
    .replaceAll("din�mica", "dinâmica")
    .replaceAll("b�sico", "básico")
    .replaceAll("anula��o", "anulação")
    .replaceAll("revoga��o", "revogação")
    .replaceAll("descentraliza��o", "descentralização")
    .replaceAll("desconcentra��o", "desconcentração")
    .replaceAll("Criptografia em tr�nsito", "Criptografia em trânsito")
    .replaceAll("rota��o", "rotação")
    .replaceAll("Fibra �ptica", "Fibra óptica")
    .replaceAll("dist�ncias", "distâncias")
    .replaceAll("seguran�a", "segurança")
    .replaceAll("navega��o", "navegação")
    .replaceAll("vis�vel", "visível")
    .replaceAll("orquestra��o", "orquestração")
    .replaceAll("est�gio probat�rio", "estágio probatório")
    .replaceAll("Clusteriza��o", "Clusterização")
    .replaceAll("conting�ncia", "contingência")
    .replaceAll("an�lise est�tica", "análise estática")
    .replaceAll("an�lise din�mica", "análise dinâmica")
    .replaceAll("an�lise", "análise")
    .replaceAll("composi��o", "composição")
    .replaceAll("�ngulos", "ângulos")
    .replaceAll("tri�ngulos", "triângulos")
    .replaceAll("pol�gonos", "polígonos")
    .replaceAll("per�metro", "perímetro")
    .replaceAll("�rea", "área")
    .replaceAll("dist�ncia entre", "distância entre")
    .replaceAll("interpreta��o", "interpretação")
    .replaceAll("gr�fica", "gráfica")
    .replaceAll("Fun��es", "Funções")
    .replaceAll("Vari�ncia", "Variância")
    .replaceAll("dispers�o", "dispersão")
    .replaceAll("import�ncia", "importância")
    .replaceAll("vari�veis", "variáveis")
    .replaceAll("centr�ides", "centróides")
    .replaceAll("vulner�veis", "vulneráveis");
}

function cleanValue(value) {
  if (typeof value === "string") {
    return cleanText(value);
  }

  if (Array.isArray(value)) {
    return value.map(cleanValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, cleanValue(item)])
    );
  }

  return value;
}

function extractNotice(section = "") {
  const paragraphs = Array.from(
    section.matchAll(/<p>([\s\S]*?)<\/p>/g),
    (match) => cleanText(match[1])
  );
  const items = Array.from(section.matchAll(/<li>([\s\S]*?)<\/li>/g), (match) =>
    cleanText(match[1])
  );

  return { paragraphs, items };
}

const tracksSource = html.match(/const TRACKS = (\[[\s\S]*?\]);\nconst nav/)?.[1];

if (!tracksSource) {
  throw new Error("Could not find TRACKS in audit plan HTML.");
}

const context = {};
vm.createContext(context);
vm.runInContext(`TRACKS = ${tracksSource}`, context);

const tracks = cleanValue(context.TRACKS).map((track) => ({
  ...track,
  weeks: Math.ceil(track.data.length / 6),
  days: track.data.length,
  hours: track.data.length * 3,
}));

const noticeSections = Array.from(
  html.matchAll(/<section class="notice">([\s\S]*?)<\/section>/g),
  (match) => match[1]
);
const usage = extractNotice(noticeSections[0]);
const verification = extractNotice(noticeSections[1]);
const additions = extractNotice(noticeSections[2]);

const plan = {
  title: "Plano TRT TI por Cargo",
  subtitle: "Auditoria 2017-2025 com 4 tópicos por dia",
  description:
    "Plano separado para Analista e Técnico de TI, com base comum, complementos por cargo e repetição espaçada D+1, D+7 e D+21.",
  sourceFile: "plano-trt-ti-auditoria-2017-2025-4-topicos-separado.html",
  stats: {
    baseWeeks: 39,
    analystDays: 289,
    technicianDays: 239,
    topicsPerDay: 4,
    hoursPerDay: 3,
    uniqueDays: tracks.reduce((total, track) => total + track.days, 0),
  },
  usage,
  verification,
  additions,
  note: cleanText(
    "A única parte que continua dependente do tribunal escolhido é Regimento Interno e Código de Ética do TRT-alvo. O plano deixa o espaço reservado, mas o conteúdo final deve ser trocado pelo texto do TRT específico quando você definir o tribunal."
  ),
  tracks,
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(plan, null, 2)}\n`, "utf8");
console.log(`Imported ${tracks.length} tracks into ${outputPath}`);
