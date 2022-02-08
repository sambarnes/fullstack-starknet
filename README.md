# FullStack StarkNet

Repo containing the code for a tutorial series I'm writing while diving into StarkNet and learning Cairo.

Creating an immutable [black box](https://en.wikipedia.org/wiki/Flight_recorder) for cars.

Tutorial text kept on hackmd for easier editing:

* **[Part 1]** 🚧 [Project Setup & Getting Started with Cairo](https://hackmd.io/@sambarnes/BJvGs0JpK)
	* write a unit tested contract in cairo 
	* deploy your contract to testnet
* **[Part 2]** 🐍 [Contract Interaction with starknet.py](https://hackmd.io/@sambarnes/H1Fx7OMaF)
	* create and sign StarkNet transactions from a python application
* **[Part 3]** 🧑 [StarkNet Account Abstraction & Using Standard Contracts](https://hackmd.io/@sambarnes/rkGekNvAY)
	* learn the difference between Ethereum & StarkNet Account models
	* refactor your contract & tests to use standard OpenZeppelin Accounts
* **[Part 4]** 💽 [Local Devnet & Starknet.py's Account Capabilities](https://hackmd.io/@sambarnes/By7kitOCt)
	* learn to use the devnet for boosted development speed
	* leverage starknet.py's AccountClient to proxy transactions through a deployed Account
* **[Part 5]** 🎨 [StarkNet Frontends w/ Cairopal & Argent X](https://hackmd.io/@sambarnes/HydPlH9CY)
	* build a frontend from the community made dapp template
	* connect to an account in your Argent X wallet & sign transactions
* **[Notes]** 💰 [Contract Costs & Why Our Design Needs Work](https://hackmd.io/@sambarnes/SkxMZHhRK)
	* learn about the future of transaction fees in StarkNet & how to write code with that in mind
	* implement a [Bloom filter](https://github.com/sambarnes/cairo-bloom) in cairo

![Design diagram](https://i.imgur.com/i0ZFjfO.png)

## Finished Product

A react frontend that interacts with our deployed StarkNet contract, using Argent X accounts & browser extension:

![Frontend](https://i.imgur.com/bxVGVU5.png)
