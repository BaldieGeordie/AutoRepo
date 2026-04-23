import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();
  const address = await signer.getAddress();
  const balance = await signer.provider.getBalance(address);

  console.log("Deployer address:", address);
  console.log("Deployer balance (AVAX):", ethers.formatEther(balance));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
