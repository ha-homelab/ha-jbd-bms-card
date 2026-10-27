/** Bundle audited local dictionaries into the single HACS entry point. */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
const root = fileURLToPath(new URL("../", import.meta.url));
export async function bundledTranslations() {
  const locales = JSON.parse(await readFile(resolve(root, "locales/index.json"), "utf8"));
  const messages = {};
  const placeholders = value => [...value.matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g)].map(match => match[1]).sort();
  for (const locale of locales) {
    if (!/^[a-z]{2}(?:-(?:Hans|Hant))?$/.test(locale.code) || Object.hasOwn(messages, locale.code)) throw Error("Invalid or repeated locale");
    if (!["ltr", "rtl"].includes(locale.dir) || typeof locale.name !== "string") throw Error("Invalid locale metadata");
    const dictionary = JSON.parse(await readFile(resolve(root, `locales/${locale.code}.json`), "utf8"));
    if (Object.values(dictionary).some(value => typeof value !== "string" || !value.trim())) throw Error(`Empty translation in ${locale.code}`);
    messages[locale.code] = dictionary;
  }
  for (const [code, dictionary] of Object.entries(messages)) {
    if (JSON.stringify(Object.keys(dictionary).sort()) !== JSON.stringify(Object.keys(messages.en).sort())) throw Error(`Missing or extra keys in ${code}`);
    for (const key of Object.keys(messages.en)) {
      if (JSON.stringify(placeholders(dictionary[key])) !== JSON.stringify(placeholders(messages.en[key]))) throw Error(`Incorrect placeholders in ${code}: ${key}`);
    }
  }
  return `// BEGIN GENERATED I18N — run node scripts/build-i18n.mjs\nexport const LOCALES = Object.freeze(${JSON.stringify(locales)}.map(Object.freeze));\nexport const MESSAGES = Object.freeze(Object.fromEntries(Object.entries(${JSON.stringify(messages)}).map(([code, messages]) => [code, Object.freeze(messages)])));\n// END GENERATED I18N`;
}
export async function checkBundle() {
  const source = await readFile(resolve(root, "ha-jbd-bms-card.js"), "utf8");
  const generated = await bundledTranslations();
  const pattern = /\/\/ BEGIN GENERATED I18N[^]*?\/\/ END GENERATED I18N/;
  if (!pattern.test(source)) throw Error("Missing translation bundle markers");
  return { source, updated: source.replace(pattern, () => generated) };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { source, updated } = await checkBundle();
  if (process.argv.includes("--check")) {
    if (source !== updated) throw Error("Translation bundle is stale; run node scripts/build-i18n.mjs");
  } else await writeFile(resolve(root, "ha-jbd-bms-card.js"), updated);
}
