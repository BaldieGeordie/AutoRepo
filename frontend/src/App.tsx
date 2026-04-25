import { useEffect, useMemo, useState, type ChangeEvent } from "react";

type MetaResponse = {
  company: {
    name: string;
    parentCompany: string;
    description: string;
  };
  product: {
    name: string;
    tagline: string;
  };
  status: string;
  capabilities: string[];
  suggestedNextBuildSteps: string[];
  anchorTargets: Array<{
    targetKey: string;
    label: string;
    kind: string;
    enabled: boolean;
    primary: boolean;
  }>;
};

type Tone = "cyan" | "green" | "amber" | "red" | "steel";

type VehicleRecord = {
  vin: string;
  model: string;
  repairer: string;
  repairerTier: string;
  assemblyRef: string;
  owner: string;
  warranty: string;
  status: string;
  tone: Tone;
  lastCheck: string;
};

type AggregationNode = {
  id: string;
  label: string;
  nodeType: string;
  category: string;
  serial?: string;
  partNumber?: string;
  status: string;
  tone: Tone;
  anchorRef: string;
  standard: string;
  fittedBy: string;
  repairerTier: string;
  networkStatus: string;
  authenticatedBy: string;
  authenticatorRole: string;
  warrantyImpact: string;
  recallExposure: string;
  quantity: number;
  children?: AggregationNode[];
};

type TreeRow = AggregationNode & {
  depth: number;
  path: string;
  childCount: number;
  isExpanded: boolean;
};

type WorkflowStep = {
  label: string;
  detail: string;
  tone: Tone;
};

type EvidenceAttachment = {
  id: string;
  evidenceType: string;
  label: string;
  fileName: string;
  capturedAt: string;
  status: string;
  tone: Tone;
  previewUrl?: string;
};

type TechnicianStageId = "select" | "scan" | "photos" | "decision" | "commit";

type WarrantyWorkflow = {
  id: string;
  title: string;
  tone: Tone;
  assemblyNodeId: string;
  currentStatus: string;
  summary: string;
  expectedSerial: string;
  scannedSerial: string;
  replacementSerial: string;
  serviceRoute: string;
  scanDecision: string;
  finalFitmentLabel: string;
  finalFitmentSerial: string;
  vehicleStateAfterWork: string;
  partAuthenticity: string;
  loggedToVinBaseline: boolean;
  networkFitmentEvidence: string;
  partNumber: string;
  scanOutcome: string;
  oemPartRecognised: boolean;
  shipmentTrace: {
    status: string;
    shippedTo: string;
    repairerTier: string;
    networkStatus: string;
  };
  warrantyImpact: string;
  recommendedAction: string;
  steps: WorkflowStep[];
  evidenceLog: string[];
  evidenceAttachments: EvidenceAttachment[];
};

const apiBase = import.meta.env.VITE_API_BASE || "/api/v1";

const navigation: Array<{ label: string; target: string }> = [
  { label: "Current VIN", target: "vin-file" },
  { label: "Assembly Directory", target: "assembly-directory" },
  { label: "Repair Workflow", target: "repair-workflow" },
  { label: "Scan & Verify", target: "scan-verify" },
  { label: "Warranty Review", target: "warranty-review" },
  { label: "Targeted Recalls", target: "targeted-recalls" },
  { label: "Care History", target: "care-history" },
  { label: "Audit Trail", target: "audit-trail" },
];

const metrics: Array<{ label: string; value: string; delta: string; tone: Tone }> = [
  { label: "Warranty Vehicles", value: "18,420", delta: "+6.4% 30d", tone: "cyan" },
  { label: "Assembly Nodes", value: "684,210", delta: "multi-level tree", tone: "green" },
  { label: "Leaf Components", value: "241,908", delta: "99.2% verified", tone: "green" },
  { label: "Major Systems", value: "92,100", delta: "engine to interior", tone: "cyan" },
  { label: "Booked Part Changes", value: "8,742", delta: "off/on evidenced", tone: "cyan" },
  { label: "Focused Recall VINs", value: "27", delta: "8 critical", tone: "red" },
  { label: "Open Repair Events", value: "184", delta: "42 awaiting auth", tone: "amber" },
  { label: "Outside-network Fits", value: "2,961", delta: "warranty signal", tone: "steel" },
];

const statusChips: Array<{ label: string; tone: Tone }> = [
  { label: "OEM Authenticated", tone: "green" },
  { label: "Factory Fit", tone: "cyan" },
  { label: "Approved Repairer", tone: "green" },
  { label: "Sub-Assembly", tone: "cyan" },
  { label: "Part Replaced", tone: "steel" },
  { label: "Repair Booked", tone: "cyan" },
  { label: "Outside Network", tone: "steel" },
  { label: "Warranty Review", tone: "amber" },
  { label: "Recall Targeted", tone: "red" },
  { label: "Recall Cleared", tone: "green" },
  { label: "Evidence Missing", tone: "red" },
];

const vehicleRecords: VehicleRecord[] = [
  {
    vin: "WVWZZZCD7NW184201",
    model: "ID.7 Pro S",
    repairer: "Northgate OEM Service",
    repairerTier: "OEM repairer",
    assemblyRef: "ASM-VEH-WVW184201",
    owner: "Fleet operator",
    warranty: "Active warranty",
    status: "OEM Authenticated",
    tone: "green",
    lastCheck: "2 min ago",
  },
  {
    vin: "SJAAM2ZV8PC019488",
    model: "Continental Hybrid",
    repairer: "Metro Fleet Service",
    repairerTier: "Tier 2 repairer",
    assemblyRef: "ASM-VEH-PC019488",
    owner: "Insurer custody",
    warranty: "Warranty review",
    status: "Authentication Pending",
    tone: "amber",
    lastCheck: "18 min ago",
  },
  {
    vin: "ZFF95NLA6P0287319",
    model: "Roma Spider",
    repairer: "West Quay Autocare",
    repairerTier: "Outside network",
    assemblyRef: "ASM-VEH-P0287319",
    owner: "Private owner",
    warranty: "Out of warranty",
    status: "Outside Network",
    tone: "steel",
    lastCheck: "41 min ago",
  },
];

