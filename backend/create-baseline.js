const fs = require("fs");

const input = fs.readFileSync("./initial_schema.sql", "utf8");

const sections = input.split(/^--\s*$/m);

const unwantedPatterns = [
  /Name: schema_migrations;/,
  /schema_migrations/,
  /\\restrict/,
  /\\unrestrict/,
];

const keptSections = sections.filter((section) => {
  return !unwantedPatterns.some((pattern) => pattern.test(section));
});

const baseline = keptSections.join("--\n");

fs.writeFileSync(
  "./src/migrations/000_initial_schema.sql",
  baseline
);

console.log("Created src/migrations/000_initial_schema.sql");