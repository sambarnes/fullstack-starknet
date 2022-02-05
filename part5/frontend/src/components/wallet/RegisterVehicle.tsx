import {
  Box,
  Button,
  Code,
  Input,
  Link,
  Text,
  useBreakpointValue,
  useColorMode,
} from "@chakra-ui/react";
import { stark } from "starknet";

import { CONTRACT_ADDRESS } from "./consts";
import { useStarknet } from "context";
import React from "react";

const RegisterVehicle = () => {
  const { connected, library, account } = useStarknet();
  const { colorMode } = useColorMode();
  const textSize = useBreakpointValue({
    base: "xs",
    sm: "md",
  });

  const { getSelectorFromName } = stark;
  const selector = getSelectorFromName("register_vehicle");

  const registerVehicle = async (vehicleId: string) => {
    const accountAddressParam = BigInt(account!).toString(10);;
    const registerVehicleResponse = await library.addTransaction({
      type: "INVOKE_FUNCTION",
      contract_address: CONTRACT_ADDRESS,
      entry_point_selector: selector,
      calldata: [
        vehicleId,
        accountAddressParam, // signer address (same as owner for simplicity)
      ],
    });
    // eslint-disable-next-line no-console
    console.log(registerVehicleResponse);
  };

  const [value, setValue] = React.useState('');
  const handleChange = (event: any) => setValue(event.target.value);

  return (
    <Box>
      <Text as="h2" marginTop={4} fontSize="2xl">
        Register Vehicle
      </Text>
      <Text marginTop={4}>
        Sign up a new vehicle, registering it to a connected Argent X account.
        The signing authority will default to the owner.
      </Text>
      <Box d="flex" flexDirection="column">
        <Code marginTop={4} w="fit-content">
          contract:
          {/* {`${CONTRACT_ADDRESS.substring(0, 4)}...${CONTRACT_ADDRESS.substring(
            CONTRACT_ADDRESS.length - 4
          )}`} */}
          <Link
            isExternal
            textDecoration="none !important"
            outline="none !important"
            boxShadow="none !important"
            href={`https://voyager.online/contract/${CONTRACT_ADDRESS}`}
          >
            {CONTRACT_ADDRESS}
          </Link>
        </Code>

        {connected && (
          <Input
            my={4}
            placeholder="Vehicle ID"
            onChange={handleChange}
          />
        )}

        {connected && (
          <Button
            my={4}
            w="fit-content"
            onClick={() => {
              registerVehicle(value);
            }}
          >
            Register
          </Button>
        )}

        {!connected && (
          <Box
            backgroundColor={colorMode === "light" ? "gray.200" : "gray.500"}
            padding={4}
            marginTop={4}
            borderRadius={4}
          >
            <Box fontSize={textSize}>
              Connect your wallet to register a vehicle.
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default RegisterVehicle;
