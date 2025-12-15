import path from "node:path";
import fs from "node:fs";
import fse from "fs-extra";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const DIST = path.join(ROOT, "dist");

const PATHS = {
  moduleDir: path.join(SRC, "module"),
  templatesDir: path.join(SRC, "templates"),
  langDir: path.join(SRC, "lang"),
  assetsDir: path.join(SRC, "assets"),
  packsDir: path.join(SRC, "packs"),
  libDir: path.join(SRC, "lib"),
  cssDir: path.join(SRC, "css"),

  systemJson: path.join(SRC, "system.json"),
  templateJson: path.join(SRC, "template.json"),

  // Ficheros de documentación (están en ROOT, no en src)
  readme: path.join(ROOT, "README.md"),
  changelog: path.join(ROOT, "CHANGELOG.md"),
  license: path.join(ROOT, "LICENSE.txt"),

  packageJson: path.join(ROOT, "package.json"),
};

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}
function fail(msg) {
  console.error(`BUILD ERROR: ${msg}`);
  process.exit(1);
}

async function cleanDist() {
  await fse.remove(DIST);
  await fse.ensureDir(DIST);
}

async function copyDirIfExists(src, dest) {
  if (!exists(src)) return;
  await fse.copy(src, dest, { overwrite: true });
}

async function copyFileIfExists(src, dest) {
  if (!exists(src)) return;
  await fse.copy(src, dest, { overwrite: true });
}

function assertNoDistPathsInManifest(manifest) {
  const text = JSON.stringify(manifest);
  if (text.includes("dist/") || text.includes("dist\\")) {
    fail("system.json contiene rutas con 'dist/'. dist es solo staging.");
  }
}

async function writeManifestToDist() {
  const pkg = await fse.readJson(PATHS.packageJson);
  const manifest = await fse.readJson(PATHS.systemJson);

  if (!pkg?.version) {
    fail("package.json no tiene campo version.");
  }

  // Fuente de verdad: package.json
  manifest.version = pkg.version;

  const vTag = `v${pkg.version}`;
  manifest.manifest = `https://raw.githubusercontent.com/jero-rodriguez/vsd-system/refs/tags/${vTag}/system.json`;
  manifest.download = `https://github.com/jero-rodriguez/vsd-system/archive/refs/tags/${vTag}.zip`;

  assertNoDistPathsInManifest(manifest);

  await fse.writeJson(path.join(DIST, "system.json"), manifest, { spaces: 2 });
}

async function copyTemplateJsonToDist() {
  if (!exists(PATHS.templateJson)) fail("No encuentro src/template.json.");
  await fse.copy(PATHS.templateJson, path.join(DIST, "template.json"), {
    overwrite: true,
  });
}

function sanityCheckDist() {
  const manifestPath = path.join(DIST, "system.json");
  if (!exists(manifestPath)) fail("No existe dist/system.json.");

  const manifest = fse.readJsonSync(manifestPath);
  assertNoDistPathsInManifest(manifest);

  const checkFiles = (arr, label) => {
    if (!Array.isArray(arr)) return;
    for (const rel of arr) {
      if (typeof rel !== "string") continue;
      const fp = path.join(DIST, rel);
      if (!exists(fp)) {
        fail(`system.json -> ${label}: '${rel}' no existe en dist.`);
      }
    }
  };

  checkFiles(manifest.esmodules, "esmodules");
  checkFiles(manifest.styles, "styles");

  if (Array.isArray(manifest.languages)) {
    for (const l of manifest.languages) {
      const fp = path.join(DIST, l.path);
      if (!exists(fp)) {
        fail(`system.json -> languages.path '${l.path}' no existe en dist.`);
      }
    }
  }
}

async function main() {
  await cleanDist();

  // Runtime real
  await copyDirIfExists(PATHS.moduleDir, path.join(DIST, "module"));
  await copyDirIfExists(PATHS.templatesDir, path.join(DIST, "templates"));
  await copyDirIfExists(PATHS.langDir, path.join(DIST, "lang"));
  await copyDirIfExists(PATHS.assetsDir, path.join(DIST, "assets"));
  await copyDirIfExists(PATHS.packsDir, path.join(DIST, "packs"));
  await copyDirIfExists(PATHS.libDir, path.join(DIST, "lib"));
  await copyDirIfExists(PATHS.cssDir, path.join(DIST, "css"));

  // Documentación
  await copyFileIfExists(PATHS.readme, path.join(DIST, "README.md"));
  await copyFileIfExists(PATHS.changelog, path.join(DIST, "CHANGELOG.md"));
  await copyFileIfExists(PATHS.license, path.join(DIST, "LICENSE.txt"));

  await copyTemplateJsonToDist();
  await writeManifestToDist();

  sanityCheckDist();
  console.log("BUILD OK: dist/ listo para empaquetar.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
