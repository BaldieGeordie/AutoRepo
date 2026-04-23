import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("AnchorRegistry", function () {
  async function deployRegistryFixture() {
    const [owner, otherAccount] = await hre.ethers.getSigners();
    const Registry = await hre.ethers.getContractFactory("AnchorRegistry");
    const registry = await Registry.deploy();
    await registry.waitForDeployment();

    return { registry, owner, otherAccount };
  }

  it("anchors a new canonical hash and records its timestamp", async function () {
    const { registry, owner } = await deployRegistryFixture();
    const snapshotHash = hre.ethers.keccak256(
      hre.ethers.toUtf8Bytes("vintegrity:assembly-snapshot:ASM-DEMO-0001"),
    );

    await expect(registry.anchor(snapshotHash))
      .to.emit(registry, "Anchored")
      .withArgs(snapshotHash, owner.address, anyValue);

    expect(await registry.isAnchored(snapshotHash)).to.equal(true);
    expect(await registry.anchoredAt(snapshotHash)).to.be.greaterThan(0);
  });

  it("rejects the zero hash", async function () {
    const { registry } = await deployRegistryFixture();

    await expect(registry.anchor(hre.ethers.ZeroHash)).to.be.revertedWith("eventHash is zero");
  });

  it("rejects duplicate anchors", async function () {
    const { registry } = await deployRegistryFixture();
    const snapshotHash = hre.ethers.keccak256(
      hre.ethers.toUtf8Bytes("vintegrity:assembly-snapshot:duplicate"),
    );

    await registry.anchor(snapshotHash);

    await expect(registry.anchor(snapshotHash)).to.be.revertedWith("already anchored");
  });
});
