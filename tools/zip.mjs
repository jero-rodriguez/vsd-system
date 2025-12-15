import fs from "node:fs";
import path from "node:path";
import archiver from "archiver";

const ROOT = process.cwd();
const DIST = path.join(ROOT, "dist");
const SYSTEM_JSON = path.join(DIST, "system.json");

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

if (!exists(DIST)) {
  console.error("ZIP ERROR: No existe dist/. Ejecuta npm run build primero.");
  process.exit(1);
}

if (!exists(SYSTEM_JSON)) {
  console.error("ZIP ERROR: No existe dist/system.json.");
  process.exit(1);
}

const system = JSON.parse(fs.readFileSync(SYSTEM_JSON, "utf8"));

const SYSTEM_ID = system.id ?? "foundry-system";
const VERSION = system.version ?? "0.0.0";
console.log(`Creando ZIP para ${SYSTEM_ID} v${VERSION}...`);
const OUT = path.join(ROOT, `${SYSTEM_ID}-${VERSION}.zip`);

if (exists(OUT)) fs.unlinkSync(OUT);

const output = fs.createWriteStream(OUT);
const archive = archiver("zip", { zlib: { level: 9 } });

output.on("close", () => {
  console.log(`ZIP OK: ${path.basename(OUT)}`);
});

archive.on("error", (err) => {
  console.error(err);
  process.exit(1);
});

archive.pipe(output);

// MUY IMPORTANTE:
// el contenido de dist va a la raíz del ZIP, no dentro de /dist
archive.directory(DIST, false);

await archive.finalize();
