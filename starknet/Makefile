build :; nile compile

test  :; pytest tests/

deploy-testnet :; starknet deploy --contract artifacts/contract.json --network=alpha-goerli

start-devnet :; docker pull shardlabs/starknet-devnet && docker run -it -p 127.0.0.1:5000:5000 shardlabs/starknet-devnet
