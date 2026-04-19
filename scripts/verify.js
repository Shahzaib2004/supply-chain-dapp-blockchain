const hre = require("hardhat");

/**
 * Verification Script for Shahzaib Supply Chain Contract
 * Run after deployment with: npx hardhat run scripts/verify.js --network mumbai
 */

async function main() {
  const contractAddress = "0x..."; // Replace with deployed contract address
  
  if (contractAddress === "0x...") {
    console.error("Please update contractAddress in verify.js");
    return;
  }

  console.log("Verifying contract on Polygonscan...");
  
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    });
    console.log("✓ Contract verified successfully!");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✓ Contract is already verified on Polygonscan");
    } else {
      console.error("Verification failed:", error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
