import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourceFile = "dataprev-perfil3-plano-ate-21-09-alternado-conferido.html";
const sourcePath = path.join(root, sourceFile);
const outputPath = path.join(root, "src", "data", "trt-study-plan.json");
const html = await readFile(sourcePath, "utf8");

function decodeHtml(value = "") {
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

function sliceBetween(source, startNeedle, endNeedle) {
  const start = source.indexOf(startNeedle);
  const end = source.indexOf(endNeedle, start);

  if (start < 0 || end < 0) {
    return "";
  }

  return source.slice(start, end);
}

const headerHtml = sliceBetween(html, "<header>", "</header>");
const headerStats = Array.from(
  headerHtml.matchAll(
    /<div class="stat"><b>([\s\S]*?)<\/b><span>([\s\S]*?)<\/span><\/div>/g
  ),
  (match) => ({
    value: decodeHtml(match[1]),
    label: decodeHtml(match[2]),
  })
);

const weeksHtml = sliceBetween(
  html,
  '<section id="plano" class="tab active">',
  '<section id="checklist" class="tab">'
);
const weekMatches = Array.from(
  weeksHtml.matchAll(
    /<section class="week[^"]*" id="sem(\d+)">([\s\S]*?)(?=<\/section><section class="week|<\/section>\s*<\/section>)/g
  )
);
const weeks = weekMatches.map((weekMatch) => {
  const weekNumber = Number(weekMatch[1]);
  const weekHtml = weekMatch[2];
  const days = Array.from(
    weekHtml.matchAll(
      /<article class="card" id="([^"]+)" data-key="([^"]+)">([\s\S]*?)<\/article>/g
    ),
    (dayMatch) => {
      const dayHtml = dayMatch[3];

      return {
        id: dayMatch[2],
        sourceId: dayMatch[1],
        category: capture(dayHtml, /<span class="badge [^"]+">([\s\S]*?)<\/span>/),
        title: capture(dayHtml, /<div class="title">([\s\S]*?)<\/div>/),
        schedule: capture(dayHtml, /<div class="meta">([\s\S]*?)<\/div>/),
        topics: Array.from(dayHtml.matchAll(/<li>([\s\S]*?)<\/li>/g), (match) =>
          decodeHtml(match[1])
        ),
        task: capture(dayHtml, /<div class="task">([\s\S]*?)<\/div>/),
      };
    }
  );

  return {
    id: `sem${weekNumber}`,
    number: weekNumber,
    title: capture(weekHtml, /<div class="week-title">([\s\S]*?)<\/div>/),
    subtitle: capture(weekHtml, /<div class="week-sub">([\s\S]*?)<\/div>/),
    tag: `${days.length} dias`,
    days,
  };
});

const checklistHtml = sliceBetween(
  html,
  '<section id="checklist" class="tab">',
  '<section id="auditoria" class="tab">'
);
const checklistSections = Array.from(
  checklistHtml.matchAll(
    /<section class="notice"><h2>([\s\S]*?)<\/h2><p>([\s\S]*?)<\/p>([\s\S]*?)<\/section>/g
  ),
  (sectionMatch) => ({
    title: decodeHtml(sectionMatch[1]),
    description: decodeHtml(sectionMatch[2]),
    groups: Array.from(
      sectionMatch[3].matchAll(
        /<div class="checkgroup"><h3>([\s\S]*?)<\/h3><div class="pills">([\s\S]*?)<\/div><\/div>/g
      ),
      (groupMatch) => ({
        title: decodeHtml(groupMatch[1]),
        items: Array.from(
          groupMatch[2].matchAll(
            /<button class="pillcheck" data-key="([^"]+)"[\s\S]*?>([\s\S]*?)<\/button>/g
          ),
          (itemMatch) => ({
            id: decodeHtml(itemMatch[1]),
            title: decodeHtml(itemMatch[2]),
          })
        ),
      })
    ),
  })
);

const auditHtml = sliceBetween(
  html,
  '<section id="auditoria" class="tab">',
  '<section id="edital" class="tab">'
);
const auditRows = Array.from(
  auditHtml.matchAll(/<tr><td>([\s\S]*?)<\/td><td>([\s\S]*?)<\/td><\/tr>/g),
  (match) => ({
    label: decodeHtml(match[1]),
    value: decodeHtml(match[2]),
  })
);
const auditNotes = Array.from(auditHtml.matchAll(/<li>([\s\S]*?)<\/li>/g), (match) =>
  decodeHtml(match[1])
);

const editalHtml = html.slice(html.indexOf('<section id="edital" class="tab">'));
const editalCards = Array.from(
  editalHtml.matchAll(/<div class="card"><span class="badge [^"]+">([\s\S]*?)<\/span><div class="title">([\s\S]*?)<\/div><p class="meta">([\s\S]*?)<\/p><\/div>/g),
  (match) => ({
    label: decodeHtml(match[1]),
    title: decodeHtml(match[2]),
    description: decodeHtml(match[3]),
  })
);

const plan = {
  title: capture(headerHtml, /<h1>([\s\S]*?)<\/h1>/),
  subtitle: capture(headerHtml, /<div class="kicker">([\s\S]*?)<\/div>/),
  description: capture(headerHtml, /<p>([\s\S]*?)<\/p>/),
  sourceFile,
  structure: capture(
    weeksHtml,
    /<div class="notice"><h2>[\s\S]*?<\/h2><p>([\s\S]*?)<\/p><p>([\s\S]*?)<\/p><\/div>/,
    ""
  ),
  usage: Array.from(
    weeksHtml.matchAll(/<div class="notice"><h2>[\s\S]*?<\/h2><p>([\s\S]*?)<\/p>/g),
    (match) => decodeHtml(match[1])
  ),
  stats: {
    weeks: weeks.length,
    days: weeks.reduce((total, week) => total + week.days.length, 0),
    totalHours: 107,
    hoursPerDay: 1.5,
    examDate: "11/10/2026",
    contentEndDate: "21/09/2026",
    questions: 70,
    compensation: "R$ 10.685,44",
  },
  headerStats,
  weeks,
  checklistSections,
  audit: {
    summary:
      "0 pendências de conteúdo programático. O checklist mantém todos os tópicos informados para Módulo I e Módulo II — Perfil 3.",
    distribution: auditRows,
    notes: auditNotes,
  },
  editalCards,
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(plan, null, 2)}\n`, "utf8");
console.log(`Imported ${plan.stats.days} days from ${sourceFile} into ${outputPath}`);
