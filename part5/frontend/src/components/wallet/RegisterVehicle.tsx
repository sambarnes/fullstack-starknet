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

import { useStarknet } from "context";
import React from "react";

const RegisterVehicle = () => {
  const CONTRACT_ADDRESS =
    "0x04f2d8ea9774229a040924c37b12a9244bae7451000502612340488e659206f2";

  const { connected, library, account } = useStarknet();
  const { colorMode } = useColorMode();
  const textSize = useBreakpointValue({
    base: "xs",
    sm: "md",
  });

  const { getSelectorFromName } = stark;
  const selector = getSelectorFromName("register_vehicle");

  const registerVehicle = async (vehicleId: string) => {
    const account_big = BigInt(account!);
    const account_address_param = account_big.toString(10);;
    const registerVehicleResponse = await library.addTransaction({
      type: "INVOKE_FUNCTION",
      contract_address: CONTRACT_ADDRESS,
      entry_point_selector: selector,
      calldata: [
        vehicleId,
        account_address_param, // signer address (same as owner for simplicity)
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
            variant="flushed"
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
            Register Vehicle
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
