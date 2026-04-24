# VINtegrity Architecture Notes

## Product Position

VINtegrity is an OEM warranty intelligence platform for authenticated vehicle assemblies.

The platform is operated by AuthLine Auto, the automotive industry arm of parent company AuthLine.

The main asset is the vehicle aggregation itself. Value comes from trusted knowledge of:

- what a vehicle or sub-assembly should contain
- how the whole vehicle breaks down into major systems, assemblies, sub-assemblies, components, and parts
- who authenticated each fitted item
- whether the repairer was OEM, approved, tier 2/certified, or outside the network
- which components were booked off and back on during warranty or repair work
- whether a removed component scan matches the original part sealed into the VIN baseline
- whether a mismatched OEM component was shipped to an approved or outside-network repairer
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

### Assembly Node

A searchable hierarchy node within a vehicle assembly. Nodes can represent the complete vehicle, a major system, an assembly, a sub-assembly, a component, or a smallest tracked part.

This is the main product model until manufacturer schematics are available. Schematics should later link to the same nodes rather than replacing the evidence model.

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

### Repair Scan Evidence

The technician's scan result for a removed part. It captures the expected original serial, the scanned serial, whether the scanned item is recognised as OEM, where that part was shipped, the repairer network tier, and the warranty impact.

This supports two core warranty flows:

- original part confirmed: scan matches the sealed VIN baseline, then the technician books the faulty part off and the replacement on
- mismatch investigation: scan does not match the sealed VIN baseline, then the system checks OEM serial recognition and shipment trace before routing warranty impact

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
2. a searchable assembly tree is created for the whole car
3. major systems are added: engine, gearbox, suspension, bodywork, accessories, and interior
4. each major system is broken down into assemblies, sub-assemblies, components, and parts
5. trusted serialized components are attached to the relevant tree nodes
6. fitments are authenticated by user and repairer tier
7. the initial-sale snapshot is sealed and queued for evidence anchoring
8. a warranty or repair event books parts off and back on the vehicle
9. removed-part scan evidence is compared against the original VIN baseline
10. mismatched OEM parts are traced to their shipment destination and repairer network tier
11. a recall campaign is resolved to vehicles carrying affected components
12. the assembly is inspected later
13. the platform flags warranty-relevant variance:
   - missing component
   - unexpected added component
   - substituted component
   - component fitted outside the repairer network
   - affected recall component still attached to a vehicle

That slice is enough to demonstrate the product's core value clearly: helping OEM teams understand whether a warranty issue is linked to their own supported network or to work performed outside it.
