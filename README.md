# VINtegrity

VINtegrity is AuthLine Auto's standalone OEM warranty intelligence platform for authenticated vehicle assemblies.

AuthLine Auto is the automotive industry arm of AuthLine, the parent company.

The repository/workspace name is AutoRepo. The product exists as its own codebase, deployment stack, and operating model.

The platform is built around these core principles:

- register serialized OEM components
- build vehicles and sub-assemblies as aggregations
- model the whole vehicle as a searchable hierarchy of major systems, assemblies, sub-assemblies, components, and parts
- authenticate fitted items by named users
- classify fitment events by repairer network tier
- book components off and back on during warranty or repair work
- focus recalls to vehicles that actually carry affected serialized components
- preserve care-history evidence for later warranty review and buyer confidence
- detect parts fitted outside the OEM repairer network
- support warranty impact review with an auditable evidence trail

## Local Workspace

This project has been scaffolded locally at:

- `C:\Projects\AutoRepo`

It is intentionally maintained as a separate product repository.

## Initial Product Direction

The core objects for VINtegrity are:

- `Component`: a serialized OEM or replacement part
- `Assembly`: the vehicle or sub-assembly being tracked
- `AssemblyNode`: a node in the vehicle hierarchy, from the complete car down to individual parts
- `AssemblyMembership`: which parts belong in that vehicle or sub-assembly
- `AssemblySnapshot`: the expected sealed composition for warranty review
- `Inspection`: a later vehicle or repair inspection
- `InspectionItem`: what was observed during that inspection
- `Repairer`: OEM, approved repairer, tier 2/certified repairer, or outside-network repairer
- `AuthenticationEvent`: the user-level evidence that a component, repair, or fitment was authenticated
- `RepairEvent`: the service or warranty job where parts are verified, booked off, and booked back on
- `RepairEventItem`: the serial-level evidence for each booked-off or booked-on component
- `SafetyCampaign`: a recall or service campaign targeted by affected component serials
- `AssemblyCampaignExposure`: the vehicle-level exposure when an affected component is attached to a vehicle

## Current Starter State

The scaffold now includes:

- a minimal Fastify backend
- a minimal React frontend
- a VINtegrity-focused Prisma schema
- root Railway and Docker deployment scaffolding
- a placeholder anchor worker entrypoint

This is intentionally a clean foundation, not a finished product.

## Recommended GitHub Repository

The GitHub repository is:

- `https://github.com/BaldieGeordie/AutoRepo`

## Recommended Next Build Steps

1. Create vehicle and sub-assembly records.
2. Register serialized OEM components.
3. Build the searchable vehicle assembly directory.
4. Add major systems: engine, gearbox, suspension, bodywork, accessories, and interior.
5. Break each major system into assemblies, sub-assemblies, components, and smallest parts.
6. Authenticate fitments by user and repairer tier.
7. Seal the initial-sale assembly snapshot.
8. Book components off and back on during repair work.
9. Resolve recalls to vehicles carrying affected serialized parts.
10. Inspect a vehicle later.
11. Flag warranty-sensitive parts fitted outside the repairer network.
