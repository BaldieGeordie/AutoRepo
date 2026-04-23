# VINtegrity

VINtegrity is a standalone platform for assembly integrity and blockchain-anchored asset verification.

The repository/workspace name is AutoRepo. The product exists as its own codebase, deployment stack, and operating model.

The platform is built around these core principles:

- serialize physical components
- build and seal aggregations as assets
- anchor trusted assembly snapshots to blockchain targets
- inspect physical assemblies later
- detect unexpected substitutions, removals, or additions

## Local Workspace

This project has been scaffolded locally at:

- `C:\Projects\AutoRepo`

It is intentionally maintained as a separate product repository.

## Initial Product Direction

The core objects for AutoRepo are:

- `Component`: a serialized physical part
- `Assembly`: the aggregate or asset being tracked
- `AssemblyMembership`: which parts belong in an assembly
- `AssemblySnapshot`: the expected sealed configuration that gets anchored
- `Inspection`: a later physical verification of the assembly contents
- `InspectionItem`: what was actually observed during that inspection
- `AnchorTarget`, `AnchorDispatch`, `AnchorReceipt`: the chain-target plumbing

## Current Starter State

The scaffold now includes:

- a minimal Fastify backend
- a minimal React frontend
- an AutoRepo-focused Prisma schema
- root Railway and Docker deployment scaffolding
- a placeholder anchor worker entrypoint

This is intentionally a clean foundation, not a finished product.

## Recommended GitHub Repository

The GitHub repository is:

- `https://github.com/BaldieGeordie/AutoRepo`

## Recommended Next Build Steps

1. Create the new GitHub repo as an empty repository.
2. Add the new local project as its own git repository.
3. Push the scaffold.
4. Build the first vertical slice:
   - create assembly
   - add serialized components
   - seal and hash the expected contents
   - inspect the physical assembly
   - show mismatches against the anchored snapshot
