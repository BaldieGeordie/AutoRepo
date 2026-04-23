import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import fs from "fs";
import path from "path";

const port = Number(process.env.PORT) || 3000;
const host = "0.0.0.0";

const app = Fastify({
  logger: true,
});

const startedAt = new Date().toISOString();

const starterAssembly = {
  assemblyUid: "ASM-DEMO-0001",
  assetType: "DRIVE_UNIT",
  label: "Front axle drive unit",
  status: "SEALED",
  currentCustodianId: "org-demo-integrator",
  currentLocationId: "loc-demo-bay-4",
  componentCount: 4,
  anchoredSnapshot: {
    snapshotRef: "snap_demo_expected_0001",
    contentHash: "0x4d0f8a42b2fb2c92f6b3d3c9f0b7f09774f24116b9f25334f0b86a204de4fa91",
    targetLabel: "EVM dev target",
  },
  expectedComponents: [
    { serial: "MTR-44721-A", partNumber: "MOTOR-AXL-44721", positionLabel: "motor" },
    { serial: "INV-10291-K", partNumber: "INVERTER-10291", positionLabel: "inverter" },
    { serial: "SNS-99014-Q", partNumber: "SENSOR-99014", positionLabel: "sensor-a" },
    { serial: "SNS-99015-R", partNumber: "SENSOR-99015", positionLabel: "sensor-b" },
  ],
};

async function main() {
  await app.register(cors, {
    origin: true,
  });

  app.get("/health", async () => ({
    status: "ok",
    app: "VINtegrity",
    startedAt,
  }));

  app.get("/api/v1/meta", async () => ({
    product: {
      name: "VINtegrity",
      tagline: "Assembly integrity and blockchain-anchored verification",
    },
    status: "starter",
    capabilities: [
      "Serialized component registry",
      "Assembly composition tracking",
      "Anchored assembly snapshots",
      "Later inspection and mismatch detection",
    ],
    suggestedNextBuildSteps: [
      "Create assemblies and add serialized components",
      "Seal an expected assembly snapshot and queue it for anchoring",
      "Capture inspection observations from a physical asset",
      "Compare anchored state against observed contents",
    ],
    anchorTargets: [
      { targetKey: "evm-dev", label: "EVM dev target", kind: "EVM", enabled: true, primary: true },
      { targetKey: "solana-dev", label: "Solana dev target", kind: "SOLANA", enabled: false, primary: false },
    ],
  }));

  app.get("/api/v1/assemblies/demo", async () => starterAssembly);

  app.get("/api/v1/inspections/demo", async () => ({
    inspectionId: "insp_demo_0001",
    assemblyUid: starterAssembly.assemblyUid,
    result: "MISMATCH",
    summary: "One serialized sensor does not match the anchored expected configuration.",
    observations: [
      { positionLabel: "motor", observedSerial: "MTR-44721-A", matched: true },
      { positionLabel: "inverter", observedSerial: "INV-10291-K", matched: true },
      { positionLabel: "sensor-a", observedSerial: "SNS-99014-Q", matched: true },
      {
        positionLabel: "sensor-b",
        observedSerial: "SNS-99177-X",
        matched: false,
        varianceReason: "Unexpected replacement part detected",
      },
    ],
  }));

  const frontendDist = path.resolve(process.cwd(), "../frontend/dist");
  if (fs.existsSync(frontendDist)) {
    await app.register(fastifyStatic, {
      root: frontendDist,
      prefix: "/",
      wildcard: false,
    });
  }

  app.setNotFoundHandler(async (request, reply) => {
    if (request.raw.url?.startsWith("/api/")) {
      return reply.code(404).send({ error: "Not found" });
    }

    const indexPath = path.join(frontendDist, "index.html");
    if (fs.existsSync(indexPath)) {
      return reply.type("text/html").send(fs.readFileSync(indexPath, "utf8"));
    }

    return reply.code(404).send("VINtegrity starter is running, but the frontend bundle has not been built yet.");
  });

  await app.listen({ port, host });
}

main().catch((error) => {
  app.log.error(error);
  process.exit(1);
});
