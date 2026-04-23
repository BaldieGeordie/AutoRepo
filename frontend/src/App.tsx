import { useEffect, useState } from "react";

type MetaResponse = {
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
  dealer: string;
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
  approval: string;
  faultSignal: string;
  x: number;
  y: number;
};

const apiBase = import.meta.env.VITE_API_BASE || "/api/v1";

const navigation = [
  "Dashboard",
  "Vehicles",
  "Components",
  "Assemblies",
  "Approved Dealers",
  "Service Events",
  "Recalls",
  "Ownership",
  "Verify",
  "Audit Trail",
  "System Settings",
  "Users",
];

const metrics: Array<{ label: string; value: string; delta: string; tone: Tone }> = [
  { label: "Vehicles Registered", value: "18,420", delta: "+6.4% 30d", tone: "cyan" },
  { label: "Genuine Components", value: "241,908", delta: "99.2% verified", tone: "green" },
  { label: "Open Fitment Events", value: "184", delta: "42 pending", tone: "amber" },
  { label: "Aftermarket Fitments", value: "2,961", delta: "service trace", tone: "steel" },
  { label: "Recall Flags", value: "27", delta: "8 critical", tone: "red" },
  { label: "Warranty Reviews", value: "76,114", delta: "+14.8% 30d", tone: "cyan" },
  { label: "Approved Dealers", value: "312", delta: "14 markets", tone: "green" },
  { label: "Independent Workshops", value: "1,184", delta: "logged work", tone: "amber" },
];

const statusChips: Array<{ label: string; tone: Tone }> = [
  { label: "Verified", tone: "green" },
  { label: "Factory Fit", tone: "cyan" },
  { label: "Approved Fitment", tone: "green" },
  { label: "Pending Verification", tone: "amber" },
  { label: "Warranty Review", tone: "amber" },
  { label: "Independent Workshop", tone: "steel" },
  { label: "Owner Fitment Logged", tone: "steel" },
  { label: "Evidence Missing", tone: "red" },
  { label: "Part Replaced", tone: "steel" },
  { label: "Recall Affected", tone: "red" },
  { label: "Recall Cleared", tone: "green" },
  { label: "Ownership Transferred", tone: "cyan" },
  { label: "Inspection Required", tone: "amber" },
];

const vehicleRecords: VehicleRecord[] = [
  {
    vin: "WVWZZZCD7NW184201",
    model: "ID.7 Pro S",
    dealer: "Northgate Approved",
    assemblyRef: "ASM-VEH-WVW184201",
    owner: "Fleet operator",
    warranty: "Active warranty",
    status: "Verified",
    tone: "green",
    lastCheck: "2 min ago",
  },
  {
    vin: "SJAAM2ZV8PC019488",
    model: "Continental Hybrid",
    dealer: "Metro Fleet Service",
    assemblyRef: "ASM-VEH-PC019488",
    owner: "Insurer custody",
    warranty: "Warranty review",
    status: "Pending Verification",
    tone: "amber",
    lastCheck: "18 min ago",
  },
  {
    vin: "ZFF95NLA6P0287319",
    model: "Roma Spider",
    dealer: "Maranello North",
    assemblyRef: "ASM-VEH-P0287319",
    owner: "Private owner",
    warranty: "Out of warranty",
    status: "Service History Review",
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
    approval: "Factory source verified",
    faultSignal: "Identity evidence supports warranty and resale provenance review.",
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
    approval: "Factory source verified",
    faultSignal: "Warranty claim can be assessed against factory-fit evidence and diagnostics.",
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
    status: "Approved Fitment",
    tone: "cyan",
    anchorRef: "snap_drive_unit_44721",
    standard: "OEM replacement standard",
    fittedBy: "Northgate Approved",
    approval: "Approved dealer fitment",
    faultSignal: "Dealer-fit component remains inside supported warranty provenance chain.",
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
    approval: "Outside approved warranty network",
    faultSignal: "Warranty claim needs review, while resale history still shows exactly who fitted the part.",
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
    approval: "Factory source verified",
    faultSignal: "Control module evidence supports warranty diagnostics and service history checks.",
    x: 67,
    y: 60,
  },
];

