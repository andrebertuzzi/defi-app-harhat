const { expect } = require('chai')
const { assert } = require('chai')
const { ethers } = require('hardhat')

let owner, investor
let daiToken, dappToken, tokenFarm

const tokens = (n) => {
	return ethers.utils.parseEther(n).toString()
}

before(async () => {
  [owner, investor] = await ethers.getSigners();
  // Load Contracts
  const DaiToken = await hre.ethers.getContractFactory("DaiToken");
  daiToken = await DaiToken.deploy();

  const DappToken = await hre.ethers.getContractFactory("DappToken");
  dappToken = await DappToken.deploy();

  const TokenFarm = await hre.ethers.getContractFactory("TokenFarm");
  tokenFarm = await TokenFarm.deploy(dappToken.address, daiToken.address);

  await daiToken.deployed();
  await dappToken.deployed();
  await tokenFarm.deployed();

  // Transfer all Dapp tokens to farm (1 million)
  await dappToken.transfer(tokenFarm.address, tokens('1000000'))

  // Send tokens to investor
  await daiToken.transfer(investor.address, tokens('100'))
})

describe('Mock DAI deployment', async () => {
  it('has a name', async () => {
    const name = await daiToken.name()
    expect(name).to.equal('Mock DAI Token')
  })
})


describe('Dapp Token deployment', async () => {
  it('has a name', async () => {
    const name = await dappToken.name()
    expect(name).to.equal('DApp Token')
  })
})

describe('Token Farm deployment', async () => {
  it('has a name', async () => {
    const name = await tokenFarm.name()
    expect(name).to.equal('Dapp Token Farm')
  })

  it('contract has tokens', async () => {
    let balance = await dappToken.balanceOf(tokenFarm.address)
    expect(balance).to.equal(tokens('1000000'))
  })
})

describe('Farming tokens', async () => {

  it('rewards investors for staking mDai tokens', async () => {
    let result

    // Check investor balance before staking
    result = await daiToken.balanceOf(investor.address)
    assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct before staking')

    // Stake Mock DAI Tokens
    let daiAsInvestor = await daiToken.connect(investor)
    await daiAsInvestor.approve(tokenFarm.address, tokens('100'))
    let tokenFarmAsInvestor = await tokenFarm.connect(investor)
    await tokenFarmAsInvestor.stakeTokens(tokens('100'))

    // Check staking result
    result = await daiToken.balanceOf(investor.address)
    assert.equal(result.toString(), tokens('0'), 'investor Mock DAI wallet balance correct after staking')

    result = await daiToken.balanceOf(tokenFarm.address)
    assert.equal(result.toString(), tokens('100'), 'Token Farm Mock DAI balance correct after staking')

    result = await tokenFarm.stakingBalance(investor.address)
    assert.equal(result.toString(), tokens('100'), 'investor staking balance correct after staking')

    result = await tokenFarm.isStaking(investor.address)
    assert.equal(result.toString(), 'true', 'investor staking status correct after staking')

    // Issue Tokens
    await tokenFarm.issueTokens()

    // Check balances after issuance
    result = await dappToken.balanceOf(investor.address)
    assert.equal(result.toString(), tokens('100'), 'investor DApp Token wallet balance correct affter issuance')

    // Ensure that only onwer can issue tokens
    // await tokenFarmAsInvestor.issueTokens().should.be.rejected;

    // Unstake tokens
    await tokenFarmAsInvestor.unstakeTokens()

    // Check results after unstaking
    result = await daiToken.balanceOf(investor.address)
    assert.equal(result.toString(), tokens('100'), 'investor Mock DAI wallet balance correct after staking')

    result = await daiToken.balanceOf(tokenFarm.address)
    assert.equal(result.toString(), tokens('0'), 'Token Farm Mock DAI balance correct after staking')

    result = await tokenFarm.stakingBalance(investor.address)
    assert.equal(result.toString(), tokens('0'), 'investor staking balance correct after staking')

    result = await tokenFarm.isStaking(investor.address)
    assert.equal(result.toString(), 'false', 'investor staking status correct after staking')
  })
})