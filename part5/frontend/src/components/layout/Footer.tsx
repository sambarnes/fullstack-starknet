import { Flex, Link, Text } from "@chakra-ui/react";

const Footer = () => {
  return (
    <Flex as="footer" width="full" align="center">
      <Text>
        {new Date().getFullYear()} -{" "}
        <Link
          textDecoration="none !important"
          outline="none !important"
          boxShadow="none !important"
          href="https://github.com/sambarnes/"
          isExternal
        >
          github.com/sambarnes
        </Link>
      </Text>
    </Flex>
  );
};

export default Footer;