const demoAggregationRoot: AggregationNode = {
  id: "veh-wvw184201",
  label: "WVWZZZCD7NW184201",
  nodeType: "Vehicle",
  category: "Complete vehicle",
  serial: "VIN-WVWZZZCD7NW184201",
  partNumber: "VEHICLE-RECORD",
  status: "OEM Authenticated",
  tone: "green",
  anchorRef: "snap_demo_expected_0001",
  standard: "Initial-sale sealed vehicle composition",
  fittedBy: "OEM plant 04",
  repairerTier: "OEM manufacturing",
  networkStatus: "Inside OEM network",
  authenticatedBy: "H. Richter",
  authenticatorRole: "OEM release authority",
  warrantyImpact: "Primary aggregation baseline for the whole car.",
  recallExposure: "No vehicle-level campaign exposure.",
  quantity: 1,
  children: [
    {
      id: "sys-powertrain",
      label: "Powertrain",
      nodeType: "Major system",
      category: "Engine and gearbox",
      status: "Verified",
      tone: "green",
      anchorRef: "snap_powertrain_184201",
      standard: "OEM powertrain specification",
      fittedBy: "OEM plant 04",
      repairerTier: "OEM manufacturing",
      networkStatus: "Inside OEM network",
      authenticatedBy: "A. Walker",
      authenticatorRole: "OEM component release",
      warrantyImpact: "Powertrain system is inside the initial-sale baseline.",
      recallExposure: "No open campaign exposure.",
      quantity: 1,
      children: [
        {
          id: "asm-engine",
          label: "Electric drive unit",
          nodeType: "Assembly",
          category: "Engine equivalent",
          serial: "MTR-44721-A",
          partNumber: "MOTOR-AXL-44721",
          status: "Approved Repairer",
          tone: "cyan",
          anchorRef: "snap_drive_unit_44721",
          standard: "OEM replacement standard",
          fittedBy: "Northgate OEM Service",
          repairerTier: "OEM repairer",
          networkStatus: "Inside approved repairer network",
          authenticatedBy: "M. Kaur",
          authenticatorRole: "Approved repairer technician",
          warrantyImpact: "Replacement remains within OEM-supported repairer network.",
          recallExposure: "No open campaign exposure.",
          quantity: 1,
          children: [
            {
              id: "sub-motor-stator",
              label: "Motor stator module",
              nodeType: "Sub-assembly",
              category: "Propulsion internals",
              serial: "STA-44721-01",
              partNumber: "MOTOR-STATOR-44721",
              status: "Verified",
              tone: "green",
              anchorRef: "snap_stator_44721",
              standard: "OEM standard",
              fittedBy: "OEM plant 04",
              repairerTier: "OEM manufacturing",
              networkStatus: "Inside OEM network",
              authenticatedBy: "A. Walker",
              authenticatorRole: "OEM component release",
              warrantyImpact: "Normal warranty evidence.",
              recallExposure: "No open campaign exposure.",
              quantity: 1,
            },
            {
              id: "part-inverter",
              label: "Inverter control module",
              nodeType: "Component",
              category: "Power electronics",
              serial: "INV-44721-09",
              partNumber: "INVERTER-CTRL-44721",
              status: "Verified",
              tone: "green",
              anchorRef: "snap_inverter_44721",
              standard: "OEM standard",
              fittedBy: "OEM plant 04",
              repairerTier: "OEM manufacturing",
              networkStatus: "Inside OEM network",
              authenticatedBy: "N. Okafor",
              authenticatorRole: "OEM component release",
              warrantyImpact: "Supports powertrain warranty diagnostics.",
              recallExposure: "No open campaign exposure.",
              quantity: 1,
            },
          ],
        },
        {
          id: "asm-gearbox",
          label: "Reduction gearbox",
          nodeType: "Assembly",
          category: "Gearbox",
          serial: "GBX-55819-F",
          partNumber: "GEARBOX-REDUCTION-55819",
          status: "Verified",
          tone: "green",
          anchorRef: "snap_gearbox_55819",
          standard: "OEM standard",
          fittedBy: "OEM plant 04",
          repairerTier: "OEM manufacturing",
          networkStatus: "Inside OEM network",
          authenticatedBy: "H. Richter",
          authenticatorRole: "OEM release authority",
          warrantyImpact: "Inside initial-sale baseline.",
          recallExposure: "No open campaign exposure.",
          quantity: 1,
        },
      ],
    },
    {
      id: "sys-chassis",
      label: "Suspension and braking",
      nodeType: "Major system",
      category: "Chassis",
      status: "Verified",
      tone: "green",
      anchorRef: "snap_chassis_184201",
      standard: "OEM chassis specification",
      fittedBy: "OEM plant 04",
      repairerTier: "OEM manufacturing",
      networkStatus: "Inside OEM network",
      authenticatedBy: "A. Walker",
      authenticatorRole: "OEM component release",
      warrantyImpact: "No chassis exception recorded.",
      recallExposure: "No open campaign exposure.",
      quantity: 1,
      children: [
        {
          id: "asm-front-suspension",
          label: "Front suspension module",
          nodeType: "Assembly",
          category: "Suspension",
          serial: "SUS-FRT-184201",
          partNumber: "SUSPENSION-FRONT-MODULE",
          status: "Verified",
          tone: "green",
          anchorRef: "snap_front_suspension_184201",
          standard: "OEM standard",
          fittedBy: "OEM plant 04",
          repairerTier: "OEM manufacturing",
          networkStatus: "Inside OEM network",
          authenticatedBy: "A. Walker",
          authenticatorRole: "OEM component release",
          warrantyImpact: "Factory-fit evidence.",
          recallExposure: "No open campaign exposure.",
          quantity: 1,
          children: [
            {
              id: "part-left-damper",
              label: "Left front damper",
              nodeType: "Component",
              category: "Suspension part",
              serial: "DMP-LF-88102",
              partNumber: "DAMPER-FRONT-LH",
              status: "Verified",
              tone: "green",
              anchorRef: "snap_damper_lf_88102",
              standard: "OEM standard",
              fittedBy: "OEM plant 04",
              repairerTier: "OEM manufacturing",
              networkStatus: "Inside OEM network",
              authenticatedBy: "A. Walker",
              authenticatorRole: "OEM component release",
              warrantyImpact: "Factory-fit evidence.",
              recallExposure: "No open campaign exposure.",
              quantity: 1,
            },
            {
              id: "part-wheel-speed",
              label: "Wheel speed sensor",
              nodeType: "Component",
              category: "Brake electronics",
              serial: "WSS-33019-LF",
              partNumber: "SENSOR-WHEEL-SPEED-LF",
              status: "Verified",
              tone: "green",
              anchorRef: "snap_wss_lf_33019",
              standard: "OEM standard",
              fittedBy: "OEM plant 04",
              repairerTier: "OEM manufacturing",
              networkStatus: "Inside OEM network",
              authenticatedBy: "N. Okafor",
              authenticatorRole: "OEM component release",
              warrantyImpact: "Factory-fit evidence.",
              recallExposure: "No open campaign exposure.",
              quantity: 1,
            },
          ],
        },
        {
          id: "asm-brake-system",
          label: "Brake system",
          nodeType: "Assembly",
          category: "Braking",
          serial: "BRK-184201-A",
          partNumber: "BRAKE-SYSTEM-184201",
          status: "Verified",
          tone: "green",
          anchorRef: "snap_brake_system_184201",
          standard: "OEM standard",
          fittedBy: "OEM plant 04",
          repairerTier: "OEM manufacturing",
          networkStatus: "Inside OEM network",
          authenticatedBy: "N. Okafor",
          authenticatorRole: "OEM component release",
          warrantyImpact: "Factory-fit evidence.",
          recallExposure: "No open campaign exposure.",
          quantity: 1,
        },
      ],
    },
    {
      id: "sys-body",
      label: "Bodywork and structure",
      nodeType: "Major system",
      category: "Body shell and panels",
      status: "Verified",
      tone: "green",
      anchorRef: "snap_body_184201",
      standard: "OEM body specification",
      fittedBy: "OEM plant 04",
      repairerTier: "OEM manufacturing",
      networkStatus: "Inside OEM network",
      authenticatedBy: "H. Richter",
      authenticatorRole: "OEM release authority",
      warrantyImpact: "No structural exception recorded.",
      recallExposure: "No open campaign exposure.",
      quantity: 1,
      children: [
        {
          id: "asm-body-shell",
          label: "Body shell",
          nodeType: "Assembly",
          category: "Structure",
          serial: "BODY-184201",
          partNumber: "BODY-SHELL-ID7",
          status: "Verified",
          tone: "green",
          anchorRef: "snap_body_shell_184201",
          standard: "OEM standard",
          fittedBy: "OEM plant 04",
          repairerTier: "OEM manufacturing",
          networkStatus: "Inside OEM network",
          authenticatedBy: "H. Richter",
          authenticatorRole: "OEM release authority",
          warrantyImpact: "Factory-fit evidence.",
          recallExposure: "No open campaign exposure.",
          quantity: 1,
        },
        {
          id: "part-front-bumper",
          label: "Front bumper cover",
          nodeType: "Component",
          category: "Exterior panel",
          serial: "BMP-FRT-77201",
          partNumber: "BUMPER-FRONT-ID7",
          status: "Part Replaced",
          tone: "steel",
          anchorRef: "snap_bumper_front_77201",
          standard: "OEM replacement standard",
          fittedBy: "Northgate OEM Service",
          repairerTier: "OEM repairer",
          networkStatus: "Inside approved repairer network",
          authenticatedBy: "M. Kaur",
          authenticatorRole: "Approved repairer technician",
          warrantyImpact: "Replacement booked on with approved repair evidence.",
          recallExposure: "No open campaign exposure.",
          quantity: 1,
        },
      ],
    },
    {
      id: "sys-interior",
      label: "Interior and safety",
      nodeType: "Major system",
      category: "Cabin and restraint systems",
      status: "Verified",
      tone: "green",
      anchorRef: "snap_interior_184201",
      standard: "OEM interior specification",
      fittedBy: "OEM plant 04",
      repairerTier: "OEM manufacturing",
      networkStatus: "Inside OEM network",
      authenticatedBy: "N. Okafor",
      authenticatorRole: "OEM component release",
      warrantyImpact: "No interior exception recorded.",
      recallExposure: "No open campaign exposure.",
      quantity: 1,
      children: [
        {
          id: "part-airbag-ecu",
          label: "Airbag ECU",
          nodeType: "Component",
          category: "Safety electronics",
          serial: "SRS-90112-C",
          partNumber: "CONTROL-AIRBAG-90112",
          status: "Verified",
          tone: "green",
          anchorRef: "snap_airbag_ecu_90112",
          standard: "OEM standard",
          fittedBy: "OEM plant 04",
          repairerTier: "OEM manufacturing",
          networkStatus: "Inside OEM network",
          authenticatedBy: "N. Okafor",
          authenticatorRole: "OEM component release",
          warrantyImpact: "Factory-fit safety evidence.",
          recallExposure: "No open campaign exposure.",
          quantity: 1,
        },
        {
          id: "asm-driver-seat",
          label: "Driver seat assembly",
          nodeType: "Assembly",
          category: "Interior",
          serial: "SEAT-D-30219",
          partNumber: "SEAT-DRIVER-ID7",
          status: "Verified",
          tone: "green",
          anchorRef: "snap_driver_seat_30219",
          standard: "OEM standard",
          fittedBy: "OEM plant 04",
          repairerTier: "OEM manufacturing",
          networkStatus: "Inside OEM network",
          authenticatedBy: "A. Walker",
          authenticatorRole: "OEM component release",
          warrantyImpact: "Factory-fit evidence.",
          recallExposure: "No open campaign exposure.",
          quantity: 1,
        },
      ],
    },
    {
      id: "sys-accessories",
      label: "Accessories and electronics",
      nodeType: "Major system",
      category: "Control, sensing, and convenience",
      status: "Warranty Review",
      tone: "amber",
      anchorRef: "snap_accessories_184201",
      standard: "OEM electronics specification",
      fittedBy: "Mixed repair evidence",
      repairerTier: "Mixed",
      networkStatus: "One component outside approved warranty network",
      authenticatedBy: "Warranty operations",
      authenticatorRole: "OEM reviewer",
      warrantyImpact: "System contains a sensor fitment requiring warranty review.",
      recallExposure: "SC-ADAS-27F applies to affected ADAS serials.",
      quantity: 1,
      children: [
        {
          id: "part-adas-sensor",
          label: "Driver assistance sensor",
          nodeType: "Component",
          category: "ADAS",
          serial: "ADAS-99015-R",
          partNumber: "SENSOR-ADAS-99015",
          status: "Warranty Review",
          tone: "amber",
          anchorRef: "snap_adas_sensor_99015",
          standard: "Aftermarket serial observed",
          fittedBy: "Independent workshop recorded",
          repairerTier: "Outside network",
          networkStatus: "Outside approved warranty network",
          authenticatedBy: "Self-declared repair record",
          authenticatorRole: "Non-network workshop",
          warrantyImpact: "OEM can see this ADAS part was fitted outside the repairer network.",
          recallExposure: "SC-ADAS-27F targets vehicles carrying affected ADAS sensor serials.",
          quantity: 1,
        },
        {
          id: "part-infotainment",
          label: "Infotainment head unit",
          nodeType: "Component",
          category: "Accessory electronics",
          serial: "INFO-77120-D",
          partNumber: "HEADUNIT-INFOTAINMENT-ID7",
          status: "Verified",
          tone: "green",
          anchorRef: "snap_infotainment_77120",
          standard: "OEM standard",
          fittedBy: "OEM plant 04",
          repairerTier: "OEM manufacturing",
          networkStatus: "Inside OEM network",
          authenticatedBy: "N. Okafor",
          authenticatorRole: "OEM component release",
          warrantyImpact: "Factory-fit evidence.",
          recallExposure: "No open campaign exposure.",
          quantity: 1,
        },
      ],
    },
  ],
};

