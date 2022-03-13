import pydantic
from fastapi import FastAPI, HTTPException
from starknet_py.contract import Contract
from starknet_py.net.client import Client
from starknet_py.net.account.account_client import AccountClient, KeyPair
from starkware.python.utils import from_bytes

from app.config import Config


API_VERSION = "0.0.1"
app = FastAPI()
config = Config()
network = "http://localhost:5000"
chain_id = from_bytes(b"SN_GOERLI")
starknet_client = Client(net=network, chain=chain_id)
account_client = AccountClient(
    address=config.signer_address,
    key_pair=KeyPair.from_private_key(config.signer_secret),
    net=network,
    chain=chain_id,
)


@app.get(path="/api")
def api_info():
    return {"version": API_VERSION, **config.dict(exclude={"signer_secret"})}


@app.post(path="/api/register")
async def register_vehicle():
    """
    Registers the car on chain, with identical owner and signer.

    Returns the transaction hash.
    """
    # Contract constructor passes in the account_client.
    # This allows proxying transactions through the account, to the target contract.
    contract = await Contract.from_address(
        address=config.contract_address,
        client=account_client,
    )

    (owner,) = await contract.functions["get_owner"].call(config.vehicle_id)
    if owner != 0:
        raise HTTPException(status_code=422, detail="Vehicle already registered")

    invocation = await contract.functions["register_vehicle"].invoke(
        vehicle_id=config.vehicle_id,
        signer_address=int(config.signer_address, 16),
    )
    await invocation.wait_for_acceptance()
    return {"tx_hash": invocation.hash}


class CommitRequest(pydantic.BaseModel):
    state_id: int
    state_hash: int


@app.post(path="/api/commit")
async def commit(req: CommitRequest):
    """Commits a single state attestation on chain, using the most recent window of data."""
    contract = await Contract.from_address(
        address=config.contract_address,
        client=account_client,
    )

    invocation = await contract.functions["attest_state"].invoke(
        vehicle_id=config.vehicle_id,
        state_id=req.state_id,
        state_hash=req.state_hash,
    )
    await invocation.wait_for_acceptance()
    return {"tx_hash": invocation.hash}
