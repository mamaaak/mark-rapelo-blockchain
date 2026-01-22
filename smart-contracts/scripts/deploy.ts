import hre from "hardhat";
import { ContractFactory, JsonRpcProvider, Wallet } from "ethers";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Deploying contract...");

  // 1. Get the contract artifact
  const artifact = await hre.artifacts.readArtifact("MyToken");
  
  // 2. Setup provider and signer from environment variables
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!rpcUrl || !privateKey) {
    throw new Error("Please set SEPOLIA_RPC_URL and PRIVATE_KEY in your .env file");
  }

  const provider = new JsonRpcProvider(rpcUrl);
  const wallet = new Wallet(privateKey, provider);

  console.log(`Deploying from address: ${wallet.address}`);

  // 3. Create contract factory and deploy
  const MyToken = new ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const myToken = await MyToken.deploy();

  // 4. Wait for it to be deployed
  await myToken.waitForDeployment();

  const address = await myToken.getAddress();
  console.log(`Token deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});