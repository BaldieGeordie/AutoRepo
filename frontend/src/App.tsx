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

const apiBase = import.meta.env.VITE_API_BASE || "/api/v1";
const appName = import.meta.env.VITE_APP_NAME || "VINtegrity";

export default function App() {
  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    <main className="shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Assembly Integrity Platform</p>
          <h1>{appName}</h1>
          <p className="tagline">
            Trust what an asset should contain, anchor that configuration, and expose any later physical mismatch.
          </p>
        </div>
        <div className="hero-panel">
          <div className="panel-label">Starter status</div>
          <div className="panel-value">{meta?.status || "bootstrapping"}</div>
          <div className="panel-note">Separate local platform scaffold created for AutoRepo.</div>
        </div>
      </section>

      <section className="grid two-up">
        <article className="card">
          <p className="card-kicker">Core value</p>
          <h2>Assemblies are the asset</h2>
          <p>
            VINtegrity focuses on the integrity of the aggregation itself. The platform’s value comes from knowing which
            serialized parts belong inside an assembly and proving whether a later inspection still matches the trusted
            anchored state.
          </p>
        </article>

        <article className="card accent">
          <p className="card-kicker">Starter API</p>
          <h2>{meta?.product.tagline || "Awaiting backend metadata"}</h2>
          <p>
            The backend currently exposes starter metadata and demo assembly inspection endpoints so we can grow the
            new product as a clean, separate platform.
          </p>
        </article>
      </section>

      <section className="grid three-up">
        <article className="card compact">
          <p className="card-kicker">Model</p>
          <h3>Serialized components</h3>
          <p>Each component can carry its own serial, part number, and lifecycle state.</p>
        </article>
        <article className="card compact">
          <p className="card-kicker">Model</p>
          <h3>Assembly snapshots</h3>
          <p>Trusted expected contents are hashed and prepared for blockchain anchoring.</p>
        </article>
        <article className="card compact">
          <p className="card-kicker">Model</p>
          <h3>Later inspections</h3>
          <p>Physical observations can be compared against the anchored expected configuration.</p>
        </article>
      </section>

      <section className="grid two-up">
        <article className="card">
          <p className="card-kicker">Capabilities</p>
          <ul className="list">
            {(meta?.capabilities || []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {error && <p className="error">Backend metadata unavailable: {error}</p>}
        </article>

        <article className="card">
          <p className="card-kicker">Anchor targets</p>
          <ul className="targets">
            {(meta?.anchorTargets || []).map((target) => (
              <li key={target.targetKey}>
                <span>
                  <strong>{target.label}</strong>
                  <span className="target-meta">{target.kind} · {target.targetKey}</span>
                </span>
                <span className={`badge ${target.enabled ? "on" : "off"}`}>
                  {target.primary ? "primary" : target.enabled ? "enabled" : "disabled"}
                </span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="card">
        <p className="card-kicker">Next build slice</p>
        <h2>What we should implement first</h2>
        <ol className="list ordered">
          {(meta?.suggestedNextBuildSteps || []).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      </section>
    </main>
  );
}