const eventFeed = [
  {
    event: "Assembly node authenticated",
    subject: "Powertrain tree sealed beneath assembly ASM-VEH-WVW184201",
    actor: "OEM plant 04 - A. Walker",
    time: "09:42",
    tone: "cyan" as Tone,
  },
  {
    event: "Part booked off",
    subject: "Driver assistance sensor ADAS-99015-R removed from Accessories and electronics",
    actor: "Northgate OEM Service - M. Kaur",
    time: "10:18",
    tone: "amber" as Tone,
  },
  {
    event: "Warranty impact review",
    subject: "OEM reviewer flagged non-network ADAS fitment inside the component tree",
    actor: "Warranty operations",
    time: "10:31",
    tone: "red" as Tone,
  },
  {
    event: "Recall exposure focused",
    subject: "Safety campaign SC-ADAS-27F resolved to vehicles carrying affected ADAS serials",
    actor: "Recall operations",
    time: "11:04",
    tone: "red" as Tone,
  },
];

const custodyStages = ["OEM Build", "Approved Repair", "Book Off", "Book On", "Warranty Review"];

const repairWorkflowScenarios: WarrantyWorkflow[] = [
  {
    id: "original-part-confirmed",
    title: "Original part confirmed",
    tone: "green",
    assemblyNodeId: "part-adas-sensor",
    currentStatus: "Ready to book replacement",
    summary: "Removed part scan matches the serial sealed into the initial-sale VIN baseline.",
    expectedSerial: "ADAS-99015-R",
    scannedSerial: "ADAS-99015-R",
    replacementSerial: "ADAS-99177-OEM",
    serviceRoute: "Replace component",
    scanDecision: "Original part verified; replacement authorised.",
    finalFitmentLabel: "Replacement on",
    finalFitmentSerial: "ADAS-99177-OEM",
    vehicleStateAfterWork: "Original ADAS-99015-R booked off; replacement ADAS-99177-OEM booked on.",
    partAuthenticity: "Original to this VIN",
    loggedToVinBaseline: true,
    networkFitmentEvidence: "Original factory fit; replacement fitted by OEM repairer.",
    partNumber: "SENSOR-ADAS-99015",
    scanOutcome: "ORIGINAL_MATCH",
    oemPartRecognised: true,
    shipmentTrace: {
      status: "Original factory fit",
      shippedTo: "OEM plant 04",
      repairerTier: "OEM manufacturing",
      networkStatus: "Inside OEM network",
    },
    warrantyImpact: "None",
    recommendedAction:
      "Book the faulty original part off the vehicle, book the authenticated replacement on, and retain repair evidence against the VIN file.",
    steps: [
      {
        label: "Open VIN file",
        detail: "Vehicle file WVWZZZCD7NW184201 is loaded with the sealed initial-sale assembly tree.",
        tone: "cyan",
      },
      {
        label: "Scan removed part",
        detail: "Removed part scan matches expected original serial ADAS-99015-R.",
        tone: "green",
      },
      {
        label: "Book off",
        detail: "Faulty original component is removed from Accessories and electronics / Driver assistance sensor.",
        tone: "cyan",
      },
      {
        label: "Book on",
        detail: "Replacement serial ADAS-99177-OEM is fitted and authenticated by an OEM repairer technician.",
        tone: "green",
      },
    ],
      evidenceLog: [
        "Original component confirmed against initial-sale snapshot.",
        "Faulty component booked off the vehicle assembly.",
        "Replacement component booked on with technician, repairer, and service order evidence.",
      ],
      evidenceAttachments: [
        {
          id: "photo-removed-original",
          evidenceType: "Removed part photo",
          label: "Removed ADAS sensor label",
          fileName: "SO-WTY-184201-044_removed_ADAS-99015-R.jpg",
          capturedAt: "10:42",
          status: "Attached",
          tone: "green",
        },
        {
          id: "photo-replacement-fitted",
          evidenceType: "Fitted part photo",
          label: "Replacement serial on vehicle",
          fileName: "SO-WTY-184201-044_fitted_ADAS-99177-OEM.jpg",
          capturedAt: "10:51",
          status: "Ready to anchor",
          tone: "cyan",
        },
      ],
    },
  {
    id: "original-part-refit",
    title: "Original part re-fitted",
    tone: "cyan",
    assemblyNodeId: "part-adas-sensor",
    currentStatus: "Ready to re-fit original",
    summary: "Removed part scan matches the VIN baseline and the technician decides the original can be re-fitted.",
    expectedSerial: "ADAS-99015-R",
    scannedSerial: "ADAS-99015-R",
    replacementSerial: "ADAS-99015-R",
    serviceRoute: "Re-fit original",
    scanDecision: "Original part verified; no replacement needed.",
    finalFitmentLabel: "Original re-fitted",
    finalFitmentSerial: "ADAS-99015-R",
    vehicleStateAfterWork: "Original ADAS-99015-R is re-fitted to the same assembly node after inspection.",
    partAuthenticity: "Original to this VIN",
    loggedToVinBaseline: true,
    networkFitmentEvidence: "Original factory fit; same serial re-fitted by OEM repairer.",
    partNumber: "SENSOR-ADAS-99015",
    scanOutcome: "ORIGINAL_MATCH",
    oemPartRecognised: true,
    shipmentTrace: {
      status: "Original factory fit",
      shippedTo: "OEM plant 04",
      repairerTier: "OEM manufacturing",
      networkStatus: "Inside OEM network",
    },
    warrantyImpact: "None",
    recommendedAction:
      "Record the removed-part scan, re-fit the same authenticated original component, and close the job with no component substitution.",
    steps: [
      {
        label: "Open VIN file",
        detail: "Vehicle file shows ADAS-99015-R as the sealed original component.",
        tone: "cyan",
      },
      {
        label: "Remove and scan",
        detail: "Technician removes ADAS-99015-R and scan confirms it is the expected original.",
        tone: "green",
      },
      {
        label: "Decide re-fit",
        detail: "Fault is not linked to component substitution, so no replacement part is consumed.",
        tone: "cyan",
      },
      {
        label: "Book original back on",
        detail: "The same serial is re-fitted to the same tree position with technician evidence.",
        tone: "green",
      },
    ],
    evidenceLog: [
      "Original component confirmed against initial-sale snapshot.",
      "No replacement serial consumed for this service order.",
      "Original component re-fitted and retained as the current part on the VIN file.",
    ],
    evidenceAttachments: [
      {
        id: "photo-refit-original",
        evidenceType: "Re-fit photo",
        label: "Original sensor after inspection",
        fileName: "SO-WTY-184201-044_refit_ADAS-99015-R.jpg",
        capturedAt: "10:48",
        status: "Attached",
        tone: "green",
      },
    ],
  },
  {
    id: "mismatch-investigation",
    title: "Mismatch investigation",
    tone: "amber",
    assemblyNodeId: "part-adas-sensor",
    currentStatus: "Warranty review required",
    summary: "Removed part scan does not match the serial sealed into the initial-sale VIN baseline.",
    expectedSerial: "ADAS-99015-R",
    scannedSerial: "ADAS-44200-X",
    replacementSerial: "ADAS-99177-OEM",
    serviceRoute: "Mismatch review",
    scanDecision: "Scanned part is not the original sealed to this VIN.",
    finalFitmentLabel: "Replacement on",
    finalFitmentSerial: "ADAS-99177-OEM",
    vehicleStateAfterWork: "Unexpected ADAS-44200-X booked off; OEM replacement ADAS-99177-OEM booked on for safe return.",
    partAuthenticity: "OEM serial, not logged to this VIN",
    loggedToVinBaseline: false,
    networkFitmentEvidence: "Prior fitment trace points outside the approved warranty network.",
    partNumber: "SENSOR-ADAS-99015",
    scanOutcome: "NOT_LOGGED_TO_VEHICLE",
    oemPartRecognised: true,
    shipmentTrace: {
      status: "OEM serial recognised, but not original to this VIN",
      shippedTo: "West Quay Autocare",
      repairerTier: "Outside network",
      networkStatus: "Outside approved warranty network",
    },
    warrantyImpact: "Warranty risk",
    recommendedAction:
      "Flag mismatch, show OEM part/shipment trace, book the unexpected component off, fit an authenticated replacement, and route the claim to warranty review.",
    steps: [
      {
        label: "Open VIN file",
        detail: "Vehicle file shows ADAS-99015-R as the sealed original component.",
        tone: "cyan",
      },
      {
        label: "Scan removed part",
        detail: "Removed component ADAS-44200-X does not match the original vehicle baseline.",
        tone: "amber",
      },
      {
        label: "Trace part",
        detail: "Serial is recognised as OEM, but shipment trace points to an outside-network workshop.",
        tone: "red",
      },
      {
        label: "Warranty route",
        detail: "Technician can still book the work, but the warranty claim is marked for OEM review.",
        tone: "amber",
      },
    ],
    evidenceLog: [
      "Mismatch recorded against sealed initial-sale snapshot.",
      "Scanned part recognised as an OEM serial.",
      "Shipment trace shows outside-network destination, creating potential warranty invalidation.",
    ],
    evidenceAttachments: [
      {
        id: "photo-mismatch-removed",
        evidenceType: "Mismatch photo",
        label: "Unexpected OEM serial",
        fileName: "SO-WTY-184201-044_removed_ADAS-44200-X.jpg",
        capturedAt: "10:45",
        status: "Warranty review",
        tone: "amber",
      },
      {
        id: "photo-mismatch-replacement",
        evidenceType: "Fitted part photo",
        label: "Authenticated replacement",
        fileName: "SO-WTY-184201-044_fitted_ADAS-99177-OEM.jpg",
        capturedAt: "10:58",
        status: "Attached",
        tone: "green",
      },
    ],
  },
  {
    id: "mismatched-part-returned",
    title: "Unlogged part returned",
    tone: "red",
    assemblyNodeId: "part-adas-sensor",
    currentStatus: "Returned with warranty flag",
    summary:
      "Removed part is not logged to this VIN and cannot be confirmed as genuine, but the technician returns it to the vehicle with evidence.",
    expectedSerial: "ADAS-99015-R",
    scannedSerial: "ADAS-AFT-8831",
    replacementSerial: "ADAS-AFT-8831",
    serviceRoute: "Return scanned part",
    scanDecision: "Part is not the sealed original and OEM authenticity cannot be confirmed.",
    finalFitmentLabel: "Returned to vehicle",
    finalFitmentSerial: "ADAS-AFT-8831",
    vehicleStateAfterWork:
      "Unlogged ADAS-AFT-8831 remains fitted to the vehicle and is recorded as outside the network supply chain.",
    partAuthenticity: "Not genuine / unknown",
    loggedToVinBaseline: false,
    networkFitmentEvidence: "No OEM shipment record and no approved-network fitment evidence.",
    partNumber: "UNVERIFIED-ADAS-SENSOR",
    scanOutcome: "NON_GENUINE",
    oemPartRecognised: false,
    shipmentTrace: {
      status: "No OEM serial match",
      shippedTo: "Not found in OEM shipment ledger",
      repairerTier: "Outside network",
      networkStatus: "Not fitted by network supplier",
    },
    warrantyImpact: "Warranty risk",
    recommendedAction:
      "Allow the technician to return the scanned part if required, but retain a non-genuine or unlogged fitment record against the VIN for warranty review.",
    steps: [
      {
        label: "Open VIN file",
        detail: "Vehicle file shows ADAS-99015-R as the sealed original component.",
        tone: "cyan",
      },
      {
        label: "Remove and scan",
        detail: "Technician scans ADAS-AFT-8831, which is not the expected original serial.",
        tone: "amber",
      },
      {
        label: "Classify identity",
        detail: "No OEM serial record is found, so the part is captured as non-genuine or unknown.",
        tone: "red",
      },
      {
        label: "Return scanned part",
        detail: "Technician re-fits the scanned item, while VINtegrity logs that it was not fitted by a network supplier.",
        tone: "amber",
      },
      {
        label: "Warranty route",
        detail: "Vehicle remains serviceable, but the affected node is marked for warranty impact review.",
        tone: "red",
      },
    ],
    evidenceLog: [
      "Scanned part does not match the sealed initial-sale snapshot.",
      "No OEM serial or approved shipment trace found for the scanned item.",
      "Technician returned the scanned part to the vehicle and the fitment is logged as outside the network supply chain.",
    ],
    evidenceAttachments: [
      {
        id: "photo-unknown-returned",
        evidenceType: "Non-genuine evidence",
        label: "Returned unlogged sensor",
        fileName: "SO-WTY-184201-044_returned_ADAS-AFT-8831.jpg",
        capturedAt: "11:06",
        status: "Warranty flag",
        tone: "red",
      },
    ],
  },
];

