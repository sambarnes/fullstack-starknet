/* eslint-disable react/jsx-props-no-spreading */
import { ChakraProvider } from "@chakra-ui/react";
import { EmotionCache } from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { ToastContainer } from "material-react-toastify";
import { DefaultSeo } from "next-seo";
import { AppProps } from "next/app";
import Head from "next/head";
import "@fontsource/lexend/latin.css";

import defaultSEOConfig from "../../next-seo.config";
import { Layout } from "components/layout";
// eslint-disable-next-line import/order
import {
  BlockHashProvider,
  StarknetProvider,
  TransactionsProvider,
} from "context";

import "material-react-toastify/dist/ReactToastify.css";
import createEmotionCache from "styles/createEmotionCache";
import customTheme from "styles/customTheme";
import "styles/globals.css";
// import TransactionsProvider from "context/TransactionsProvider/provider";

const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

const MyApp = ({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache,
}: MyAppProps) => {
  return (
    <StarknetProvider>
      <BlockHashProvider>
        <TransactionsProvider>
          <CacheProvider value={emotionCache}>
            <ChakraProvider theme={customTheme}>
              <Head>
                <meta
                  name="viewport"
                  content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover"
                />
              </Head>
              <DefaultSeo {...defaultSEOConfig} />
              <ToastContainer />
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </ChakraProvider>
          </CacheProvider>
        </TransactionsProvider>
      </BlockHashProvider>
    </StarknetProvider>
  );
};

MyApp.defaultProps = {
  emotionCache: clientSideEmotionCache,
};

export default MyApp;
