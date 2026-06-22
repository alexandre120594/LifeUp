import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourcePath = path.join(root, "plano-trt-ti-completo-ajustado.html");
const outputPath = path.join(root, "src", "data", "trt-study-plan.json");
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

function capture(source, pattern, fallback = "") {
  return decodeHtml(source.match(pattern)?.[1] ?? fallback);
}

const weeks = [];

for (let weekNumber = 1; weekNumber <= 19; weekNumber += 1) {
  const startMarker = `<div class="week${weekNumber === 1 ? " open" : ""}" id="s${weekNumber}">`;
  const start = html.indexOf(startMarker);
  const nextStart =
    weekNumber < 19
      ? html.indexOf(`<div class="week" id="s${weekNumber + 1}">`, start)
      : html.indexOf('<div class="sec-header" id="materias">', start);
  const weekHtml = html.slice(start, nextStart);
  const days = [];

  for (let dayNumber = 1; dayNumber <= 6; dayNumber += 1) {
    const dayStart = weekHtml.indexOf(
      `<div class="day-card" id="s${weekNumber}d${dayNumber}">`
    );
    const nextDayStart =
      dayNumber < 6
        ? weekHtml.indexOf(
            `<div class="day-card" id="s${weekNumber}d${dayNumber + 1}">`,
            dayStart
          )
        : weekHtml.length;
    const dayHtml = weekHtml.slice(dayStart, nextDayStart);

    days.push({
      id: `s${weekNumber}d${dayNumber}`,
      category: capture(dayHtml, /<span class="day-label [^"]+">([\s\S]*?)<\/span>/),
      title: capture(dayHtml, /<div class="day-title">([\s\S]*?)<\/div>/),
      schedule: capture(dayHtml, /<div class="day-hours">([\s\S]*?)<\/div>/),
      topics: Array.from(dayHtml.matchAll(/<li>([\s\S]*?)<\/li>/g), (match) =>
        decodeHtml(match[1])
      ),
    });
  }

  weeks.push({
    id: `s${weekNumber}`,
    number: weekNumber,
    title: capture(weekHtml, /<div class="week-title">([\s\S]*?)<\/div>/),
    subtitle: capture(
      weekHtml,
      /<div class="week-subtitle">([\s\S]*?)<\/div>/
    ),
    tag: capture(weekHtml, /<span class="week-tag [^"]+">([\s\S]*?)<\/span>/),
    days,
  });
}

const subjectMapHtml = html.slice(
  html.indexOf('<div class="sec-header" id="materias">'),
  html.indexOf('<div class="sec-header" id="fontes">')
);
const subjectGroups = Array.from(
  subjectMapHtml.matchAll(
    /<div class="mat-section"><h3>([\s\S]*?)<\/h3><div class="mat-grid">([\s\S]*?)<\/div><\/div>/g
  ),
  (groupMatch) => ({
    title: decodeHtml(groupMatch[1]),
    items: Array.from(
      groupMatch[2].matchAll(
        /<div class="mat-item"><strong>([\s\S]*?)<\/strong>([\s\S]*?)<\/div>/g
      ),
      (itemMatch) => ({
        title: decodeHtml(itemMatch[1]),
        description: decodeHtml(itemMatch[2]),
      })
    ),
  })
);

const referencesHtml = html.slice(
  html.indexOf('<div class="sec-header" id="fontes">'),
  html.indexOf("</main>")
);
const references = Array.from(
  referencesHtml.matchAll(/<li>([\s\S]*?)<\/li>/g),
  (match) => decodeHtml(match[1])
);

const plan = {
  title: "Plano de Estudos TRT — TI Judicial Completo",
  description:
    "Plano para Analista e Técnico de Tecnologia da Informação, com conhecimentos gerais, direito, infraestrutura, redes, segurança, desenvolvimento, dados, governança, CNJ, IA e revisão espaçada.",
  structure:
    "Cada dia foi pensado para 3h: 1h40 a 2h de teoria, 40 a 60 minutos de questões e 20 minutos de revisão ativa. O sábado consolida a semana. O domingo fica livre ou para revisão leve dos erros críticos.",
  stats: {
    weeks: 19,
    days: 114,
    totalHours: 342,
    hoursPerDay: 3,
  },
  weeks,
  subjectGroups,
  references,
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(plan, null, 2)}\n`, "utf8");
console.log(`Imported ${weeks.length} weeks into ${outputPath}`);
