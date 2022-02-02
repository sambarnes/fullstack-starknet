# The "%lang" directive declares this code as a StarkNet contract.
%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin, SignatureBuiltin
from starkware.cairo.common.math import assert_not_zero
from starkware.starknet.common.syscalls import get_caller_address

#
# Storage
#

# Who owns/controls the car (can update signing authority)
@storage_var
func vehicle_owner_address(vehicle_id : felt) -> (address : felt):
end

# Who signs commitments on behalf of the car
@storage_var
func vehicle_signer_address(vehicle_id : felt) -> (address : felt):
end

# Hashes for vehicle state at some id
@storage_var
func vehicle_state(vehicle_id : felt, state_id : felt) -> (state_hash : felt):
end

#
# Getters
#

@view
func get_owner{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        vehicle_id : felt) -> (owner_address : felt):
    let (owner_address) = vehicle_owner_address.read(vehicle_id=vehicle_id)
    return (owner_address=owner_address)
end

@view
func get_signer{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        vehicle_id : felt) -> (signer_address : felt):
    let (signer_address) = vehicle_signer_address.read(vehicle_id=vehicle_id)
    return (signer_address=signer_address)
end

@view
func get_state{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        vehicle_id : felt, state_id : felt) -> (state_hash : felt):
    let (state_hash) = vehicle_state.read(vehicle_id=vehicle_id, state_id=state_id)
    return (state_hash=state_hash)
end

#
# Setters
#

# Initializes the vehicle with a given owner & signer
@external
func register_vehicle{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        vehicle_id : felt, signer_address : felt):
    # Verify that the vehicle ID is available
    let (is_vehicle_id_taken) = vehicle_owner_address.read(vehicle_id=vehicle_id)
    assert is_vehicle_id_taken = 0

    # Caller is the owner. Verify caller & signer are non zero
    let (owner_address) = get_caller_address()
    assert_not_zero(owner_address)
    assert_not_zero(signer_address)

    # Initialize the vehicle's owner and signer
    vehicle_owner_address.write(vehicle_id=vehicle_id, value=owner_address)
    vehicle_signer_address.write(vehicle_id=vehicle_id, value=signer_address)
    return ()
end

# Vehicle signers can attest to a state hash -- data storage & verification off-chain
@external
func attest_state{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        vehicle_id : felt, state_id : felt, state_hash : felt):
    # Verify the vehicle has been registered & the caller is the signer
    let (signer_address) = vehicle_signer_address.read(vehicle_id=vehicle_id)
    let (caller) = get_caller_address()
    assert_not_zero(caller)
    assert signer_address = caller

    # Make sure a unique state id was used
    let (state) = vehicle_state.read(vehicle_id=vehicle_id, state_id=state_id)
    assert state = 0

    # Register state
    vehicle_state.write(vehicle_id=vehicle_id, state_id=state_id, value=state_hash)
    return ()
end

# Vehicle owners can change the signing authority for a car they own
@external
func set_signer{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        vehicle_id : felt, signer_address : felt):
    # Verify the vehicle has been registered & the caller is the owner
    let (owner_address) = vehicle_owner_address.read(vehicle_id=vehicle_id)
    let (caller) = get_caller_address()
    assert_not_zero(caller)
    assert owner_address = caller

    # Update signer & increment nonce
    vehicle_signer_address.write(vehicle_id=vehicle_id, value=signer_address)
    return ()
end
