import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function purge() {
  console.log("Starting VINtegrity database purge...");

  const deletePlan = [
    ["AnchorReceipt", () => prisma.anchorReceipt.deleteMany()],
    ["AnchorDispatch", () => prisma.anchorDispatch.deleteMany()],
    ["AssemblyCampaignExposure", () => prisma.assemblyCampaignExposure.deleteMany()],
    ["CampaignComponentTarget", () => prisma.campaignComponentTarget.deleteMany()],
    ["SafetyCampaign", () => prisma.safetyCampaign.deleteMany()],
    ["RepairEventItem", () => prisma.repairEventItem.deleteMany()],
    ["RepairEvent", () => prisma.repairEvent.deleteMany()],
    ["InspectionItem", () => prisma.inspectionItem.deleteMany()],
    ["Inspection", () => prisma.inspection.deleteMany()],
    ["AuthenticationEvent", () => prisma.authenticationEvent.deleteMany()],
    ["AssemblySnapshot", () => prisma.assemblySnapshot.deleteMany()],
    ["AssemblyNode", () => prisma.assemblyNode.deleteMany()],
    ["AssemblyMembership", () => prisma.assemblyMembership.deleteMany()],
    ["Component", () => prisma.component.deleteMany()],
    ["Assembly", () => prisma.assembly.deleteMany()],
    ["PlatformUser", () => prisma.platformUser.deleteMany()],
    ["Repairer", () => prisma.repairer.deleteMany()],
    ["AnchorTarget", () => prisma.anchorTarget.deleteMany()],
  ] as const;

  for (const [label, deleteRecords] of deletePlan) {
    console.log(`Deleting ${label} records...`);
    await deleteRecords();
  }

  console.log("VINtegrity database purged successfully.");
}

purge()
  .catch((error) => {
    console.error("Purge failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
