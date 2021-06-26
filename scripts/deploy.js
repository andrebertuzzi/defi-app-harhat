// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");


const tokens = (n) => {
	return ethers.utils.parseEther(n).toString()
}

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile 
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  [owner] = await ethers.getSigners();
  const DaiToken = await hre.ethers.getContractFactory("DaiToken");
  const daiToken = await DaiToken.deploy();

  const DecoToken = await hre.ethers.getContractFactory("DecoToken");
  const decoToken = await DecoToken.deploy();

  const TokenFarm = await hre.ethers.getContractFactory("TokenFarm");
  const tokenFarm = await TokenFarm.deploy(decoToken.address, daiToken.address);

  await daiToken.deployed();
  await decoToken.deployed();
  await tokenFarm.deployed();

  console.log("Dai deployed to:", daiToken.address);
  console.log("Deco deployed to:", decoToken.address);
  console.log("TokenFarming deployed to:", tokenFarm.address);

  // Transfer all Deco tokens to farm (1 million)
  await decoToken.transfer(tokenFarm.address, tokens('1000000'))

  // Send tokens to investor
  await daiToken.transfer(owner.address, tokens('100'))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
