# VINtegrity Architecture Notes

## Product Position

VINtegrity is an OEM warranty intelligence platform for authenticated vehicle assemblies.

The main asset is the vehicle aggregation itself. Value comes from trusted knowledge of:

- what a vehicle or sub-assembly should contain
- who authenticated each fitted item
- whether the repairer was OEM, approved, tier 2/certified, or outside the network
- what is physically present when inspected later
- whether an outside-network fitment may affect warranty responsibility

## Technical Shape

The starter uses a pragmatic web application architecture:

- React frontend
- Fastify backend
- Prisma with PostgreSQL
- asynchronous blockchain anchoring worker
- Railway root deployment

## Core Domain Objects

### Component

A serialized physical part or module.

### Assembly

The vehicle or sub-assembly whose component composition matters for warranty review.

### Assembly Membership

The expected relationship between a vehicle/sub-assembly and its fitted parts.

### Assembly Snapshot

A sealed snapshot of expected assembly contents used as the warranty baseline.

### Inspection

A later verification event carried out by an OEM reviewer, approved repairer, certified repairer, or inspection site.

### Inspection Item

An individual observed component or serial captured during inspection.

### Repairer

The organisation or workshop responsible for a repair or fitment event. VINtegrity should support at least:

- OEM manufacturing or repair
- approved repairer
- tier 2/certified repairer
- outside-network repairer

### Authentication Event

The named user-level evidence that a component, repair, or fitment was authenticated. This is distinct from simply recording a part number; it captures who confirmed the work and under which repairer tier.

## Anchor Strategy

The product may support multiple tamper-evident evidence targets over time.

The starter schema already assumes target abstraction rather than hard-coding one chain:

- EVM targets
- Solana targets

## First Functional Slice

The first meaningful end-to-end demo should prove:

1. an assembly is created
2. trusted serialized components are added
3. fitments are authenticated by user and repairer tier
4. a snapshot hash is created and queued for evidence anchoring
5. the assembly is inspected later
6. the platform flags warranty-relevant variance:
   - missing component
   - unexpected added component
   - substituted component
   - component fitted outside the repairer network

That slice is enough to demonstrate the product's core value clearly: helping OEM teams understand whether a warranty issue is linked to their own supported network or to work performed outside it.
