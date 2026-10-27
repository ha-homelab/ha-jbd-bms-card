import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(root, path), "utf8");
const locales = JSON.parse(read("locales/index.json"));
const guideDirectory = "docs/translations";

function markdownFiles(directory) {
  return readdirSync(join(root, directory), { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? markdownFiles(path) : extname(path) === ".md" ? [path] : [];
  });
}

// Ignore examples while inspecting links, but fail on a forgotten closing fence.
function prose(source, path) {
  let fence = null;
  const lines = [];
  for (const line of source.split("\n")) {
    const marker = line.match(/^\s*(`{3,}|~{3,})(.*)$/);
    if (marker) {
      if (!fence) fence = marker[1];
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = null;
      continue;
    }
    if (!fence) lines.push(line);
  }
  assert.equal(fence, null, `${path}: unclosed code fence`);
  return lines.join("\n");
}

function linkTargets(source) {
  return [...source.matchAll(/!?\[[^\]\n]*\]\(<?([^\s)>]+)>?(?:\s+"[^"]*")?\)/g)]
    .map((match) => match[1]);
}

const files = [
  ...readdirSync(root).filter((name) => extname(name) === ".md"),
  ...markdownFiles("docs"),
];
let localLinks = 0;
for (const path of files) {
  for (const target of linkTargets(prose(read(path), path))) {
    if (/^[a-z][a-z\d+.-]*:/i.test(target) || target.startsWith("//")) continue;
    const pathname = decodeURIComponent(target.split(/[?#]/)[0]);
    if (!pathname) continue;
    const destination = resolve(root, dirname(path), pathname);
    assert.ok(!relative(root, destination).startsWith(".."), `${path}: link escapes repository: ${target}`);
    assert.ok(existsSync(destination), `${path}: missing local link target: ${target}`);
    localLinks++;
  }
}

const canonical = read(`${guideDirectory}/README.en.md`);
const canonicalYaml = canonical.match(/```yaml\n([\s\S]*?)\n```/)?.[1];
assert.ok(canonicalYaml, "English guide must provide a YAML configuration example");
const canonicalLinks = [...new Set(linkTargets(canonical))].sort();
const navigation = read(`${guideDirectory}/README.md`);
const readme = read("README.md");
const expectedGuides = locales.map(({ code }) => `README.${code}.md`).sort();
const actualGuides = readdirSync(join(root, guideDirectory)).filter((name) => /^README\..+\.md$/.test(name)).sort();
assert.deepEqual(actualGuides, expectedGuides, "Translated guides must match the supported locale index");

for (const { code } of locales) {
  const filename = `README.${code}.md`;
  const path = `${guideDirectory}/${filename}`;
  const source = read(path);
  assert.ok(prose(source, path).length >= 1000, `${path}: provide a substantive translated guide`);
  assert.ok(navigation.includes(`](${filename})`), `${path}: missing from language index`);
  assert.ok(readme.includes(`](${path})`), `${path}: missing from main README`);
  assert.deepEqual([...new Set(linkTargets(source))].sort(), canonicalLinks, `${path}: keep all reference links aligned with English`);
  assert.equal(source.match(/```yaml\n([\s\S]*?)\n```/)?.[1], canonicalYaml, `${path}: configuration example differs from English`);
  for (const literal of [
    `language: ${code}`, "language: auto", "0.2.0", "Dashboard",
    "/config/www/", "/local/ha-jbd-bms-card.js", "/hacsfiles/ha-jbd-bms-card/ha-jbd-bms-card.js",
  ]) assert.ok(source.includes(literal), `${path}: missing technical literal ${literal}`);
}

console.log(`Documentation checks passed: ${files.length} Markdown files, ${localLinks} local links, ${locales.length} translated guides.`);
