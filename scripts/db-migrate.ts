import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";
import { loadLocalEnv, requireEnv } from "./lib/env";

loadLocalEnv();

async function main() {
  const databaseUrl = requireEnv("SUPABASE_DB_URL");
  const sql = postgres(databaseUrl, {
    max: 1,
    ssl: "require",
  });

  try {
    await sql`
      create table if not exists public.skillbase_schema_migrations (
        filename text primary key,
        applied_at timestamptz not null default now()
      )
    `;

    const migrationsPath = path.join(process.cwd(), "supabase", "migrations");
    const files = fs
      .readdirSync(migrationsPath)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const [existing] = await sql<{ filename: string }[]>`
        select filename
        from public.skillbase_schema_migrations
        where filename = ${file}
      `;

      if (existing) {
        console.log(`skip=${file}`);
        continue;
      }

      const migrationSql = fs.readFileSync(
        path.join(migrationsPath, file),
        "utf8",
      );

      await sql.begin(async (transaction) => {
        await transaction.unsafe(migrationSql);
        await transaction`
          insert into public.skillbase_schema_migrations (filename)
          values (${file})
        `;
      });

      console.log(`applied=${file}`);
    }

    console.log("migrations=ready");
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
