from fastapi import FastAPI, HTTPException
from starknet_py.contract import Contract
from starknet_py.net.client import Client
from starknet_py.utils.crypto.facade import sign_calldata


API_VERSION = "0.0.1"
app = FastAPI()
starknet_client = Client("testnet")


@app.get(path="/api")
def api_info():
    return {"version": API_VERSION}


@app.get(path="/api/tmp")
async def tmp_block():
    """A temporary function to demonstrate network interaction"""
    call_result = await starknet_client.get_block("0xf4b05e3ec5bfc9e864b95bfcb2a8f1db04101c65635a92197d1002b6a52f04")
    return {"data": call_result}


# TODO: read this from a config file / environment
contract_address="0x029af160331cb2c5898999034f51f3357243a36b93c7b696f7daf0711482458e"
vehicle_id = 1
private_key = 12345
public_key = 1628448741648245036800002906075225705100596136133912895015035902954123957052


@app.post(path="/api/register")
async def register_vehicle():
    """Registers the car on chain, and returns the transaction hash."""
    contract = await Contract.from_address(contract_address, starknet_client)

    # Reads (i.e. calls) are executed immediately.
    (owner,) = await contract.functions["get_owner"].call(vehicle_id)
    if owner != 0:
        raise HTTPException(status_code=403, detail="Vehicle already registered")

    # Writes (i.e. invokes) aren't accepted immediately
    invocation = await contract.functions["register_vehicle"].invoke(
        vehicle_id=vehicle_id,
        owner_public_key=public_key,
        signer_public_key=public_key,
    )
    # ... but we can easily wait for it
    await invocation.wait_for_acceptance()

    # and return it's transaction hash
    return {"tx_hash": invocation.hash}


@app.post(path="/api/commit")
async def commit():
    """Commits a single state attestation on chain, using the most recent window of data."""
    contract = await Contract.from_address(contract_address, starknet_client)

    # Query current nonce to ensure we're signing the right payload
    (nonce,) = await contract.functions["get_nonce"].call(vehicle_id)

    # TODO: read from locally saved diagnostic data
    state_hash = 42424242

    # Prepare the function call without actually sending it yet.
    # This allows us to access felts exactly as they'll be serialized in calldata.
    prepared = contract.functions["attest_state"].prepare(
        vehicle_id=vehicle_id, nonce=nonce, state_hash=state_hash
    )

    # Hash and sign the transaction payload
    # Ordering: H( nonce, H( vehicle_id, H( state_hash, 0 ) ) )
    calldata = [
        # Each arg fits in a normal felt, so only the first element is filled.
        # Large numbers may span 2 or more elements here.
        prepared.arguments["state_hash"][0],
        prepared.arguments["vehicle_id"][0],
        prepared.arguments["nonce"][0],
    ]
    signature = sign_calldata(calldata, private_key)

    # Send it off & wait for confirmation
    invocation = await prepared.invoke(signature)
    await invocation.wait_for_acceptance()

    return {"nonce": nonce, "signature": signature, "tx_hash": invocation.hash}
