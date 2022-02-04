import { Box, Flex, Heading } from "@chakra-ui/react";
import Link from "next/link";

import { ThemeToggle } from "components/layout";
import { WalletConnect } from "components/wallet";

const Header = () => {
  return (
    <Flex as="header" width="full" align="center">
      <Heading as="h1" size="md">
        <Link href="/">▢ box</Link>
      </Heading>

      <Box marginLeft="auto">
        <ThemeToggle />
        <WalletConnect />
      </Box>
    </Flex>
  );
};

export default Header;
