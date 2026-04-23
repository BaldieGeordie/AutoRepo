import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const AnchorRegistryModule = buildModule("AnchorRegistryModule", (m) => {
  const registry = m.contract("AnchorRegistry");

  return { registry };
});

export default AnchorRegistryModule;
