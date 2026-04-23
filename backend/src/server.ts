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
    snapshotType: "INITIAL_SALE_CONFIGURATION",
    contentHash: "0x4d0f8a42b2fb2c92f6b3d3c9f0b7f09774f24116b9f25334f0b86a204de4fa91",
    targetLabel: "EVM dev target",
  },
  initialSaleBaseline: {
    soldAt: "2026-04-19T10:30:00.000Z",
    soldBy: "OEM plant 04",
    componentCount: 4,
    purpose:
      "A sealed vehicle composition at first sale, used as the warranty-period baseline for later repair checks.",
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

const demoRepairEvent = {
  repairEventId: "repair_demo_0001",
  assemblyUid: starterAssembly.assemblyUid,
  serviceOrderRef: "SO-WTY-184201-044",
  warrantyClaimRef: "WTY-ADAS-184201",
  reason: "ADAS calibration fault reported during warranty period",
  status: "WARRANTY_REVIEW",
  repairer: {
    name: "Northgate OEM Service",
    tier: "OEM repairer",
    networkStatus: "Inside approved repairer network",
  },
  openedBy: {
    displayName: "M. Kaur",
    role: "Approved repairer technician",
  },
  lifecycle: [
    {
      action: "VERIFY_PRESENT",
      positionLabel: "driver-assist-sensor",
      expectedSerial: "ADAS-99015-R",
      observedSerial: "ADAS-99015-R",
      networkStatus: "Inside approved repairer network",
      warrantyImpact: "None",
      authenticatedBy: "M. Kaur",
      notes: "Original sensor verified against the sealed initial-sale snapshot before removal.",
    },
    {
      action: "BOOK_OFF",
      positionLabel: "driver-assist-sensor",
      expectedSerial: "ADAS-99015-R",
      observedSerial: "ADAS-99015-R",
      networkStatus: "Inside approved repairer network",
      warrantyImpact: "None",
      authenticatedBy: "M. Kaur",
      notes: "Faulting sensor removed from vehicle assembly and retained against service order.",
    },
    {
      action: "BOOK_ON",
      positionLabel: "driver-assist-sensor",
      expectedSerial: "ADAS-99015-R",
      observedSerial: "ADAS-99177-X",
      networkStatus: "Outside approved warranty network",
      warrantyImpact: "Warranty review required",
      authenticatedBy: "Self-declared repair record",
      notes:
        "Replacement sensor serial is present on the car, but evidence shows the fitment originated outside the OEM repairer network.",
    },
  ],
};

const demoRecallCampaign = {
  campaignCode: "SC-ADAS-27F",
  title: "ADAS sensor water ingress safety campaign",
  severity: "SAFETY_RECALL",
  status: "ACTIVE",
  target: {
    partNumber: "SENSOR-ADAS-99015",
    serialPrefix: "ADAS-99",
    rule: "Target vehicles currently carrying affected ADAS sensor serials.",
  },
  focusedExposure: {
    assemblyUid: starterAssembly.assemblyUid,
    vin: "WVWZZZCD7NW184201",
    componentSerial: "ADAS-99015-R",
    exposureStatus: "REPAIR_BOOKED",
    reason: "Affected component is attached to this vehicle assembly.",
    action:
      "Book the affected component off the car, fit an authenticated replacement, then clear the campaign exposure.",
  },
  buyerCareSignal: {
    label: "Care history evidence",
    summary:
      "Future buyers can see that a recall-sensitive component was identified, removed, replaced, and authenticated instead of relying on a generic service stamp.",
  },
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
      "Initial-sale vehicle composition baseline",
      "Serialized component authentication by named users",
      "Book-off and book-on repair event lifecycle",
      "OEM and approved repairer network evidence",
      "Tiered repairer model for warranty review",
      "Targeted recall exposure by component-to-vehicle attachment",
      "Outside-network fitment detection",
      "Warranty impact triage against authenticated parts",
      "Vehicle care history for future buyer confidence",
      "Auditable repair and fitment event trail",
    ],
    suggestedNextBuildSteps: [
      "Register serialized OEM components",
      "Create vehicle assemblies and sub-assemblies",
      "Seal the initial sale composition for each vehicle",
      "Authenticate component fitments by user and repairer tier",
      "Book components off and back on during repair work",
      "Resolve safety campaigns to vehicles carrying affected components",
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

  app.get("/api/v1/repair-events/demo", async () => demoRepairEvent);

  app.get("/api/v1/recalls/demo", async () => demoRecallCampaign);

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
