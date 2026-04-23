# VINtegrity Architecture Notes

## Product Position

VINtegrity is an assembly integrity platform.

The main asset is the aggregation itself. Value comes from trusted knowledge of:

- what an assembly should contain
- what was anchored as the approved composition
- what is physically present when inspected later

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

The aggregation or assembled asset whose integrity matters.

### Assembly Membership

The expected relationship between an assembly and its parts.

### Assembly Snapshot

A sealed snapshot of expected assembly contents.

### Inspection

A later verification event carried out by an inspector, operator, maintainer, or receiving site.

### Inspection Item

An individual observed component or serial captured during inspection.

## Anchor Strategy

The product should support multiple blockchain targets over time.

The starter schema already assumes target abstraction rather than hard-coding one chain:

- EVM targets
- Solana targets

## First Functional Slice

The first meaningful end-to-end demo should prove:

1. an assembly is created
2. trusted serialized components are added
3. a snapshot hash is created and queued for anchoring
4. the assembly is inspected later
5. the platform flags exact variance:
   - missing component
   - unexpected added component
   - substituted component

That slice is enough to demonstrate the product's core value clearly.
