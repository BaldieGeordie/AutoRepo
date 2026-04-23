const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { setTimeout: delay } = require("node:timers/promises");

const DEFAULT_MIGRATION_CONNECTION_LIMIT = 1;
const DEFAULT_MIGRATION_POOL_TIMEOUT_SEC = 30;
const DEFAULT_MIGRATION_MAX_ATTEMPTS = 6;

function readPositiveInt(name, fallback) {
  const raw = Number(process.env[name] ?? fallback);
  if (!Number.isFinite(raw)) return fallback;
  return Math.max(1, Math.floor(raw));
}

function buildMigrationDatabaseUrl(rawUrl) {
  const parsed = new URL(rawUrl);

  if (!parsed.searchParams.has("connection_limit")) {
    parsed.searchParams.set(
      "connection_limit",
      String(readPositiveInt("PRISMA_MIGRATION_CONNECTION_LIMIT", DEFAULT_MIGRATION_CONNECTION_LIMIT)),
    );
  }

  if (!parsed.searchParams.has("pool_timeout")) {
    parsed.searchParams.set(
      "pool_timeout",
      String(readPositiveInt("PRISMA_MIGRATION_POOL_TIMEOUT_SEC", DEFAULT_MIGRATION_POOL_TIMEOUT_SEC)),
    );
  }

  return parsed.toString();
}

function isRetryableMigrationFailure(output) {
  return (
    /too many clients already/i.test(output) ||
    /remaining connection slots are reserved/i.test(output) ||
    /failed to acquire/i.test(output)
  );
}

function runPrismaMigrate(env) {
  return new Promise((resolve, reject) => {
    const command = process.platform === "win32" ? "npx.cmd" : "npx";
    const child = spawn(command, ["prisma", "migrate", "deploy"], {
      env,
      stdio: ["inherit", "pipe", "pipe"],
    });

    let output = "";

    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stdout.write(chunk);
    });

    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      output += text;
      process.stderr.write(chunk);
    });

    child.on("error", reject);
    child.on("close", (code, signal) => {
      resolve({
        code: code ?? (signal ? 1 : 0),
        output,
      });
    });
  });
}

async function runMigrationsWithRetry() {
  const baseDatabaseUrl = String(process.env.DATABASE_URL ?? "").trim();
  const migrationsPath = path.resolve(__dirname, "../prisma/migrations");
  const hasMigrations = fs.existsSync(migrationsPath);

  if (!hasMigrations) {
    console.warn("[deploy] No Prisma migrations directory found; skipping prisma migrate deploy for starter build");
    return;
  }

  if (!baseDatabaseUrl) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const migrationDatabaseUrl = buildMigrationDatabaseUrl(baseDatabaseUrl);
  const maxAttempts = readPositiveInt("PRISMA_MIGRATION_MAX_ATTEMPTS", DEFAULT_MIGRATION_MAX_ATTEMPTS);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    console.log(`[deploy] Running prisma migrate deploy (attempt ${attempt}/${maxAttempts})`);

    const result = await runPrismaMigrate({
      ...process.env,
      DATABASE_URL: migrationDatabaseUrl,
    });

    if (result.code === 0) {
      return;
    }

    if (!isRetryableMigrationFailure(result.output) || attempt === maxAttempts) {
      process.exit(result.code || 1);
    }

    const waitMs = Math.min(5000 * attempt, 30000);
    console.warn(`[deploy] Database connection capacity is full. Retrying prisma migrate deploy in ${waitMs}ms.`);
    await delay(waitMs);
  }
}

async function main() {
  if (String(process.env.SKIP_PRISMA_MIGRATE ?? "").trim() === "1") {
    console.warn("[deploy] SKIP_PRISMA_MIGRATE=1 set; skipping prisma migrate deploy");
  } else {
    await runMigrationsWithRetry();
  }

  require("../dist/server.js");
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[deploy] Startup failed: ${message}`);
  process.exit(1);
});
