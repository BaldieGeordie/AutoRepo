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
  label: "Verified demonstrator vehicle",
  status: "SEALED",
  currentCustodianId: "oem-demo-plant-04",
  currentLocationId: "approved-dealer-northgate",
  componentCount: 4,
  anchoredSnapshot: {
    snapshotRef: "snap_demo_expected_0001",
    contentHash: "0x4d0f8a42b2fb2c92f6b3d3c9f0b7f09774f24116b9f25334f0b86a204de4fa91",
    targetLabel: "EVM dev target",
  },
  expectedComponents: [
    { serial: "VIN-WVWZZZCD7NW184201", partNumber: "VEHICLE-RECORD", positionLabel: "vehicle" },
    { serial: "MTR-44721-A", partNumber: "MOTOR-AXL-44721", positionLabel: "front-drive-unit" },
    { serial: "BAT-10291-K", partNumber: "BATTERY-MODULE-10291", positionLabel: "battery-module" },
    { serial: "ADAS-99015-R", partNumber: "SENSOR-ADAS-99015", positionLabel: "driver-assist-sensor" },
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
      tagline: "Verified vehicle provenance. Genuine parts. Trusted history.",
    },
    status: "starter",
    capabilities: [
      "Verified vehicle provenance",
      "Genuine component registry",
      "Approved fitment tracking",
      "Recall and safety campaign exposure",
      "Custody transfer and acceptance",
      "Warranty-period fault triage",
      "Independent workshop and owner-fit evidence capture",
      "Transparent service provenance for resale",
    ],
    suggestedNextBuildSteps: [
      "Register genuine serialized components",
      "Create vehicle and assembly records",
      "Fit approved components into a vehicle assembly",
      "Seal the expected vehicle provenance snapshot",
      "Capture inspection observations from a workshop or dealer site",
      "Compare warranty-sensitive evidence against observed vehicle contents",
      "Expose service history clearly for future buyers",
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
    summary: "One fitted driver assistance sensor differs from the trusted vehicle provenance snapshot and needs warranty-context review.",
    observations: [
      { positionLabel: "vehicle", observedSerial: "VIN-WVWZZZCD7NW184201", matched: true },
      { positionLabel: "front-drive-unit", observedSerial: "MTR-44721-A", matched: true },
      { positionLabel: "battery-module", observedSerial: "BAT-10291-K", matched: true },
      {
        positionLabel: "driver-assist-sensor",
        observedSerial: "ADAS-99177-X",
        matched: false,
        varianceReason: "Aftermarket or independently fitted component requires warranty review",
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
