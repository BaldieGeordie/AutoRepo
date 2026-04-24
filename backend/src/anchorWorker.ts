import "dotenv/config";

const pollIntervalMs = Math.max(1000, Number(process.env.ANCHOR_WORKER_POLL_INTERVAL_MS || 5000));
const primaryTarget = process.env.ANCHOR_PRIMARY_TARGET || "evm-dev";

console.log(`[anchor-worker] AuthLine Auto VINtegrity worker started. Primary target: ${primaryTarget}. Poll interval: ${pollIntervalMs}ms`);

setInterval(() => {
  console.log("[anchor-worker] Placeholder worker heartbeat. No dispatch processor has been implemented yet.");
}, pollIntervalMs);
