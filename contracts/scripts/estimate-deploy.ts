import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();
  const address = await signer.getAddress();

  const Factory = await ethers.getContractFactory("AnchorRegistry", signer);

  // Build deploy transaction without sending
  const deployTx = await Factory.getDeployTransaction();

  const gas = await signer.estimateGas(deployTx);
  const feeData = await signer.provider.getFeeData();

  console.log("Deployer:", address);
  console.log("Estimated gas:", gas.toString());
  console.log("maxFeePerGas:", feeData.maxFeePerGas?.toString() ?? "null");
  console.log("maxPriorityFeePerGas:", feeData.maxPriorityFeePerGas?.toString() ?? "null");

  if (feeData.maxFeePerGas) {
    const costWei = gas * feeData.maxFeePerGas;
    console.log("Estimated max cost (AVAX):", ethers.formatEther(costWei));
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
