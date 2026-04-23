# VINtegrity Contracts

Smart contracts for anchoring canonical assembly snapshot hashes on Avalanche Fuji.

## Contract

- `contracts/AnchorRegistry.sol`
  - Stores whether a snapshot hash has been anchored and when.

## Prerequisites

- Node.js 20+
- npm

## Setup

1. Install dependencies:

```bash
npm ci
```

2. Create `.env` from `.env.example.txt` and set values:

- `FUJI_RPC_URL`
- `DEPLOYER_PRIVATE_KEY`

## Commands

- Compile:

```bash
npm run compile
```

- Run tests:

```bash
npm run test
```

- Check deployer wallet and AVAX balance on Fuji:

```bash
npm run check:fuji
```

- Estimate deployment gas/cost on Fuji:

```bash
npm run estimate:deploy:fuji
```

- Deploy `AnchorRegistry` to Fuji:

```bash
npm run deploy:fuji
```

## Network

Hardhat network config is defined in `hardhat.config.ts`.
Fuji chain ID is `43113`.
