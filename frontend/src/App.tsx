import { useEffect, useState } from "react";

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

type TwinComponent = {
  id: string;
  label: string;
  role: string;
  serial: string;
  partNumber: string;
  fitment: string;
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
  x: number;
  y: number;
};

const apiBase = import.meta.env.VITE_API_BASE || "/api/v1";

const navigation = [
  "Dashboard",
  "Vehicles",
  "Components",
  "Assemblies",
  "Repairer Network",
  "Authenticated Repairs",
  "Warranty Reviews",
  "Targeted Recalls",
  "Care History",
  "Verify Fitment",
  "Audit Trail",
  "System Settings",
  "Users",
];

const metrics: Array<{ label: string; value: string; delta: string; tone: Tone }> = [
  { label: "Warranty Vehicles", value: "18,420", delta: "+6.4% 30d", tone: "cyan" },
  { label: "Authenticated Parts", value: "241,908", delta: "99.2% verified", tone: "green" },
  { label: "Open Repair Events", value: "184", delta: "42 awaiting auth", tone: "amber" },
  { label: "Outside-network Fits", value: "2,961", delta: "warranty signal", tone: "steel" },
  { label: "Booked Part Changes", value: "8,742", delta: "off/on evidenced", tone: "cyan" },
  { label: "Focused Recall VINs", value: "27", delta: "8 critical", tone: "red" },
  { label: "OEM Repairers", value: "312", delta: "14 markets", tone: "green" },
  { label: "Care History Score", value: "96.4%", delta: "buyer-visible proof", tone: "green" },
];

