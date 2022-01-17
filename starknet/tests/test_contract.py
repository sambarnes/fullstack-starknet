import pytest
import asyncio
from starkware.crypto.signature.signature import (
    pedersen_hash,
    private_to_stark_key,
    sign,
)
from starkware.starknet.testing.starknet import Starknet
from starkware.starkware_utils.error_handling import StarkException


@pytest.fixture(scope="module")
def event_loop():
    return asyncio.new_event_loop()


# Reusable local network & contract to save testing time
@pytest.fixture(scope="module")
async def contract_factory():
    starknet = await Starknet.empty()
    contract = await starknet.deploy("contracts/contract.cairo")
    return starknet, contract


# Some mock keypairs to test with
some_vehicle = 1
some_owner_secret = 12345
some_owner = private_to_stark_key(some_owner_secret)
some_signer_secret = 123456789
some_signer = private_to_stark_key(some_signer_secret)
some_other_signer_secret = 9876754321
some_other_signer = private_to_stark_key(some_other_signer_secret)


# The testing library uses python's asyncio. So the following
# decorator and the ``async`` keyword are needed.
@pytest.mark.asyncio
async def test_register_vehicle(contract_factory):
    """Should register a vehicle to a given public key"""
    _, contract = contract_factory

    await contract.register_vehicle(
        vehicle_id=some_vehicle,
        owner_public_key=some_owner,
        signer_public_key=some_signer,
    ).invoke()

    # Check the owner is registered
    registrant = await contract.get_owner(vehicle_id=some_vehicle).call()
    assert registrant.result == (some_owner,)

    # ... and the signer
    signer = await contract.get_signer(vehicle_id=some_vehicle).call()
    assert signer.result == (some_signer,)


@pytest.mark.asyncio
async def test_attest_state_unregistered_vehicle(contract_factory):
    """Should fail with an unregistered vehicle"""
    _, contract = contract_factory

    state_hash = 1234
    nonce = 0
    some_unregistered_vehicle = 5
    message_hash = pedersen_hash(
        nonce, pedersen_hash(some_unregistered_vehicle, state_hash)
    )
    sig_r, sig_s = sign(msg_hash=message_hash, priv_key=some_signer_secret)

    with pytest.raises(StarkException):
        await contract.attest_state(
            vehicle_id=some_unregistered_vehicle,
            nonce=nonce,
            state_hash=state_hash,
        ).invoke(signature=[sig_r, sig_s])


@pytest.mark.asyncio
async def test_attest_state_invalid_nonce(contract_factory):
    """Should fail with invalid nonce"""
    _, contract = contract_factory

    state_hash = 1234
    nonce = 666
    message_hash = pedersen_hash(nonce, pedersen_hash(some_vehicle, state_hash))
    sig_r, sig_s = sign(msg_hash=message_hash, priv_key=some_signer_secret)

    with pytest.raises(StarkException):
        await contract.attest_state(
            vehicle_id=some_vehicle,
            nonce=nonce,
            state_hash=state_hash,
        ).invoke(signature=[sig_r, sig_s])


@pytest.mark.asyncio
async def test_attest_state_invalid_signature(contract_factory):
    """Should fail with invalid nonce"""
    _, contract = contract_factory
    with pytest.raises(StarkException):
        await contract.attest_state(
            vehicle_id=some_vehicle,
            nonce=0,
            state_hash=1234,
        ).invoke(signature=[123456789, 987654321])


@pytest.mark.asyncio
async def test_attest_state(contract_factory):
    """Should successfully attest to a state hash & increment nonce"""
    _, contract = contract_factory

    state_hash = 1234
    nonce = 0
    message_hash = pedersen_hash(nonce, pedersen_hash(some_vehicle, state_hash))
    sig_r, sig_s = sign(msg_hash=message_hash, priv_key=some_signer_secret)

    await contract.attest_state(
        vehicle_id=some_vehicle,
        nonce=nonce,
        state_hash=state_hash,
    ).invoke(signature=[sig_r, sig_s])

    # Check the nonce was incremented
    new_nonce = await contract.get_nonce(vehicle_id=some_vehicle).call()
    assert new_nonce.result == (nonce + 1,)


@pytest.mark.asyncio
async def test_set_signer_invalid_nonce(contract_factory):
    """Should fail to update the signer with a bad nonce"""
    _, contract = contract_factory

    nonce = 666
    message_hash = pedersen_hash(nonce, pedersen_hash(some_vehicle, some_other_signer))
    sig_r, sig_s = sign(msg_hash=message_hash, priv_key=some_owner_secret)

    with pytest.raises(StarkException):
        await contract.set_signer(
            vehicle_id=some_vehicle,
            nonce=nonce,
            signer_public_key=some_other_signer,
        ).invoke(signature=[sig_r, sig_s])


@pytest.mark.asyncio
async def test_set_signer_not_owner(contract_factory):
    """Should fail to update the signer if owner didn't sign the message"""
    _, contract = contract_factory

    nonce = await contract.get_nonce(vehicle_id=some_vehicle).call()
    nonce = nonce.result[0]
    message_hash = pedersen_hash(nonce, pedersen_hash(some_vehicle, some_other_signer))
    # Error here: signing with vehicle signer, not owner
    sig_r, sig_s = sign(msg_hash=message_hash, priv_key=some_signer_secret)

    with pytest.raises(StarkException):
        await contract.set_signer(
            vehicle_id=some_vehicle,
            nonce=nonce,
            signer_public_key=some_other_signer,
        ).invoke(signature=[sig_r, sig_s])


@pytest.mark.asyncio
async def test_set_signer(contract_factory):
    """Should successfully update the signer for the car"""
    _, contract = contract_factory

    nonce = await contract.get_nonce(vehicle_id=some_vehicle).call()
    nonce = nonce.result[0]
    message_hash = pedersen_hash(nonce, pedersen_hash(some_vehicle, some_other_signer))
    sig_r, sig_s = sign(msg_hash=message_hash, priv_key=some_owner_secret)

    await contract.set_signer(
        vehicle_id=some_vehicle,
        nonce=nonce,
        signer_public_key=some_other_signer,
    ).invoke(signature=[sig_r, sig_s])

    # Check that the signer is updated
    new_signer = await contract.get_signer(vehicle_id=some_vehicle).call()
    assert new_signer.result == (some_other_signer,)

    # ... and the nonce was incremented
    new_nonce = await contract.get_nonce(vehicle_id=some_vehicle).call()
    assert new_nonce.result == (nonce + 1,)
