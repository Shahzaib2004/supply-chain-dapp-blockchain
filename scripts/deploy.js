const hre = require("hardhat");

async function main() {
  console.log("===========================================");
  console.log("   SHAHZAIB SUPPLY CHAIN DApp DEPLOYMENT");
  console.log("===========================================\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract from account:", deployer.address);
  
  // Get balance using provider
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", balance.toString(), "wei\n");

  // Deploy the smart contract
  console.log("Compiling Smart Contract...");
  const SupplyChain = await hre.ethers.getContractFactory("shahzaib_supplychain");
  
  console.log("Deploying shahzaib_supplychain contract to", hre.network.name, "network...\n");
  const supplyChain = await SupplyChain.deploy();

  await supplyChain.waitForDeployment();
  const contractAddress = await supplyChain.getAddress();
  
  console.log("✓ Contract deployed successfully!");
  console.log("Contract Address:", contractAddress);
  
  // Get the deployment transaction receipt
  const deploymentTx = supplyChain.deploymentTransaction();
  if (deploymentTx) {
    console.log("Transaction Hash:", deploymentTx.hash);
    const receipt = await deploymentTx.wait();
    console.log("Block Number:", receipt.blockNumber);
  }

  // Verify contract information
  console.log("\n===========================================");
  console.log("         CONTRACT INFORMATION");
  console.log("===========================================");
  
  const contractInfo = await supplyChain.getContractInfo();
  console.log("Company Name:", contractInfo.name);
  console.log("Contract Owner:", contractInfo.contractOwner);
  console.log("Total Products:", contractInfo.totalProducts.toString());
  console.log("Total Users:", contractInfo.totalUsers.toString());

  // Save deployment info
  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    network: hre.network.name,
    contractName: "shahzaib_supplychain",
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    deploymentTx: deploymentTx ? deploymentTx.hash : "N/A",
    timestamp: new Date().toISOString(),
    chainId: Number(network.chainId),
  };

  const fs = require("fs");
  const deploymentPath = "./deployment.json";
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("\n✓ Deployment information saved to deployment.json\n");
  console.log("===========================================");
  console.log("  Deployment completed successfully!");
  console.log("===========================================\n");

  // Display usage instructions
  console.log("NEXT STEPS:");
  console.log("1. Copy the Contract Address above");
  console.log("2. Update VITE_CONTRACT_ADDRESS in frontend/.env");
  console.log("3. Update the ABI in frontend/src/abi/shahzaib_supplychain.json");
  console.log("4. Start the frontend: npm run dev (from frontend folder)");
  console.log("5. Connect your wallet and test the DApp!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment Error:", error);
    process.exit(1);
  });
