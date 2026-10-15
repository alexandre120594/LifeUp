import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourcePath = path.join(root, "trt_pi_plano_realista_150_dias_snow_ui.html");
const targetPath = path.join(root, "src", "data", "trt-pi-schedule.json");
const source = await readFile(sourcePath, "utf8");
const match = source.match(/const DAYS=(\[.*?\]),ALLOC=/s);

if (!match) {
  throw new Error("Nao foi possivel localizar DAYS na referencia do cronograma.");
}

const days = JSON.parse(match[1]);
if (!Array.isArray(days) || days.length !== 150) {
  throw new Error(`Esperados 150 dias; encontrados ${Array.isArray(days) ? days.length : 0}.`);
}

await mkdir(path.dirname(targetPath), { recursive: true });
await writeFile(targetPath, `${JSON.stringify(days, null, 2)}\n`, "utf8");
console.log(`Cronograma importado: ${days.length} dias em ${targetPath}`);
