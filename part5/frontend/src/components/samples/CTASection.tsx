import { Box, Button, Flex, Image, Link } from "@chakra-ui/react";
import { AiFillGithub } from "react-icons/ai";

const repoLink = "https://github.com/sambarnes/box";

const CTASection = () => {
  return (
    <Box textAlign="center" marginTop={8}>
      <Flex justifyContent="center" alignItems="center" gridGap={2}>
        <Button
          as="a"
          href="https://hackmd.io/qmEGESwmTT-By3wgyCMX-Q?view"
          target="_blank"
          size="sm"
        >
          Read the Tutorials
        </Button>
        <Button
          as="a"
          href={repoLink}
          target="_blank"
          leftIcon={<AiFillGithub />}
          size="sm"
        >
          Open in Github
        </Button>
        <Link href={repoLink} isExternal>
          <Image
            align="center"
            src="https://img.shields.io/github/stars/sambarnes/box?style=social"
            alt="github stars"
          />
        </Link>
      </Flex>
    </Box>
  );
};

export default CTASection;