const recallExposure = {
  campaignCode: "SC-ADAS-27F",
  title: "ADAS sensor water ingress safety campaign",
  target: "SENSOR-ADAS-99015 / serial prefix ADAS-99",
  focusedVehicles: "27",
  status: "Repair Booked",
  tone: "red" as Tone,
};

const careHistory = [
  "Initial-sale composition sealed as a whole-vehicle tree.",
  "Major systems and sub-assemblies preserve their own serial-level evidence.",
  "Repair work books components off and back on at the same tree position.",
  "Recall exposure resolves from affected parts to vehicles carrying those parts.",
  "Future buyers can see system-level and component-level care history.",
];

function findNodePath(node: AggregationNode, targetId: string, path: string[] = []): string[] | null {
  const nextPath = [...path, node.id];
  if (node.id === targetId) {
    return nextPath;
  }

  for (const child of node.children || []) {
    const childPath = findNodePath(child, targetId, nextPath);
    if (childPath) {
      return childPath;
    }
  }

  return null;
}

function getExpandedIdsForNode(node: AggregationNode, targetId: string) {
  const nodePath = findNodePath(node, targetId);
  const expandedIds = new Set<string>([node.id]);
  nodePath?.slice(0, -1).forEach((id) => expandedIds.add(id));
  return expandedIds;
}

function collectBranchNodeIds(node: AggregationNode) {
  const branchIds = new Set<string>();

  function walk(current: AggregationNode) {
    if (!current.children?.length) {
      return;
    }

    branchIds.add(current.id);
    current.children.forEach(walk);
  }

  walk(node);
  return branchIds;
}

function flattenTree(
  node: AggregationNode,
  depth = 0,
  path: string[] = [],
  expandedNodeIds: Set<string> = new Set<string>(),
  forceExpand = false,
): TreeRow[] {
  const nextPath = [...path, node.label];
  const childCount = node.children?.length || 0;
  const isExpanded = childCount > 0 && (forceExpand || expandedNodeIds.has(node.id));
  const childRows = isExpanded
    ? (node.children || []).flatMap((child) => flattenTree(child, depth + 1, nextPath, expandedNodeIds, forceExpand))
    : [];

  return [
    {
      ...node,
      depth,
      path: nextPath.join(" / "),
      childCount,
      isExpanded,
    },
    ...childRows,
  ];
}

