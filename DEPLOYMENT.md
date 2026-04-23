# Deployment Source Of Truth

VINtegrity is intended to deploy from the repository root using:

- `railway.toml`
- `Dockerfile`

The default shape is:

- one backend service serving the compiled frontend bundle from `frontend/dist`
- an optional worker mode for asynchronous blockchain anchoring
- one Postgres database per environment

## Runtime Modes

- API mode:
  - runs Prisma migrations
  - starts `backend/dist/server.js`
- worker mode:
  - set `RUN_ANCHOR_WORKER=1`
  - starts `npm run anchor:worker`

## Environment Separation

When we deploy beyond local development, VINtegrity should have its own:

- Railway project(s)
- Postgres database(s)
- wallet and signing keys
- anchor target configuration
- custom domains

Do not share deployment state with other products.
