import { ethers } from "hardhat";

async function main() {
  const Factory = await ethers.getContractFactory("AnchorRegistry");
  const contract = await Factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("AnchorRegistry deployed to:", address);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
