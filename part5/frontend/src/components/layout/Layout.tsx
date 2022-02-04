import { Box } from "@chakra-ui/react";
import { ReactNode } from "react";

import { Footer, Header } from ".";

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <Box margin="0 auto" h="100%" maxWidth={800} transition="0.5s ease-out">
      <Box p="8" h="full" d="flex" flexDirection="column">
        <Header />
        <Box flex="1 1 auto" as="main" marginY={22}>
          {children}
        </Box>
        <Footer />
      </Box>
    </Box>
  );
};

export default Layout;