function nodeContainsQuery(node: AggregationNode, query: string) {
  const haystack = [
    node.label,
    node.nodeType,
    node.category,
    node.serial,
    node.partNumber,
    node.status,
    node.standard,
    node.fittedBy,
    node.repairerTier,
    node.networkStatus,
    node.authenticatedBy,
    node.warrantyImpact,
    node.recallExposure,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

function filterTree(node: AggregationNode, query: string): AggregationNode | null {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return node;
  }

  const filteredChildren = (node.children || [])
    .map((child) => filterTree(child, normalized))
    .filter((child): child is AggregationNode => Boolean(child));

  if (nodeContainsQuery(node, normalized) || filteredChildren.length > 0) {
    return {
      ...node,
      children: filteredChildren,
    };
  }

  return null;
}

function countLeafNodes(node: AggregationNode): number {
  if (!node.children?.length) {
    return 1;
  }

  return node.children.reduce((total, child) => total + countLeafNodes(child), 0);
}

function displayValue(value: string | number | undefined) {
  return value === undefined || value === "" ? "Not recorded" : value;
}

function warrantyLabel(value: string) {
  return value.toLowerCase() === "none" ? "Warranty OK" : value;
}

function Wordmark() {
  return (
    <div className="brand-lockup" aria-label="VINtegrity">
      <div className="brand-mark" aria-hidden="true">
        <span className="shield-notch" />
        <span className="scan-line scan-line-one" />
        <span className="scan-line scan-line-two" />
        <span className="plate-line" />
      </div>
      <div className="brand-copy">
        <div className="wordmark">
          <span className="wordmark-vin">VIN</span>
          <span className="wordmark-rest">tegrity</span>
        </div>
        <span className="company-line">AuthLine Auto</span>
      </div>
    </div>
  );
}

function StatusChip({ label, tone }: { label: string; tone: Tone }) {
  return <span className={`status-chip ${tone}`}>{label}</span>;
}

export default function App() {
  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const [aggregationRoot, setAggregationRoot] = useState<AggregationNode>(demoAggregationRoot);
  const [workflowScenarios, setWorkflowScenarios] = useState<WarrantyWorkflow[]>(repairWorkflowScenarios);
  const [error, setError] = useState<string | null>(null);
  const [treeError, setTreeError] = useState<string | null>(null);
  const [workflowError, setWorkflowError] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState(repairWorkflowScenarios[0].assemblyNodeId);
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(() =>
    getExpandedIdsForNode(demoAggregationRoot, repairWorkflowScenarios[0].assemblyNodeId),
  );
  const [directoryQuery, setDirectoryQuery] = useState("");
  const [activeWorkflowId, setActiveWorkflowId] = useState(repairWorkflowScenarios[0].id);
  const [removedPartScan, setRemovedPartScan] = useState("");
  const [fittedPartScan, setFittedPartScan] = useState("");
  const [capturedEvidence, setCapturedEvidence] = useState<EvidenceAttachment[]>([]);
  const [commitStatus, setCommitStatus] = useState("Evidence capture ready");
  const [removedScanStatus, setRemovedScanStatus] = useState("Ready to scan the removed component.");
  const [photoCaptureStatus, setPhotoCaptureStatus] = useState("Open the camera and capture one evidence image at a time.");
  const [fittedScanStatus, setFittedScanStatus] = useState("Ready to scan the component being fitted.");
  const [fitmentActionConfirmed, setFitmentActionConfirmed] = useState(false);
  const [lifecycleCommittedAt, setLifecycleCommittedAt] = useState<string | null>(null);
  const [activeTechnicianStage, setActiveTechnicianStage] = useState<TechnicianStageId>("scan");

  const selectedVehicle = vehicleRecords[0];
  const allRows = useMemo(() => flattenTree(aggregationRoot, 0, [], new Set<string>(), true), [aggregationRoot]);
  const filteredRoot = useMemo(() => filterTree(aggregationRoot, directoryQuery), [aggregationRoot, directoryQuery]);
  const isTreeSearch = directoryQuery.trim().length > 0;
  const visibleRows = useMemo(
    () => (filteredRoot ? flattenTree(filteredRoot, 0, [], expandedNodeIds, isTreeSearch) : []),
    [expandedNodeIds, filteredRoot, isTreeSearch],
  );
  const selectedNode = allRows.find((row) => row.id === selectedNodeId) || allRows[0];
  const leafCount = useMemo(() => countLeafNodes(aggregationRoot), [aggregationRoot]);
  const activeWorkflow =
    workflowScenarios.find((workflow) => workflow.id === activeWorkflowId) || workflowScenarios[0];
  const scanCaptured = removedPartScan.trim().length > 0;
  const fittedSerialCaptured = fittedPartScan.trim().length > 0;
  const removedBaselineMatch =
    removedPartScan.trim().toUpperCase() === activeWorkflow.expectedSerial.trim().toUpperCase();
  const photoEvidenceCaptured = capturedEvidence.length > 0;
  const lifecycleReady = scanCaptured && photoEvidenceCaptured && fitmentActionConfirmed && fittedSerialCaptured;
  const workflowStages: Array<{
    id: TechnicianStageId;
    label: string;
    shortLabel: string;
    title: string;
    detail: string;
    tone: Tone;
    complete: boolean;
  }> = [
    {
      id: "select",
      label: "1. Select component",
      shortLabel: "Select",
      title: selectedNode.label,
      detail: selectedNode.path,
      tone: selectedNode.tone,
      complete: Boolean(selectedNode.id),
    },
    {
      id: "scan",
      label: "2. Scan removed part",
      shortLabel: "Scan",
      title: scanCaptured ? removedPartScan : "Awaiting scan",
      detail: activeWorkflow.scanDecision,
      tone: activeWorkflow.scanOutcome === "ORIGINAL_MATCH" ? "green" as Tone : activeWorkflow.tone,
      complete: scanCaptured,
    },
    {
      id: "photos",
      label: "3. Attach images",
      shortLabel: "Photos",
      title: `${capturedEvidence.length} image record${capturedEvidence.length === 1 ? "" : "s"}`,
      detail: "Capture the removed part, serial label, damage, and final fitted state.",
      tone: photoEvidenceCaptured ? "green" as Tone : "amber" as Tone,
      complete: photoEvidenceCaptured,
    },
    {
      id: "decision",
      label: "4. Choose action",
      shortLabel: "Action",
      title: fitmentActionConfirmed ? activeWorkflow.serviceRoute : "Choose service outcome",
      detail: fitmentActionConfirmed ? activeWorkflow.recommendedAction : "Select whether the removed component is replaced, re-fitted, or returned with a warranty flag.",
      tone: activeWorkflow.tone,
      complete: fitmentActionConfirmed,
    },
    {
      id: "commit",
      label: "5. Book on and commit",
      shortLabel: "Commit",
      title: lifecycleCommittedAt ? "Lifecycle record committed" : fittedSerialCaptured ? fittedPartScan : "Awaiting fitted serial",
      detail: lifecycleCommittedAt
        ? `Repair event committed at ${lifecycleCommittedAt} with ${capturedEvidence.length} image record${capturedEvidence.length === 1 ? "" : "s"}.`
        : `${capturedEvidence.length} image record${capturedEvidence.length === 1 ? "" : "s"} attached. ${activeWorkflow.networkFitmentEvidence}`,
      tone: lifecycleReady || lifecycleCommittedAt ? activeWorkflow.tone : "amber" as Tone,
      complete: Boolean(lifecycleCommittedAt),
    },
  ];
  const activeStageIndex = Math.max(
    0,
    workflowStages.findIndex((stage) => stage.id === activeTechnicianStage),
  );
  const activeStage = workflowStages[activeStageIndex] || workflowStages[0];
  const highestAvailableStageIndex = fitmentActionConfirmed
    ? 4
    : photoEvidenceCaptured
      ? 3
      : scanCaptured
        ? 2
        : 1;
  const canMoveNext =
    activeStageIndex < workflowStages.length - 1 &&
    activeStage.complete &&
    activeStageIndex < highestAvailableStageIndex;
  const nextStage = workflowStages[Math.min(activeStageIndex + 1, workflowStages.length - 1)];
  const nextActionLabel = activeStageIndex === workflowStages.length - 1 ? "Record complete" : `Next: ${nextStage.shortLabel}`;

  function toggleNodeExpanded(nodeId: string) {
    setExpandedNodeIds((current) => {
      const next = new Set(current);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }

  function revealNode(nodeId: string) {
    setSelectedNodeId(nodeId);
    setExpandedNodeIds((current) => new Set([...current, ...getExpandedIdsForNode(aggregationRoot, nodeId)]));
  }

  function selectWorkflow(workflow: WarrantyWorkflow) {
    setActiveWorkflowId(workflow.id);
    revealNode(workflow.assemblyNodeId);
    setFittedPartScan("");
    setFitmentActionConfirmed(true);
    setLifecycleCommittedAt(null);
    setFittedScanStatus("Ready to scan the component being fitted.");
    setCommitStatus(`${workflow.serviceRoute} selected. Scan the fitted serial before committing.`);
  }

  function openTechnicianStage(stageId: TechnicianStageId, stageIndex: number) {
    if (stageIndex <= highestAvailableStageIndex) {
      setActiveTechnicianStage(stageId);
    }
  }

  function handleEvidenceFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      setPhotoCaptureStatus("Camera closed without adding an image.");
      return;
    }

    const nextAttachments = files.map((file, index) => ({
      id: `local-${file.name}-${file.lastModified}-${index}`,
      evidenceType: "Camera image",
      label: file.name.replace(/\.[^.]+$/, ""),
      fileName: file.name,
      capturedAt: "Just now",
      status: "Pending commit",
      tone: "cyan" as Tone,
      previewUrl: URL.createObjectURL(file),
    }));

    setCapturedEvidence((current) => [...current, ...nextAttachments]);
    setLifecycleCommittedAt(null);
    setPhotoCaptureStatus(
      `${files.length} image${files.length === 1 ? "" : "s"} captured from camera. Repeat capture for extra angles.`,
    );
    event.currentTarget.value = "";
  }

  function captureTime() {
    return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }

  function scanRemovedPart() {
    const serial = activeWorkflow.scannedSerial;
    const baselineMatch = serial.trim().toUpperCase() === activeWorkflow.expectedSerial.trim().toUpperCase();
    setRemovedPartScan(serial);
    setFitmentActionConfirmed(false);
    setFittedPartScan("");
    setLifecycleCommittedAt(null);
    setRemovedScanStatus(
      baselineMatch
        ? `Captured ${serial} at ${captureTime()}. Matches the VIN baseline.`
        : `Captured ${serial} at ${captureTime()}. Does not match the VIN baseline; retain evidence for warranty review.`,
    );
    setCommitStatus("Removed component captured. Capture photo evidence, then choose whether to refit or replace.");
  }

  function scanFittedPart() {
    const serial = activeWorkflow.finalFitmentSerial;
    setFittedPartScan(serial);
    setLifecycleCommittedAt(null);
    setFittedScanStatus(`Captured ${serial} at ${captureTime()}. Ready to book on against this VIN.`);
    setCommitStatus("Fitted component captured. Commit the lifecycle record when the evidence set is complete.");
  }

  function commitLifecycleRecord() {
    if (!lifecycleReady) {
      setCommitStatus("Scan removed part, attach image evidence, choose the action, and scan the fitted serial before commit.");
      return;
    }

    const committedAt = captureTime();
    setLifecycleCommittedAt(committedAt);
    setCommitStatus(
      `Committed at ${committedAt}: ${removedPartScan} booked off, ${fittedPartScan} booked on, ${capturedEvidence.length} image record${capturedEvidence.length === 1 ? "" : "s"} attached.`,
    );
  }

  function moveTechnicianStage(direction: 1 | -1) {
    const nextIndex = Math.min(Math.max(activeStageIndex + direction, 0), workflowStages.length - 1);
    setActiveTechnicianStage(workflowStages[nextIndex].id);
  }

  useEffect(() => {
    fetch(`${apiBase}/meta`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then(setMeta)
      .catch((err: Error) => setError(err.message));

    fetch(`${apiBase}/assemblies/demo/tree`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then((payload: { root: AggregationNode }) => {
        setAggregationRoot(payload.root);
        setExpandedNodeIds(getExpandedIdsForNode(payload.root, selectedNodeId));
      })
      .catch((err: Error) => setTreeError(err.message));

    fetch(`${apiBase}/warranty-workflows/demo`)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then((payload: { workflows: WarrantyWorkflow[] }) => {
        setWorkflowScenarios(payload.workflows);
        const nextActiveWorkflow = payload.workflows.find((workflow) => workflow.id === activeWorkflowId) || payload.workflows[0];
        if (nextActiveWorkflow) {
          setRemovedPartScan("");
          setFittedPartScan("");
          setCapturedEvidence([]);
          setFitmentActionConfirmed(false);
          setLifecycleCommittedAt(null);
        }
      })
      .catch((err: Error) => setWorkflowError(err.message));
  }, []);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Wordmark />
        <nav className="nav-list" aria-label="Primary navigation">
          {navigation.map((item) => (
            <a
              key={item.target}
              className={item.target === "vin-file" ? "nav-item active" : "nav-item"}
              href={`#${item.target}`}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="system-card">
          <p className="meta-label">{meta?.company.name || "AuthLine Auto"}</p>
          <strong>OEM warranty evidence</strong>
          <span>{meta?.company.parentCompany || "AuthLine"} automotive industry arm</span>
          <span>{meta?.status || "Bootstrapping"} aggregation and authentication stack</span>
        </div>
      </aside>

      <main className="dashboard">
        <header className="topbar" id="vin-file">
          <div>
            <p className="meta-label">AuthLine Auto - current VIN file</p>
            <h1>Warranty Repair Workspace</h1>
            <p className="subtitle">
              Open the VIN, locate the faulty component in the assembly tree, scan the removed part, book it off the
              car, then book the replacement on with technician, repairer, shipment trace, and warranty evidence.
            </p>
          </div>
          <div className="header-actions" aria-label="Verification summary">
            <div className="signal">
              <span className="signal-dot" />
              VIN file active
            </div>
            <button type="button" className="primary-action">
              Start Scan
            </button>
          </div>
        </header>

        <section className="brand-strip" aria-label="Product positioning">
          <div>
            <p className="meta-label">Positioning</p>
            <strong>
              VINtegrity by AuthLine Auto: a searchable aggregation record from the whole vehicle down to individual
              parts.
            </strong>
          </div>
          <div className="vin-plate" aria-label="VIN sample">
            {selectedVehicle.vin}
          </div>
        </section>

        <section className="vin-context-grid" aria-label="Current VIN file summary">
          <article>
            <p className="meta-label">Vehicle</p>
            <strong>{selectedVehicle.model}</strong>
            <span>{selectedVehicle.warranty}</span>
          </article>
          <article>
            <p className="meta-label">Service order</p>
            <strong>SO-WTY-184201-044</strong>
            <span>ADAS calibration fault</span>
          </article>
          <article>
            <p className="meta-label">Technician</p>
            <strong>M. Kaur</strong>
            <span>{selectedVehicle.repairer} / {selectedVehicle.repairerTier}</span>
          </article>
          <article>
            <p className="meta-label">Workflow status</p>
            <strong>{activeWorkflow.currentStatus}</strong>
            <span>{activeWorkflow.title}</span>
          </article>
        </section>

        <section className="metric-grid" aria-label="Platform metrics">
          {metrics.map((metric) => (
            <article className="metric-card" key={metric.label}>
              <div className="metric-head">
                <p className="meta-label">{metric.label}</p>
                <span className={`metric-pulse ${metric.tone}`} />
              </div>
              <strong>{metric.value}</strong>
              <span>{metric.delta}</span>
            </article>
          ))}
        </section>

        <section className="workspace-grid">
          <article className="panel aggregation-panel" id="assembly-directory">
            <div className="panel-header">
              <div>
                <p className="meta-label">Vehicle Aggregation</p>
                <h2>Searchable assembly directory</h2>
              </div>
              <StatusChip label={selectedVehicle.status} tone={selectedVehicle.tone} />
            </div>

            <div className="directory-layout">
              <div className="directory-browser">
                <div className="directory-toolbar">
                  <label className="directory-search">
                    <span className="meta-label">Search tree</span>
                    <input
                      value={directoryQuery}
                      onChange={(event) => setDirectoryQuery(event.target.value)}
                      placeholder="Engine, gearbox, ADAS, serial, recall..."
                    />
                  </label>
                  <div className="directory-counts">
                    <strong>{visibleRows.length}</strong>
                    <span>of {allRows.length} nodes</span>
                  </div>
                  <div className="directory-actions" aria-label="Tree display controls">
                    <button
                      type="button"
                      onClick={() => setExpandedNodeIds(new Set([aggregationRoot.id]))}
                      disabled={isTreeSearch}
                    >
                      Collapse
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedNodeIds(collectBranchNodeIds(aggregationRoot))}
                      disabled={isTreeSearch}
                    >
                      Expand all
                    </button>
                  </div>
                </div>

                <div className="tree-list" role="tree" aria-label={`${selectedVehicle.vin} assembly directory`}>
                  {visibleRows.map((row) => (
                    <div
                      key={row.id}
                      className={`tree-row ${row.id === selectedNode.id ? "selected" : ""}`}
                      role="treeitem"
                      aria-level={row.depth + 1}
                      aria-expanded={row.childCount > 0 ? row.isExpanded : undefined}
                      style={{ paddingLeft: `${12 + row.depth * 18}px` }}
                    >
                      {row.childCount > 0 ? (
                        <button
                          type="button"
                          className="tree-toggle"
                          aria-label={`${row.isExpanded ? "Collapse" : "Expand"} ${row.label}`}
                          onClick={() => toggleNodeExpanded(row.id)}
                        >
                        {row.isExpanded ? "-" : "+"}
                      </button>
                    ) : (
                        <span className="tree-toggle-placeholder" aria-hidden="true">.</span>
                      )}
                      <button type="button" className="tree-select" onClick={() => revealNode(row.id)}>
                        <div className="tree-node-copy">
                          <strong>{row.label}</strong>
                          <span>{row.nodeType} / {row.category}</span>
                        </div>
                        <span className="tree-serial">{displayValue(row.serial || row.partNumber)}</span>
                        <StatusChip label={row.status} tone={row.tone} />
                      </button>
                    </div>
                  ))}
                  {visibleRows.length === 0 && <p className="empty-state">No matching assembly nodes.</p>}
                </div>
              </div>

              <div className="component-inspector">
                <div>
                  <p className="meta-label">Selected Vehicle</p>
                  <strong className="inspector-title">{selectedVehicle.model}</strong>
                  <span className="inspector-muted">{selectedVehicle.vin}</span>
                  <span className="inspector-muted">{selectedVehicle.warranty}</span>
                </div>

                <div className="directory-summary">
                  <div>
                    <span>Nodes</span>
                    <strong>{allRows.length}</strong>
                  </div>
                  <div>
                    <span>Leaf parts</span>
                    <strong>{leafCount}</strong>
                  </div>
                  <div>
                    <span>Depth</span>
                    <strong>{Math.max(...allRows.map((row) => row.depth)) + 1}</strong>
                  </div>
                </div>

                <div className="component-card">
                  <div className="component-card-head">
                    <div>
                      <p className="meta-label">Selected Node</p>
                      <strong>{selectedNode.label}</strong>
                    </div>
                    <StatusChip label={selectedNode.status} tone={selectedNode.tone} />
                  </div>
                  <dl className="component-meta">
                    <div>
                      <dt>Directory path</dt>
                      <dd>{selectedNode.path}</dd>
                    </div>
                    <div>
                      <dt>Node type</dt>
                      <dd>{selectedNode.nodeType}</dd>
                    </div>
                    <div>
                      <dt>Category</dt>
                      <dd>{selectedNode.category}</dd>
                    </div>
                    <div>
                      <dt>Quantity</dt>
                      <dd>{selectedNode.quantity}</dd>
                    </div>
                    <div>
                      <dt>Serial number</dt>
                      <dd>{displayValue(selectedNode.serial)}</dd>
                    </div>
                    <div>
                      <dt>Part number</dt>
                      <dd>{displayValue(selectedNode.partNumber)}</dd>
                    </div>
                    <div>
                      <dt>OEM standard</dt>
                      <dd>{selectedNode.standard}</dd>
                    </div>
                    <div>
                      <dt>Fitted by</dt>
                      <dd>{selectedNode.fittedBy}</dd>
                    </div>
                    <div>
                      <dt>Repairer tier</dt>
                      <dd>{selectedNode.repairerTier}</dd>
                    </div>
                    <div>
                      <dt>Network status</dt>
                      <dd>{selectedNode.networkStatus}</dd>
                    </div>
                    <div>
                      <dt>Authenticated by</dt>
                      <dd>{selectedNode.authenticatedBy}</dd>
                    </div>
                    <div>
                      <dt>User role</dt>
                      <dd>{selectedNode.authenticatorRole}</dd>
                    </div>
                    <div>
                      <dt>Warranty impact</dt>
                      <dd>{selectedNode.warrantyImpact}</dd>
                    </div>
                    <div>
                      <dt>Recall exposure</dt>
                      <dd>{selectedNode.recallExposure}</dd>
                    </div>
                    <div>
                      <dt>Snapshot ref</dt>
                      <dd>{selectedNode.anchorRef}</dd>
                    </div>
                  </dl>
                </div>
                {treeError && <p className="error">Backend directory unavailable: {treeError}</p>}
              </div>
            </div>
          </article>

          <article className="panel repair-panel" id="repair-workflow">
            <div className="panel-header">
              <div>
                <p className="meta-label">Technician workflow</p>
                <h2>Book parts off and back on</h2>
              </div>
              <StatusChip label={activeWorkflow.currentStatus} tone={activeWorkflow.tone} />
            </div>
            <div className="workflow-layout">
              <div className="workflow-stage-rail" aria-label="Technician workflow stages">
                {workflowStages.map((stage, index) => {
                  const stageLocked = index > highestAvailableStageIndex;
                  const stageState = stageLocked ? "Locked" : stage.complete ? "Done" : index === activeStageIndex ? "Now" : "Ready";

                  return (
                    <button
                      type="button"
                      className={`stage-tab ${stage.id === activeStage.id ? "active" : ""} ${stage.complete ? "complete" : ""} ${stageLocked ? "locked" : ""}`}
                      key={stage.id}
                      onClick={() => openTechnicianStage(stage.id, index)}
                      disabled={stageLocked}
                    >
                      <span>{stage.shortLabel}</span>
                      <strong>{stageState}</strong>
                    </button>
                  );
                })}
              </div>

              <div className="active-stage-card">
                <div className="active-stage-header">
                  <div>
                    <p className="meta-label">{activeStage.label}</p>
                    <h3>{activeStage.title}</h3>
                    <span>{activeStage.detail}</span>
                  </div>
                  <StatusChip label={activeStage.complete ? "Complete" : "Needs action"} tone={activeStage.tone} />
                </div>

                {activeTechnicianStage === "select" && (
                  <div className="stage-focus-grid">
                    <div className="focus-summary">
                      <p className="meta-label">Current component</p>
                      <strong>{selectedNode.label}</strong>
                      <span>{selectedNode.path}</span>
                    </div>
                    <div className="focus-summary">
                      <p className="meta-label">Expected serial</p>
                      <strong>{activeWorkflow.expectedSerial}</strong>
                      <span>{activeWorkflow.partNumber}</span>
                    </div>
                    <a className="stage-link-action" href="#assembly-directory">
                      Change component
                    </a>
                  </div>
                )}

                {activeTechnicianStage === "scan" && (
                  <div className="single-task-grid">
                    <label className="scan-input primary-scan-input">
                      <span>Removed part serial</span>
                      <input
                        value={removedPartScan}
                        onChange={(event) => {
                          const nextSerial = event.target.value;
                          setRemovedPartScan(nextSerial);
                          setFitmentActionConfirmed(false);
                          setFittedPartScan("");
                          setLifecycleCommittedAt(null);
                          setRemovedScanStatus(
                            nextSerial.trim()
                              ? `Manual serial entry captured for ${nextSerial.trim()}.`
                              : "Ready to scan the removed component.",
                          );
                        }}
                        placeholder="Scan or type removed serial"
                      />
                    </label>
                    <div className="capture-actions">
                      <button type="button" className="large-action" onClick={scanRemovedPart}>
                        Scan removed part
                      </button>
                      <StatusChip
                        label={removedBaselineMatch ? "Baseline match" : "Review scan"}
                        tone={removedBaselineMatch ? "green" : activeWorkflow.tone}
                      />
                    </div>
                    <p className={`capture-status ${scanCaptured ? "ready" : ""}`}>{removedScanStatus}</p>
                    <div className="focus-summary">
                      <p className="meta-label">Expected from VIN baseline</p>
                      <strong>{activeWorkflow.expectedSerial}</strong>
                      <span>{activeWorkflow.scanDecision}</span>
                    </div>
                  </div>
                )}

                {activeTechnicianStage === "photos" && (
                  <div className="photo-stage-layout">
                    <label className="upload-target primary-upload-target">
                      <input type="file" accept="image/*" capture="environment" onChange={handleEvidenceFiles} />
                      <span>Open camera</span>
                      <small>Capture removed part, serial label, damage, and fitted state. Repeat for extra images.</small>
                    </label>
                    <p className={`capture-status ${capturedEvidence.length > 0 ? "ready" : ""}`}>
                      {photoCaptureStatus}
                    </p>
                    <div className="attachment-grid tablet-attachment-grid">
                      {capturedEvidence.length === 0 ? (
                        <div className="attachment-empty">
                          No image evidence captured yet.
                        </div>
                      ) : (
                        capturedEvidence.map((attachment) => (
                          <article className="attachment-card" key={attachment.id}>
                            {attachment.previewUrl ? (
                              <img src={attachment.previewUrl} alt={attachment.label} />
                            ) : (
                              <div className="attachment-preview" aria-hidden="true">IMG</div>
                            )}
                            <div>
                              <strong>{attachment.label}</strong>
                              <span>{attachment.fileName}</span>
                              <em>{attachment.evidenceType} / {attachment.capturedAt}</em>
                            </div>
                            <StatusChip label={attachment.status} tone={attachment.tone} />
                          </article>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeTechnicianStage === "decision" && (
                  <div className="route-choice-grid" aria-label="Choose fitment action">
                    {workflowScenarios.map((workflow) => {
                      const selectedAction = fitmentActionConfirmed && workflow.id === activeWorkflow.id;

                      return (
                        <button
                          type="button"
                          key={workflow.id}
                          className={`workflow-card ${selectedAction ? "selected" : ""}`}
                          aria-pressed={selectedAction}
                          onClick={() => selectWorkflow(workflow)}
                        >
                          <span className={`event-dot ${workflow.tone}`} />
                          <div>
                            <strong>{workflow.serviceRoute}</strong>
                            <span>{workflow.title}</span>
                            <div className="workflow-card-meta">
                              <StatusChip
                                label={selectedAction ? "Selected action" : workflow.currentStatus}
                                tone={workflow.tone}
                              />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {activeTechnicianStage === "commit" && (
                  <div className="commit-stage-layout">
                    <label className="scan-input primary-scan-input">
                      <span>Fitted serial</span>
                      <input
                        value={fittedPartScan}
                        onChange={(event) => {
                          const nextSerial = event.target.value;
                          setFittedPartScan(nextSerial);
                          setLifecycleCommittedAt(null);
                          setFittedScanStatus(
                            nextSerial.trim()
                              ? `Manual fitted serial entry captured for ${nextSerial.trim()}.`
                              : "Ready to scan the component being fitted.",
                          );
                        }}
                        placeholder="Scan or type fitted serial"
                      />
                    </label>
                    <div className="fitment-flow compact-fitment-flow" aria-label="Book off and book on sequence">
                      <div className="fitment-step">
                        <p className="meta-label">Book off</p>
                        <strong>{removedPartScan || "Awaiting scan"}</strong>
                        <span>{selectedNode.label}</span>
                      </div>
                      <div className="fitment-arrow" aria-hidden="true">-&gt;</div>
                      <div className="fitment-step emphasis">
                        <p className="meta-label">{activeWorkflow.finalFitmentLabel}</p>
                        <strong>{fittedPartScan || "Awaiting fitted serial"}</strong>
                        <span>{activeWorkflow.serviceRoute}</span>
                      </div>
                    </div>
                    <div className="capture-actions">
                      <button type="button" onClick={scanFittedPart}>
                        Scan fitted serial
                      </button>
                      <button
                        type="button"
                        className="commit-button large-action"
                        onClick={commitLifecycleRecord}
                        disabled={!lifecycleReady}
                      >
                        Commit lifecycle record
                      </button>
                    </div>
                    <p className={`capture-status ${fittedSerialCaptured ? "ready" : ""}`}>{fittedScanStatus}</p>
                    <p className={`commit-status ${lifecycleReady || lifecycleCommittedAt ? "ready" : ""}`}>{commitStatus}</p>
                    <div className={`lifecycle-record-card ${lifecycleCommittedAt ? "committed" : ""}`}>
                      <div className="lifecycle-record-header">
                        <div>
                          <p className="meta-label">{lifecycleCommittedAt ? "Committed record" : "Draft lifecycle record"}</p>
                          <strong>SO-WTY-184201-044 / {selectedVehicle.vin}</strong>
                        </div>
                        <StatusChip
                          label={lifecycleCommittedAt ? "Committed" : lifecycleReady ? "Ready to commit" : "Draft"}
                          tone={lifecycleCommittedAt ? "green" : lifecycleReady ? activeWorkflow.tone : "amber"}
                        />
                      </div>
                      <div className="lifecycle-record-grid">
                        <div>
                          <span>Component</span>
                          <strong>{selectedNode.label}</strong>
                        </div>
                        <div>
                          <span>Book off</span>
                          <strong>{removedPartScan || "Awaiting removed scan"}</strong>
                        </div>
                        <div>
                          <span>Book on</span>
                          <strong>{fittedPartScan || "Awaiting fitted scan"}</strong>
                        </div>
                        <div>
                          <span>Outcome</span>
                          <strong>{fitmentActionConfirmed ? activeWorkflow.serviceRoute : "Action not chosen"}</strong>
                        </div>
                        <div>
                          <span>Authenticity</span>
                          <strong>{activeWorkflow.partAuthenticity}</strong>
                        </div>
                        <div>
                          <span>Evidence</span>
                          <strong>{capturedEvidence.length} image record{capturedEvidence.length === 1 ? "" : "s"}</strong>
                        </div>
                        <div>
                          <span>Repairer</span>
                          <strong>{selectedVehicle.repairerTier}</strong>
                        </div>
                        <div>
                          <span>Warranty route</span>
                          <strong>{activeWorkflow.warrantyImpact}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="stage-footer">
                  <button type="button" onClick={() => moveTechnicianStage(-1)} disabled={activeStageIndex === 0}>
                    Back
                  </button>
                  <p className="stage-footer-note">
                    {activeStageIndex === workflowStages.length - 1
                      ? lifecycleCommittedAt
                        ? "Lifecycle record is committed to the VIN history."
                        : "Commit the lifecycle record to close this repair event."
                      : activeStage.complete
                        ? "Ready for the next step."
                        : "Complete this step to continue."}
                  </p>
                  <button
                    type="button"
                    className="commit-button"
                    onClick={() => moveTechnicianStage(1)}
                    disabled={!canMoveNext}
                  >
                    {nextActionLabel}
                  </button>
                </div>
              </div>
            </div>
            {workflowError && <p className="error">Backend workflow unavailable: {workflowError}</p>}
          </article>

          <article className="panel verify-panel" id="scan-verify">
            <div className="panel-header">
              <div>
                <p className="meta-label">Scan and verify</p>
                <h2>Removed-part scan evidence</h2>
              </div>
              <StatusChip label={activeWorkflow.scanOutcome.replace(/_/g, " ")} tone={activeWorkflow.tone} />
            </div>
            <div className="scan-box" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="scan-comparison">
              <div>
                <span>Expected original</span>
                <strong>{activeWorkflow.expectedSerial}</strong>
              </div>
              <div>
                <span>Scanned removed part</span>
                <strong>{removedPartScan || "Awaiting scan"}</strong>
              </div>
            </div>
            <dl className="scan-meta">
              <div>
                <dt>Part number</dt>
                <dd>{activeWorkflow.partNumber}</dd>
              </div>
              <div>
                <dt>OEM recognised</dt>
                <dd>{activeWorkflow.oemPartRecognised ? "Yes" : "No"}</dd>
              </div>
              <div>
                <dt>VIN baseline</dt>
                <dd>{activeWorkflow.loggedToVinBaseline ? "Logged to this VIN" : "Not logged to this VIN"}</dd>
              </div>
              <div>
                <dt>Authenticity</dt>
                <dd>{activeWorkflow.partAuthenticity}</dd>
              </div>
              <div>
                <dt>Shipment destination</dt>
                <dd>{activeWorkflow.shipmentTrace.shippedTo}</dd>
              </div>
              <div>
                <dt>Network status</dt>
                <dd>{activeWorkflow.shipmentTrace.networkStatus}</dd>
              </div>
              <div>
                <dt>Fitment evidence</dt>
                <dd>{activeWorkflow.networkFitmentEvidence}</dd>
              </div>
            </dl>
            <div className="scan-decision-grid">
              <div>
                <span>Scan decision</span>
                <strong>{activeWorkflow.scanDecision}</strong>
              </div>
              <div>
                <span>Final vehicle state</span>
                <strong>{activeWorkflow.vehicleStateAfterWork}</strong>
              </div>
            </div>
            <p className="panel-copy">
              {activeWorkflow.summary}
            </p>
          </article>

          <article className="panel recall-panel" id="targeted-recalls">
            <div className="panel-header">
              <div>
                <p className="meta-label">Targeted recall</p>
                <h2>Component-to-vehicle exposure</h2>
              </div>
              <StatusChip label="Recall Targeted" tone={recallExposure.tone} />
            </div>
            <div className="recall-grid">
              <div>
                <span>Campaign</span>
                <strong>{recallExposure.campaignCode}</strong>
              </div>
              <div>
                <span>Focused VINs</span>
                <strong>{recallExposure.focusedVehicles}</strong>
              </div>
            </div>
            <p className="panel-copy">
              {recallExposure.title} targets {recallExposure.target}. VINtegrity focuses the campaign on vehicles whose
              current assembly tree shows the affected component is attached.
            </p>
          </article>

          <article className="panel care-panel" id="care-history">
            <div className="panel-header">
              <div>
                <p className="meta-label">Care history</p>
                <h2>Buyer confidence evidence</h2>
              </div>
              <StatusChip label="Recall Cleared" tone="green" />
            </div>
            <ol className="care-list">
              {careHistory.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </article>

          <article className="panel status-panel" id="warranty-review">
            <div className="panel-header">
              <div>
                <p className="meta-label">Warranty review</p>
                <h2>Evidence states and outcomes</h2>
              </div>
            </div>
            <div className="chip-cloud">
              {statusChips.map((chip) => (
                <StatusChip key={chip.label} label={chip.label} tone={chip.tone} />
              ))}
            </div>
          </article>

          <article className="panel custody-panel">
            <div className="panel-header">
              <div>
                <p className="meta-label">Network path</p>
                <h2>Repairer tier chain</h2>
              </div>
              <StatusChip label="Approved Repairer" tone="green" />
            </div>
            <div className="custody-track">
              {custodyStages.map((stage, index) => (
                <div className="custody-stage" key={stage}>
                  <span>{index + 1}</span>
                  <strong>{stage}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="panel activity-panel" id="audit-trail">
            <div className="panel-header">
              <div>
                <p className="meta-label">Audit Trail</p>
                <h2>Authentication and repair events</h2>
              </div>
              <StatusChip label="Warranty Review" tone="amber" />
            </div>
            <div className="event-feed">
              {eventFeed.map((event) => (
                <div className="event-row" key={`${event.event}-${event.time}`}>
                  <span className={`event-dot ${event.tone}`} />
                  <div>
                    <strong>{event.event}</strong>
                    <span>{event.subject}</span>
                    <em>{event.actor}</em>
                  </div>
                  <time>{event.time}</time>
                </div>
              ))}
            </div>
            {error && <p className="error">Backend metadata unavailable: {error}</p>}
          </article>
        </section>
      </main>
    </div>
  );
}
