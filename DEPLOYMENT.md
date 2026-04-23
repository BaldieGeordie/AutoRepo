# Deployment Source Of Truth

VINtegrity is intended to deploy from the repository root using:

- `railway.toml`
- `Dockerfile`

The default shape is:

- one backend service serving the compiled frontend bundle from `frontend/dist`
- an optional worker mode for asynchronous blockchain anchoring
- one Postgres database per environment

## Railway

Production project:

- Project URL: `https://railway.com/project/2b93ae87-6345-429d-a263-59ffd013b7ec?environmentId=58188c4c-854f-4e74-b6db-50aec9e95b3d`
- Project ID: `2b93ae87-6345-429d-a263-59ffd013b7ec`
- Environment: `production`
- Environment ID: `58188c4c-854f-4e74-b6db-50aec9e95b3d`
- API/web service: `vintegrity-api`
- Service ID: `39963d19-756c-4b11-a8bf-6f852788d3cc`
- Public URL: `https://vintegrity-api-production.up.railway.app`

The starter build can run before the first Prisma migration exists. Once migrations are added, API startup expects `DATABASE_URL` to be present and runs `prisma migrate deploy`.

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
