# The "%lang" directive declares this code as a StarkNet contract.
%lang starknet

# The "%builtins" directive declares the builtins used by the contract.
# For example, the "range_check" builtin is used to compare values.
%builtins pedersen range_check ecdsa

from starkware.cairo.common.cairo_builtins import HashBuiltin, SignatureBuiltin
from starkware.cairo.common.hash import hash2
from starkware.cairo.common.math import assert_not_zero
from starkware.cairo.common.signature import verify_ecdsa_signature
from starkware.starknet.common.syscalls import get_tx_signature

#
# Storage
#

# Who owns/controls the car (can update signing authority)
@storage_var
func vehicle_owner_public_key(vehicle_id : felt) -> (public_key : felt):
end

# Who signs commitments on behalf of the car
@storage_var
func vehicle_signer_public_key(vehicle_id : felt) -> (public_key : felt):
end

# Hashes for vehicle state at nonce
@storage_var
func vehicle_state(vehicle_id : felt, nonce : felt) -> (state_hash : felt):
end

# Stores the nonce expected for the next transaction (including key management & state commitments)
@storage_var
func vehicle_nonce(vehicle_id : felt) -> (nonce : felt):
end

#
# Getters
#

@view
func get_owner{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        vehicle_id : felt) -> (public_key : felt):
    let (public_key) = vehicle_owner_public_key.read(vehicle_id=vehicle_id)
    return (public_key=public_key)
end

@view
func get_signer{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        vehicle_id : felt) -> (public_key : felt):
    let (public_key) = vehicle_signer_public_key.read(vehicle_id=vehicle_id)
    return (public_key=public_key)
end

@view
func get_state{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        vehicle_id : felt, nonce : felt) -> (state_hash : felt):
    let (state_hash) = vehicle_state.read(vehicle_id=vehicle_id, nonce=nonce)
    return (state_hash=state_hash)
end

@view
func get_nonce{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        vehicle_id : felt) -> (nonce : felt):
    let (nonce) = vehicle_nonce.read(vehicle_id=vehicle_id)
    return (nonce=nonce)
end

#
# Setters
#

# Initializes the vehicle with a given owner & signer
@external
func register_vehicle{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
        vehicle_id : felt, owner_public_key : felt, signer_public_key : felt):
    # Verify that the vehicle ID is available
    let (is_vehicle_id_taken) = vehicle_owner_public_key.read(vehicle_id=vehicle_id)
    assert is_vehicle_id_taken = 0
    # In cairo, everything uninitialized will by default have a zero value. It is
    # important to keep this in mind when designing your contracts, as it will be
    # difficult to distinguish between a variable explicitly set to zero and one
    # that simply hasn't been initialized yet.

    # Initialize the vehicle's owner and signer
    vehicle_owner_public_key.write(vehicle_id=vehicle_id, value=owner_public_key)
    vehicle_signer_public_key.write(vehicle_id=vehicle_id, value=signer_public_key)

    # Because this function isn't signed, there is no need to increment the vehicle nonce.
    return ()
end

# Vehicle signers can attest to a state hash -- data storage & verification off-chain
@external
func attest_state{
        syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr,
        ecdsa_ptr : SignatureBuiltin*}(vehicle_id : felt, nonce : felt, state_hash : felt):
    # Note the addition of an ecdsa_ptr implicit argument, this is required in functions
    # that verify ECDSA signatures.

    # Verify the vehicle has been registered with a signer
    let (signer_public_key) = vehicle_signer_public_key.read(vehicle_id=vehicle_id)
    assert_not_zero(signer_public_key)

    # Make sure the current nonce was used
    let (expected_nonce) = vehicle_nonce.read(vehicle_id=vehicle_id)
    assert expected_nonce - nonce = 0

    # Expected Signed Message = H( nonce + H( vehicle_id , H( signer_public_key ) ) )
    let (h1) = hash2{hash_ptr=pedersen_ptr}(state_hash, 0)
    let (h2) = hash2{hash_ptr=pedersen_ptr}(vehicle_id, h1)
    let (message_hash) = hash2{hash_ptr=pedersen_ptr}(nonce, h2)

    # Verify signature is valid and covers the expected signed message
    let (sig_len : felt, sig : felt*) = get_tx_signature()
    assert sig_len = 2  # ECDSA signatures have two parts, r and s
    verify_ecdsa_signature(
        message=message_hash, public_key=signer_public_key, signature_r=sig[0], signature_s=sig[1])
    # If the contract passes ^this line, the signaure verification passed.
    # Otherwise, the execution would halt and the transaction would revert.

    # Register state & increment nonce
    vehicle_state.write(vehicle_id=vehicle_id, nonce=nonce, value=state_hash)
    vehicle_nonce.write(vehicle_id=vehicle_id, value=nonce + 1)
    return ()
end

# Vehicle owners can change the signing authority for a car they own
@external
func set_signer{
        syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr,
        ecdsa_ptr : SignatureBuiltin*}(vehicle_id : felt, nonce : felt, signer_public_key : felt):
    # Verify the vehicle has been registered with an owner
    let (owner_public_key) = vehicle_owner_public_key.read(vehicle_id=vehicle_id)
    assert_not_zero(owner_public_key)

    # Make sure the current nonce was used
    let (expected_nonce) = vehicle_nonce.read(vehicle_id=vehicle_id)
    assert expected_nonce - nonce = 0

    # Verify signature
    # Signed Message = H( nonce + H( vehicle_id , H( signer_public_key ) ) )
    let (h1) = hash2{hash_ptr=pedersen_ptr}(signer_public_key, 0)
    let (h2) = hash2{hash_ptr=pedersen_ptr}(vehicle_id, h1)
    let (message_hash) = hash2{hash_ptr=pedersen_ptr}(nonce, h2)
    let (sig_len : felt, sig : felt*) = get_tx_signature()
    assert sig_len = 2
    verify_ecdsa_signature(
        message=message_hash, public_key=owner_public_key, signature_r=sig[0], signature_s=sig[1])

    # Update signer & increment nonce
    vehicle_signer_public_key.write(vehicle_id=vehicle_id, value=signer_public_key)
    vehicle_nonce.write(vehicle_id=vehicle_id, value=nonce + 1)
    return ()
end
