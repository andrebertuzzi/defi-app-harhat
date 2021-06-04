// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile 
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const DaiToken = await hre.ethers.getContractFactory("DaiToken");
  const daiToken = await DaiToken.deploy();

  const DappToken = await hre.ethers.getContractFactory("DappToken");
  const dappToken = await DappToken.deploy();

  const TokenFarm = await hre.ethers.getContractFactory("TokenFarm");
  const tokenFarm = await TokenFarm.deploy(dappToken.address, daiToken.address);

  await daiToken.deployed();
  await dappToken.deployed();
  await tokenFarm.deployed();

  console.log("Dai deployed to:", daiToken.address);
  console.log("Dapp deployed to:", dappToken.address);
  console.log("TokenFarming deployed to:", tokenFarm.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
