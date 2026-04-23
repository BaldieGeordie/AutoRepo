# VINtegrity Architecture Notes

## Product Position

VINtegrity is an OEM warranty intelligence platform for authenticated vehicle assemblies.

The main asset is the vehicle aggregation itself. Value comes from trusted knowledge of:

- what a vehicle or sub-assembly should contain
- who authenticated each fitted item
- whether the repairer was OEM, approved, tier 2/certified, or outside the network
- which components were booked off and back on during warranty or repair work
- which vehicles are actually exposed to a recall because they carry the affected serialized component
- what is physically present when inspected later
- whether an outside-network fitment may affect warranty responsibility
- whether the vehicle has a clean care-history evidence trail for future buyers

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

### Repair Event

The warranty or service job opened against a vehicle assembly. It links the car, repairer, user, service order, and optional warranty claim reference.

### Repair Event Item

The serial-level movement of a component during the repair event. VINtegrity should explicitly support:

- verifying a component is present before work starts
- booking a component off the vehicle
- booking a replacement component back onto the vehicle

This is how the platform proves that manufacturers or approved repairers really changed the part they said they changed.

### Safety Campaign

A recall or service campaign targeted at affected component part numbers, serial ranges, or serialized components.

### Assembly Campaign Exposure

The resolved vehicle-level exposure for a campaign. Because the platform knows which components are attached to which vehicle, a campaign can focus on affected vehicles instead of broadcasting against an entire model population.

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
4. the initial-sale snapshot is sealed and queued for evidence anchoring
5. a warranty or repair event books parts off and back on the vehicle
6. a recall campaign is resolved to vehicles carrying affected components
7. the assembly is inspected later
8. the platform flags warranty-relevant variance:
   - missing component
   - unexpected added component
   - substituted component
   - component fitted outside the repairer network
   - affected recall component still attached to a vehicle

That slice is enough to demonstrate the product's core value clearly: helping OEM teams understand whether a warranty issue is linked to their own supported network or to work performed outside it.
