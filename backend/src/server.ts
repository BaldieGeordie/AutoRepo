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
  assetType: "VEHICLE",
  label: "Warranty-period vehicle assembly",
  status: "SEALED",
  currentCustodianId: "oem-demo-plant-04",
  currentLocationId: "oem-repairer-northgate",
  componentCount: 4,
  anchoredSnapshot: {
    snapshotRef: "snap_demo_expected_0001",
    contentHash: "0x4d0f8a42b2fb2c92f6b3d3c9f0b7f09774f24116b9f25334f0b86a204de4fa91",
    targetLabel: "EVM dev target",
  },
  expectedComponents: [
    {
      serial: "VIN-WVWZZZCD7NW184201",
      partNumber: "VEHICLE-RECORD",
      positionLabel: "vehicle",
      authenticatedBy: "H. Richter",
      repairerTier: "OEM manufacturing",
      networkStatus: "Inside OEM network",
    },
    {
      serial: "MTR-44721-A",
      partNumber: "MOTOR-AXL-44721",
      positionLabel: "front-drive-unit",
      authenticatedBy: "M. Kaur",
      repairerTier: "OEM repairer",
      networkStatus: "Inside approved repairer network",
    },
    {
      serial: "BAT-10291-K",
      partNumber: "BATTERY-MODULE-10291",
      positionLabel: "battery-module",
      authenticatedBy: "A. Walker",
      repairerTier: "OEM manufacturing",
      networkStatus: "Inside OEM network",
    },
    {
      serial: "ADAS-99015-R",
      partNumber: "SENSOR-ADAS-99015",
      positionLabel: "driver-assist-sensor",
      authenticatedBy: "Self-declared repair record",
      repairerTier: "Outside network",
      networkStatus: "Outside approved warranty network",
    },
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
      tagline: "OEM warranty intelligence for authenticated vehicle assemblies.",
    },
    status: "starter",
    capabilities: [
      "Vehicle assembly aggregation",
      "Serialized component authentication by named users",
      "OEM and approved repairer network evidence",
      "Tiered repairer model for warranty review",
      "Outside-network fitment detection",
      "Warranty impact triage against authenticated parts",
      "Auditable repair and fitment event trail",
    ],
    suggestedNextBuildSteps: [
      "Register serialized OEM components",
      "Create vehicle assemblies and sub-assemblies",
      "Authenticate component fitments by user and repairer tier",
      "Seal the expected vehicle assembly snapshot",
      "Record repairs from OEM, approved, tier 2, and outside-network repairers",
      "Detect warranty-sensitive parts fitted outside the repairer network",
      "Present warranty impact evidence to OEM review teams",
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
    summary: "One fitted driver assistance sensor differs from the trusted vehicle assembly snapshot and needs OEM warranty review.",
    observations: [
      { positionLabel: "vehicle", observedSerial: "VIN-WVWZZZCD7NW184201", matched: true },
      { positionLabel: "front-drive-unit", observedSerial: "MTR-44721-A", matched: true },
      { positionLabel: "battery-module", observedSerial: "BAT-10291-K", matched: true },
      {
        positionLabel: "driver-assist-sensor",
        observedSerial: "ADAS-99177-X",
        matched: false,
        varianceReason: "Observed component was fitted outside the approved repairer network",
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
