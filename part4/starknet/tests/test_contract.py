from dataclasses import dataclass
from typing import Tuple

import pytest
import asyncio
from starkware.starknet.testing.starknet import Starknet, StarknetContract
from starkware.starkware_utils.error_handling import StarkException
from utils import Signer


some_vehicle = 1


@dataclass
class Account:
    signer: Signer
    contract: StarknetContract


@pytest.fixture(scope="module")
def event_loop():
    return asyncio.new_event_loop()


# Reusable local network & contracts to save testing time
@pytest.fixture(scope="module")
async def contract_factory() -> Tuple[Starknet, Account, Account, StarknetContract]:
    starknet = await Starknet.empty()
    some_signer = Signer(private_key=12345)
    owner_account = Account(
        signer=some_signer,
        contract=await starknet.deploy(
            "contracts/Account.cairo", constructor_calldata=[some_signer.public_key]
        ),
    )
    some_other_signer = Signer(private_key=123456789)
    signer_account = Account(
        signer=some_other_signer,
        contract=await starknet.deploy(
            "contracts/Account.cairo",
            constructor_calldata=[some_other_signer.public_key],
        ),
    )
    contract = await starknet.deploy("contracts/contract.cairo")
    return starknet, owner_account, signer_account, contract


@pytest.mark.asyncio
async def test_register_vehicle(contract_factory):
    """Should register a vehicle to a given owner address"""
    _, owner_account, signer_account, contract = contract_factory

    await owner_account.signer.send_transaction(
        account=owner_account.contract,
        to=contract.contract_address,
        selector_name="register_vehicle",
        calldata=[some_vehicle, signer_account.contract.contract_address],
    )

    # Check the owner is registered
    observed_registrant = await contract.get_owner(vehicle_id=some_vehicle).call()
    assert observed_registrant.result == (owner_account.contract.contract_address,)

    # ... and the signer
    observed_signer = await contract.get_signer(vehicle_id=some_vehicle).call()
    assert observed_signer.result == (signer_account.contract.contract_address,)


@pytest.mark.asyncio
async def test_register_vehicle_again(contract_factory):
    """Should fail to register a vehicle a second time"""
    _, owner_account, signer_account, contract = contract_factory

    with pytest.raises(StarkException):
        await signer_account.signer.send_transaction(
            account=signer_account.contract,
            to=contract.contract_address,
            selector_name="register_vehicle",
            calldata=[some_vehicle, signer_account.contract.contract_address],
        )

    # Check the original owner is still registered
    observed_registrant = await contract.get_owner(vehicle_id=some_vehicle).call()
    assert observed_registrant.result == (owner_account.contract.contract_address,)


@pytest.mark.asyncio
async def test_attest_state_unregistered_vehicle(contract_factory):
    """Should fail with an unregistered vehicle"""
    _, _, signer_account, contract = contract_factory

    state_id = 1
    state_hash = 1234
    some_unregistered_vehicle = 5
    with pytest.raises(StarkException):
        await signer_account.signer.send_transaction(
            signer_account.contract,
            contract.contract_address,
            "attest_state",
            [some_unregistered_vehicle, state_id, state_hash],
        )


@pytest.mark.asyncio
async def test_attest_state_invalid_account(contract_factory):
    """Should fail when attesting from owner instead of signer"""
    _, owner_account, _, contract = contract_factory

    state_id = 1
    state_hash = 1234
    with pytest.raises(StarkException):
        # Attest with owner rather than delegate signer
        await owner_account.signer.send_transaction(
            account=owner_account.contract,
            to=contract.contract_address,
            selector_name="attest_state",
            calldata=[some_vehicle, state_id, state_hash],
        )


@pytest.mark.asyncio
async def test_attest_state_no_account(contract_factory):
    """Should fail to commit state if no account signed the tx"""
    _, _, _, contract = contract_factory

    with pytest.raises(StarkException):
        # Transaction not sent through an account
        await contract.attest_state(
            vehicle_id=some_vehicle,
            state_id=5,
            state_hash=4567,
        ).invoke()


@pytest.mark.asyncio
async def test_attest_state(contract_factory):
    """Should successfully attest to a state hash"""
    _, _, signer_account, contract = contract_factory

    state_id = 1
    state_hash = 1234
    await signer_account.signer.send_transaction(
        account=signer_account.contract,
        to=contract.contract_address,
        selector_name="attest_state",
        calldata=[some_vehicle, state_id, state_hash],
    )

    # Check the state hash was committed
    observed_state = await contract.get_state(
        vehicle_id=some_vehicle, state_id=state_id
    ).call()
    assert observed_state.result == (state_hash,)


@pytest.mark.asyncio
async def test_set_signer_invalid_account(contract_factory):
    """Should fail to update the signer if the wrong account calls it"""
    _, _, signer_account, contract = contract_factory

    some_new_signer_address = 88888888
    with pytest.raises(StarkException):
        # Send transaction with the delegated signer not the owner
        await signer_account.signer.send_transaction(
            account=signer_account.contract,
            to=contract.contract_address,
            selector_name="set_signer",
            calldata=[some_vehicle, some_new_signer_address],
        )


@pytest.mark.asyncio
async def test_set_signer_no_account(contract_factory):
    """Should fail to update the signer if no account signed the tx"""
    _, _, _, contract = contract_factory

    some_new_signer_address = 88888888
    with pytest.raises(StarkException):
        # Transaction not sent through an account
        await contract.set_signer(
            vehicle_id=some_vehicle,
            signer_address=some_new_signer_address,
        ).invoke()


@pytest.mark.asyncio
async def test_set_signer(contract_factory):
    """Should successfully update the signer for the car"""
    _, owner_account, _, contract = contract_factory

    some_new_signer_address = 88888888
    await owner_account.signer.send_transaction(
        account=owner_account.contract,
        to=contract.contract_address,
        selector_name="set_signer",
        calldata=[some_vehicle, some_new_signer_address],
    )

    # Check that the signer is updated
    observed_signer = await contract.get_signer(vehicle_id=some_vehicle).call()
    assert observed_signer.result == (some_new_signer_address,)