const eventFeed = [
  {
    event: "Register component",
    subject: "Battery control module BCM-91A-4472",
    actor: "OEM plant 04",
    time: "09:42",
    tone: "cyan" as Tone,
  },
  {
    event: "Independent service logged",
    subject: "Driver assistance sensor replacement linked to WVWZZZCD7NW184201",
    actor: "West Quay Autocare",
    time: "10:18",
    tone: "amber" as Tone,
  },
  {
    event: "Recall or safety campaign",
    subject: "Campaign RC-24-089 matched against 27 vehicles",
    actor: "Safety office",
    time: "10:31",
    tone: "red" as Tone,
  },
  {
    event: "Transfer custody",
    subject: "Vehicle accepted by insurer inspection site",
    actor: "FleetSure Claims",
    time: "10:47",
    tone: "steel" as Tone,
  },
];

const custodyStages = [
  "OEM",
  "Dealer Group",
  "Workshop",
  "Insurer",
  "Fleet Operator",
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
      <div className="wordmark">
        <span className="wordmark-vin">VIN</span>
        <span className="wordmark-rest">tegrity</span>
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
          <p className="meta-label">Network</p>
          <strong>{meta?.anchorTargets.find((target) => target.primary)?.label || "EVM provenance anchor"}</strong>
          <span>{meta?.status || "Bootstrapping"} integrity stack</span>
        </div>
      </aside>

      <main className="dashboard">
        <header className="topbar">
          <div>
            <p className="meta-label">Verified vehicle provenance</p>
            <h1>Vehicle Integrity Dashboard</h1>
            <p className="subtitle">
              Track verified vehicles, genuine components, warranty-period work, recall exposure, and transparent
              service provenance from one secure control surface.
            </p>
          </div>
          <div className="header-actions" aria-label="Verification summary">
            <div className="signal">
              <span className="signal-dot" />
              Live verification
            </div>
            <button type="button" className="primary-action">
              Verify VIN
            </button>
          </div>
        </header>

        <section className="brand-strip" aria-label="Product positioning">
          <div>
            <p className="meta-label">Positioning</p>
            <strong>Verified vehicle provenance. Genuine parts. Trusted history.</strong>
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
                <p className="meta-label">Vehicle Assembly</p>
                <h2>Digital twin warranty and resale evidence map</h2>
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
                  <p className="meta-label">Selected Vehicle</p>
                  <strong className="inspector-title">{selectedVehicle.model}</strong>
                  <span className="inspector-muted">{selectedVehicle.vin}</span>
                  <span className="inspector-muted">{selectedVehicle.warranty}</span>
                </div>

                <div className="component-card">
                  <div className="component-card-head">
                    <div>
                      <p className="meta-label">Linked Component</p>
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
                      <dt>Fitment state</dt>
                      <dd>{selectedComponent.fitment}</dd>
                    </div>
                    <div>
                      <dt>Fitted by</dt>
                      <dd>{selectedComponent.fittedBy}</dd>
                    </div>
                    <div>
                      <dt>Approval</dt>
                      <dd>{selectedComponent.approval}</dd>
                    </div>
                    <div>
                      <dt>Warranty evidence</dt>
                      <dd>{selectedComponent.faultSignal}</dd>
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
                <h2>High-confidence vehicle records</h2>
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
                    <span className="muted">{record.dealer}</span>
                    <span className="muted">{record.owner} · {record.warranty} · {record.lastCheck}</span>
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
                <h2>Warranty and resale triage</h2>
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
              VINtegrity does not block owner or independent workshop maintenance. It records the evidence needed to
              separate warranty-covered manufacturer issues from aftermarket work, missing evidence, or ordinary resale
              service history.
            </p>
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
                <p className="meta-label">Custody</p>
                <h2>Ownership and service chain</h2>
              </div>
              <StatusChip label="Ownership Transferred" tone="cyan" />
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
                <h2>Provenance-critical activity</h2>
              </div>
              <StatusChip label="Inspection Required" tone="amber" />
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
