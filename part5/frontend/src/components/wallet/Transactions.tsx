import { Box, Text, useBreakpointValue, useColorMode } from "@chakra-ui/react";

import { useStarknet, useTransactions } from "context";

const Transactions = () => {
  const { transactions } = useTransactions();
  const { connected } = useStarknet();
  const { colorMode } = useColorMode();
  const textSize = useBreakpointValue({
    base: "xs",
    sm: "md",
  });

  return (
    <Box>
      <Text as="h2" marginTop={4} fontSize="2xl">
        Transactions
      </Text>
      {connected &&
        transactions !== undefined &&
        transactions.length > 0 &&
        transactions.map((tx) => {
          return (
            <Box
              backgroundColor={colorMode === "light" ? "gray.200" : "gray.500"}
              padding={4}
              marginTop={4}
              borderRadius={4}
            >
              <Box fontSize={textSize}>{tx}</Box>
            </Box>
          );
        })}
      {connected && (transactions === undefined || transactions.length === 0) && (
        <Box
          backgroundColor={colorMode === "light" ? "gray.200" : "gray.500"}
          padding={4}
          marginTop={4}
          borderRadius={4}
        >
          <Box fontSize={textSize}>No Transactions</Box>
        </Box>
      )}
      {!connected && (
        <Box
          backgroundColor={colorMode === "light" ? "gray.200" : "gray.500"}
          padding={4}
          marginTop={4}
          borderRadius={4}
        >
          <Box fontSize={textSize}>
            Connect your wallet to view a list of your transactions.
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Transactions;
