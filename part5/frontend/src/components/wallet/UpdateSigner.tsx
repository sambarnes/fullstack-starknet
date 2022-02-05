import {
  Box,
  Button,
  Input,
  Text,
  useBreakpointValue,
  useColorMode,
} from "@chakra-ui/react";
import { stark } from "starknet";

import { CONTRACT_ADDRESS } from "./consts";
import { useStarknet } from "context";
import React from "react";

const UpdateSigner = () => {
  const { connected, library, account } = useStarknet();
  const { colorMode } = useColorMode();
  const textSize = useBreakpointValue({
    base: "xs",
    sm: "md",
  });

  const { getSelectorFromName } = stark;
  const selector = getSelectorFromName("set_signer");

  const updateSigner = async (vehicleId: string, newSignerAddress: string) => {
    const accountAddressParam = BigInt(newSignerAddress!).toString(10);
    const setSignerResponse = await library.addTransaction({
      type: "INVOKE_FUNCTION",
      contract_address: CONTRACT_ADDRESS,
      entry_point_selector: selector,
      calldata: [
        vehicleId,
        accountAddressParam,
      ],
    });
    // eslint-disable-next-line no-console
    console.log(setSignerResponse);
  };

  const [vehicleId, setVehicleId] = React.useState('');
  const [vehicleSignerAddress, setSignerAddress] = React.useState('');
  const handleVehicleIdChange = (event: any) => setVehicleId(event.target.value);
  const handleSignerAddressChange = (event: any) => setSignerAddress(event.target.value);

  return (
    <Box>
      <Text as="h2" marginTop={4} fontSize="2xl">
        Update Signing Authority
      </Text>
      <Text marginTop={4}>
        Vehicle signing key lost? Compromised and not able to be updated in the account?
        <br />
        Use your vehicle owner's account to authorize a different account to sign state commitments.
      </Text>

      {connected && (
        <Box d="flex" flexDirection="column">
          <Input
            my={4}
            placeholder="Vehicle ID"
            onChange={handleVehicleIdChange}
          />
          <Input
            my={4}
            placeholder="Signer Account Address (0x...)"
            onChange={handleSignerAddressChange}
          />
          <Button
            my={4}
            w="fit-content"
            onClick={() => {
              updateSigner(vehicleId, vehicleSignerAddress);
            }}
          >
            Update
          </Button>
        </Box>
      )}

      {!connected && (
        <Box d="flex" flexDirection="column">
          <Box
            backgroundColor={colorMode === "light" ? "gray.200" : "gray.500"}
            padding={4}
            marginTop={4}
            borderRadius={4}
          >
            <Box fontSize={textSize}>
              Connect your wallet to change the authorized signer account.
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default UpdateSigner;
