"use client";

import ConfigureAmplifyClientSide from "@/components/ConfigureAmplify";
import { ToastContainer } from 'react-toastify';
import { ApolloWrapper } from "@/utils/apollo-provider";


import 'react-toastify/dist/ReactToastify.css';

export default function Providers({ children }: React.PropsWithChildren<{}>) {
  return (
    <ApolloWrapper>
      <ToastContainer />
        <ConfigureAmplifyClientSide />
        {children}

    </ApolloWrapper>
  );
}
