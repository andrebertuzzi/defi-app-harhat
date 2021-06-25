import React, { Component } from 'react'
import { ethers } from 'ethers'
import Navbar from './Navbar'
import Main from './Main'
import './App.css'

import DaiToken from '../artifacts/contracts/DaiToken.sol/DaiToken.json'
import DecoToken from '../artifacts/contracts/DecoToken.sol/DecoToken.json'
import TokenFarm from '../artifacts/contracts/TokenFarm.sol/TokenFarm.json'

const daiTokenAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
const decoTokenAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
const tokenFarmAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'

class App extends Component {
	async componentWillMount() {
		await this.loadWeb3()
		await this.loadBlockchainData()
	}

	async requestAccount() {
		await window.ethereum.request({ method: 'eth_requestAccounts' })
	}

	async loadBlockchainData() {
		const [account] = await window.ethereum.request({
			method: 'eth_requestAccounts',
		})
		console.log(account)
		this.setState({ account: account })
		const provider = new ethers.providers.Web3Provider(window.ethereum)

		// Load DaiToken
		const daiToken = new ethers.Contract(
			daiTokenAddress,
			DaiToken.abi,
			provider
		)
		if (daiToken) {
			this.setState({ daiToken })
			const balance = await daiToken.balanceOf(account)
			console.log(`Dai Balance ${this.state.account}`, balance.toString())
			this.setState({ daiTokenBalance: balance.toString() })
		} else {
			window.alert('DaiToken contract not deployed to detected network.')
		}

		// // Load DecoToken
		const decoToken = new ethers.Contract(
			decoTokenAddress,
			DecoToken.abi,
			provider
		)
		if (decoToken) {
			this.setState({ decoToken })
			const balance = await decoToken.balanceOf(account)
			console.log(`Deco Balance ${this.state.account}`, balance.toString())
			this.setState({ decoTokenBalance: balance.toString() })
		} else {
			window.alert('DecoToken contract not deployed to detected network.')
		}

		// // Load TokenFarm
		const tokenFarm = new ethers.Contract(
			tokenFarmAddress,
			TokenFarm.abi,
			provider
		)
		if (tokenFarm) {
			this.setState({ tokenFarm })
			let stakingBalance = await tokenFarm.functions.stakingBalance(
				this.state.account
			)
			this.setState({ stakingBalance: stakingBalance.toString() })
			console.log(`Staking Balance ${this.state.account}`, stakingBalance.toString())
		} else {
			window.alert('DecoToken contract not deployed to detected network.')
		}

		this.setState({ loading: false })
	}

	async loadWeb3() {
		if (window.ethereum) {
			await this.requestAccount()
		} else {
			window.alert(
				'Non-Ethereum browser detected. You should consider trying MetaMask!'
			)
		}
	}

	stakeTokens = async (amount) => {
		this.setState({ loading: true })
		const provider = new ethers.providers.Web3Provider(window.ethereum)
		const signer = provider.getSigner()
		const dai = new ethers.Contract(daiTokenAddress, DaiToken.abi, signer)
		await dai.functions.approve(this.state.tokenFarm.address, amount)
		const farm = new ethers.Contract(tokenFarmAddress, TokenFarm.abi, signer)
		farm.functions.stakeTokens(amount)
		console.log(
			`${amount} Coins successfully staked ${tokenFarmAddress}`
		)
		this.setState({ loading: false })
	}

	unstakeTokens = () => {
		this.setState({ loading: true })
		const provider = new ethers.providers.Web3Provider(window.ethereum)
		const signer = provider.getSigner()
		const farm = new ethers.Contract(tokenFarmAddress, TokenFarm.abi, signer)
		farm.functions.unstakeTokens()
		console.log(
			`Successfully unstaked from ${tokenFarmAddress}`
		)
		this.setState({ loading: false })
	}

	constructor(props) {
		super(props)
		this.state = {
			account: '0x0',
			daiToken: {},
			decoToken: {},
			tokenFarm: {},
			daiTokenBalance: '0',
			decoTokenBalance: '0',
			stakingBalance: '0',
			loading: true,
		}
	}

	render() {
		let content
		if (this.state.loading) {
			content = (
				<p id='loader' className='text-center'>
					Loading...
				</p>
			)
		} else {
			content = (
				<Main
					daiTokenBalance={this.state.daiTokenBalance}
					decoTokenBalance={this.state.decoTokenBalance}
					stakingBalance={this.state.stakingBalance}
					stakeTokens={this.stakeTokens}
					unstakeTokens={this.unstakeTokens}
				/>
			)
		}

		return (
			<div>
				<Navbar account={this.state.account} />
				<div className='container-fluid mt-5'>
					<div className='row'>
						<main
							role='main'
							className='col-lg-12 ml-auto mr-auto'
							style={{ maxWidth: '600px' }}
						>
							<div className='content mr-auto ml-auto'>
								{content}
							</div>
						</main>
					</div>
				</div>
			</div>
		)
	}
}

export default App