const statusChips: Array<{ label: string; tone: Tone }> = [
  { label: "OEM Authenticated", tone: "green" },
  { label: "Factory Fit", tone: "cyan" },
  { label: "Approved Repairer", tone: "green" },
  { label: "Tier 2 Repairer", tone: "cyan" },
  { label: "Outside Network", tone: "steel" },
  { label: "Authentication Pending", tone: "amber" },
  { label: "Warranty Review", tone: "amber" },
  { label: "Repair Booked", tone: "cyan" },
  { label: "Owner Fitment Logged", tone: "steel" },
  { label: "Evidence Missing", tone: "red" },
  { label: "Part Replaced", tone: "steel" },
  { label: "Recall Targeted", tone: "red" },
  { label: "Recall Affected", tone: "red" },
  { label: "Recall Cleared", tone: "green" },
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

const twinComponents: TwinComponent[] = [
  {
    id: "vin-plate",
    label: "VIN Plate",
    role: "Vehicle identity",
    serial: "VIN-WVWZZZCD7NW184201",
    partNumber: "VEHICLE-IDENTITY-PLATE",
    fitment: "Factory fit",
    status: "Verified",
    tone: "green",
    anchorRef: "snap_vehicle_identity_184201",
    standard: "OEM standard",
    fittedBy: "OEM plant 04",
    repairerTier: "OEM manufacturing",
    networkStatus: "Inside OEM network",
    authenticatedBy: "H. Richter",
    authenticatorRole: "OEM release authority",
    warrantyImpact: "No repair-network exception. Vehicle identity is OEM-authenticated.",
    recallExposure: "No open campaign exposure.",
    x: 50,
    y: 34,
  },
  {
    id: "battery",
    label: "Battery Module",
    role: "Energy system",
    serial: "BAT-10291-K",
    partNumber: "BATTERY-MODULE-10291",
    fitment: "Factory fit",
    status: "Verified",
    tone: "green",
    anchorRef: "snap_battery_module_10291",
    standard: "OEM standard",
    fittedBy: "OEM plant 04",
    repairerTier: "OEM manufacturing",
    networkStatus: "Inside OEM network",
    authenticatedBy: "A. Walker",
    authenticatorRole: "OEM component release",
    warrantyImpact: "Factory-fit evidence supports normal OEM warranty assessment.",
    recallExposure: "No open campaign exposure.",
    x: 50,
    y: 64,
  },
  {
    id: "drive-unit",
    label: "Front Drive Unit",
    role: "Propulsion",
    serial: "MTR-44721-A",
    partNumber: "MOTOR-AXL-44721",
    fitment: "Approved fitment",
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
    x: 24,
    y: 56,
  },
  {
    id: "adas",
    label: "ADAS Sensor",
    role: "Driver assistance",
    serial: "ADAS-99015-R",
    partNumber: "SENSOR-ADAS-99015",
    fitment: "Inspection required",
    status: "Warranty Review",
    tone: "amber",
    anchorRef: "snap_adas_sensor_99015",
    standard: "Aftermarket serial observed",
    fittedBy: "Independent workshop recorded",
    repairerTier: "Outside network",
    networkStatus: "Outside approved warranty network",
    authenticatedBy: "Self-declared repair record",
    authenticatorRole: "Non-network workshop",
    warrantyImpact: "OEM can see the ADAS part was fitted outside the repairer network before deciding warranty impact.",
    recallExposure: "SC-ADAS-27F targets vehicles carrying affected ADAS sensor serials.",
    x: 77,
    y: 42,
  },
  {
    id: "ecu",
    label: "Vehicle ECU",
    role: "Control system",
    serial: "ECU-38114-C",
    partNumber: "CONTROL-ECU-38114",
    fitment: "Factory fit",
    status: "Verified",
    tone: "green",
    anchorRef: "snap_ecu_38114",
    standard: "OEM standard",
    fittedBy: "OEM plant 04",
    repairerTier: "OEM manufacturing",
    networkStatus: "Inside OEM network",
    authenticatedBy: "N. Okafor",
    authenticatorRole: "OEM component release",
    warrantyImpact: "Control module evidence supports warranty diagnostics.",
    recallExposure: "No open campaign exposure.",
    x: 67,
    y: 60,
  },
];

const eventFeed = [
  {
    event: "Authenticate component",
    subject: "Battery module BAT-10291-K authenticated into assembly ASM-VEH-WVW184201",
    actor: "OEM plant 04 · A. Walker",
    time: "09:42",
    tone: "cyan" as Tone,
  },
  {
    event: "Outside-network fitment logged",
    subject: "Driver assistance sensor replacement linked to warranty review",
    actor: "West Quay Autocare",
    time: "10:18",
    tone: "amber" as Tone,
  },
  {
    event: "Warranty impact review",
    subject: "OEM reviewer flagged non-network ADAS fitment before claim decision",
    actor: "Warranty operations",
    time: "10:31",
    tone: "red" as Tone,
  },
  {
    event: "Tier 2 repair authenticated",
    subject: "Body control module replacement authenticated by certified repairer",
    actor: "Metro Fleet Service · J. Patel",
    time: "10:47",
    tone: "steel" as Tone,
  },
  {
    event: "Recall exposure focused",
    subject: "Safety campaign SC-ADAS-27F resolved to vehicles carrying affected ADAS serials",
    actor: "Recall operations",
    time: "11:04",
    tone: "red" as Tone,
  },
];

const custodyStages = [
  "OEM Build",
  "OEM Repairer",
  "Tier 2 Repairer",
  "Outside Network",
  "Warranty Review",
];

const repairLifecycle = [
  {
    action: "Verify present",
    detail: "ADAS-99015-R confirmed against the initial-sale vehicle snapshot.",
    actor: "M. Kaur · OEM repairer",
    tone: "green" as Tone,
  },
  {
    action: "Book off",
    detail: "Faulting ADAS sensor removed from assembly ASM-VEH-WVW184201.",
    actor: "Service order SO-WTY-184201-044",
    tone: "cyan" as Tone,
  },
  {
    action: "Book on",
    detail: "Replacement ADAS-99177-X fitted, but source evidence is outside the OEM network.",
    actor: "Warranty review required",
    tone: "amber" as Tone,
  },
];

const recallExposure = {
  campaignCode: "SC-ADAS-27F",
  title: "ADAS sensor water ingress safety campaign",
  target: "SENSOR-ADAS-99015 · serial prefix ADAS-99",
  focusedVehicles: "27",
  status: "Repair Booked",
  tone: "red" as Tone,
};

const careHistory = [
  "Initial-sale composition sealed for the vehicle.",
  "Warranty repair opened against a service order and claim reference.",
  "Part removed from the car is booked off by a named repairer user.",
  "Replacement fitted to the car is booked on with serial-level evidence.",
  "Recall exposure clears only when the affected component is removed and replacement evidence is authenticated.",
];

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
  const [error, setError] = useState<string | null>(null);
  const [selectedVehicleVin, setSelectedVehicleVin] = useState(vehicleRecords[0].vin);
  const [selectedComponentId, setSelectedComponentId] = useState(twinComponents[1].id);

  const selectedVehicle = vehicleRecords.find((record) => record.vin === selectedVehicleVin) || vehicleRecords[0];
  const selectedComponent =
    twinComponents.find((component) => component.id === selectedComponentId) || twinComponents[0];

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
  }, []);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Wordmark />
        <nav className="nav-list" aria-label="Primary navigation">
          {navigation.map((item) => (
            <a key={item} className={item === "Dashboard" ? "nav-item active" : "nav-item"} href="#">
              {item}
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
        <header className="topbar">
          <div>
            <p className="meta-label">AuthLine Auto · OEM warranty intelligence</p>
            <h1>Repair Network Evidence Dashboard</h1>
            <p className="subtitle">
              AuthLine Auto gives manufacturers a control surface to track vehicle assemblies, component
              authentication, repairer network tier, and evidence that shows whether warranty-period parts were fitted
              inside or outside the OEM repairer network.
            </p>
          </div>
          <div className="header-actions" aria-label="Verification summary">
            <div className="signal">
              <span className="signal-dot" />
              Live authentication
            </div>
            <button type="button" className="primary-action">
              Verify Fitment
            </button>
          </div>
        </header>

        <section className="brand-strip" aria-label="Product positioning">
          <div>
            <p className="meta-label">Positioning</p>
            <strong>
              VINtegrity by AuthLine Auto: aggregation evidence for OEM warranty decisions, targeted recalls, and
              repairer-network transparency.
            </strong>
          </div>
          <div className="vin-plate" aria-label="VIN sample">
            VIN 9C4A-7F21-VERIFIED
          </div>
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
          <article className="panel twin-panel">
            <div className="panel-header">
              <div>
                <p className="meta-label">Vehicle Aggregation</p>
                <h2>Digital twin repair-network evidence map</h2>
              </div>
              <StatusChip label={selectedVehicle.status} tone={selectedVehicle.tone} />
            </div>

            <div className="twin-layout">
              <div className="vehicle-visual" aria-label={`${selectedVehicle.vin} component map`}>
                <svg viewBox="0 0 760 320" role="img" aria-labelledby="vehicle-map-title">
                  <title id="vehicle-map-title">Vehicle digital twin for {selectedVehicle.vin}</title>
                  <defs>
                    <linearGradient id="bodyChrome" x1="0%" x2="100%" y1="0%" y2="0%">
                      <stop offset="0%" stopColor="#0B111B" />
                      <stop offset="45%" stopColor="#182132" />
                      <stop offset="100%" stopColor="#0B111B" />
                    </linearGradient>
                    <linearGradient id="glass" x1="0%" x2="100%" y1="0%" y2="0%">
                      <stop offset="0%" stopColor="#0B7F86" stopOpacity="0.38" />
                      <stop offset="100%" stopColor="#37F5E5" stopOpacity="0.18" />
                    </linearGradient>
                  </defs>
                  <path
                    className="vehicle-shadow"
                    d="M125 238 C178 275 583 275 636 238 L673 210 C686 200 681 180 665 176 L608 164 L554 103 C535 82 504 70 469 68 L295 68 C260 70 230 82 210 103 L156 164 L98 176 C83 180 78 200 91 210 Z"
                  />
                  <path
                    className="vehicle-body"
                    d="M112 225 C168 263 592 263 648 225 L681 201 C692 193 688 179 674 176 L604 161 L550 100 C532 82 504 72 468 70 L294 70 C258 72 230 82 212 100 L158 161 L88 176 C74 179 70 193 81 201 Z"
                    fill="url(#bodyChrome)"
                  />
                  <path
                    className="vehicle-glass"
                    d="M245 111 L294 85 L461 85 L514 111 L481 155 L278 155 Z"
                    fill="url(#glass)"
                  />
                  <path className="vehicle-line" d="M159 164 L604 164" />
                  <path className="vehicle-line" d="M245 111 L202 170" />
                  <path className="vehicle-line" d="M514 111 L558 170" />
                  <rect className="component-zone" x="315" y="178" width="136" height="48" rx="8" />
                  <rect className="component-zone" x="150" y="172" width="94" height="42" rx="8" />
                  <rect className="component-zone" x="546" y="140" width="72" height="40" rx="8" />
                  <circle className="wheel" cx="188" cy="228" r="38" />
                  <circle className="wheel" cx="574" cy="228" r="38" />
                </svg>

                {twinComponents.map((component) => (
                  <button
                    key={component.id}
                    type="button"
                    className={`hotspot ${component.tone} ${component.id === selectedComponent.id ? "active" : ""}`}
                    style={{ left: `${component.x}%`, top: `${component.y}%` }}
                    onClick={() => setSelectedComponentId(component.id)}
                    aria-label={`${component.label}: ${component.serial}`}
                  >
                    <span />
                  </button>
                ))}
              </div>

              <div className="component-inspector">
                <div>
                  <p className="meta-label">Selected Assembly</p>
                  <strong className="inspector-title">{selectedVehicle.model}</strong>
                  <span className="inspector-muted">{selectedVehicle.vin}</span>
                  <span className="inspector-muted">{selectedVehicle.warranty}</span>
                </div>

                <div className="component-card">
                  <div className="component-card-head">
                    <div>
                      <p className="meta-label">Authenticated Item</p>
                      <strong>{selectedComponent.label}</strong>
                    </div>
                    <StatusChip label={selectedComponent.status} tone={selectedComponent.tone} />
                  </div>
                  <dl className="component-meta">
                    <div>
                      <dt>Serial number</dt>
                      <dd>{selectedComponent.serial}</dd>
                    </div>
                    <div>
                      <dt>Part number</dt>
                      <dd>{selectedComponent.partNumber}</dd>
                    </div>
                    <div>
                      <dt>OEM standard</dt>
                      <dd>{selectedComponent.standard}</dd>
                    </div>
                    <div>
                      <dt>Role</dt>
                      <dd>{selectedComponent.role}</dd>
                    </div>
                    <div>
                      <dt>Fitment event</dt>
                      <dd>{selectedComponent.fitment}</dd>
                    </div>
                    <div>
                      <dt>Fitted by</dt>
                      <dd>{selectedComponent.fittedBy}</dd>
                    </div>
                    <div>
                      <dt>Repairer tier</dt>
                      <dd>{selectedComponent.repairerTier}</dd>
                    </div>
                    <div>
                      <dt>Network status</dt>
                      <dd>{selectedComponent.networkStatus}</dd>
                    </div>
                    <div>
                      <dt>Authenticated by</dt>
                      <dd>{selectedComponent.authenticatedBy}</dd>
                    </div>
                    <div>
                      <dt>User role</dt>
                      <dd>{selectedComponent.authenticatorRole}</dd>
                    </div>
                    <div>
                      <dt>Warranty impact</dt>
                      <dd>{selectedComponent.warrantyImpact}</dd>
                    </div>
                    <div>
                      <dt>Recall exposure</dt>
                      <dd>{selectedComponent.recallExposure}</dd>
                    </div>
                    <div>
                      <dt>Assembly ref</dt>
                      <dd>{selectedVehicle.assemblyRef}</dd>
                    </div>
                    <div>
                      <dt>Snapshot ref</dt>
                      <dd>{selectedComponent.anchorRef}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </article>

          <article className="panel vehicle-panel">
            <div className="panel-header">
              <div>
                <p className="meta-label">Vehicles</p>
                <h2>Warranty-period vehicle assemblies</h2>
              </div>
              <StatusChip label="Verified" tone="green" />
            </div>
            <div className="record-table">
              {vehicleRecords.map((record) => (
                <button
                  type="button"
                  className={`record-row ${record.vin === selectedVehicle.vin ? "selected" : ""}`}
                  key={record.vin}
                  onClick={() => setSelectedVehicleVin(record.vin)}
                >
                  <div>
                    <strong>{record.vin}</strong>
                    <span>{record.model}</span>
                  </div>
                  <div>
                    <span className="muted">{record.repairer}</span>
                    <span className="muted">{record.repairerTier} · {record.warranty} · {record.lastCheck}</span>
                  </div>
                  <StatusChip label={record.status} tone={record.tone} />
                </button>
              ))}
            </div>
          </article>

          <article className="panel verify-panel">
            <div className="panel-header">
              <div>
                <p className="meta-label">Verify</p>
                <h2>Warranty impact triage</h2>
              </div>
            </div>
            <div className="scan-box" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="verification-score">
              <span>Integrity score</span>
              <strong>98.7%</strong>
            </div>
            <p className="panel-copy">
              VINtegrity gives OEM teams the evidence trail to understand whether a warranty-period component was
              authenticated by the OEM, an approved repairer, a certified lower-tier repairer, or someone outside the
              repairer network.
            </p>
          </article>

          <article className="panel repair-panel">
            <div className="panel-header">
              <div>
                <p className="meta-label">Repair lifecycle</p>
                <h2>Book parts off and back on</h2>
              </div>
              <StatusChip label="Repair Booked" tone="cyan" />
            </div>
            <div className="lifecycle-list">
              {repairLifecycle.map((step, index) => (
                <div className="lifecycle-step" key={step.action}>
                  <span className={`event-dot ${step.tone}`} />
                  <div>
                    <strong>{index + 1}. {step.action}</strong>
                    <span>{step.detail}</span>
                    <em>{step.actor}</em>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel recall-panel">
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
              {recallExposure.title} targets {recallExposure.target}. VINtegrity can focus the campaign on vehicles
              whose current assembly evidence shows the affected component is actually attached.
            </p>
          </article>

          <article className="panel care-panel">
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

          <article className="panel status-panel">
            <div className="panel-header">
              <div>
                <p className="meta-label">Statuses</p>
                <h2>Evidence states</h2>
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

          <article className="panel activity-panel">
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
