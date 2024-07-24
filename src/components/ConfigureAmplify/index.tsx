"use client";

import { Amplify } from "aws-amplify";

Amplify.configure({
    Auth: {
        Cognito: {
            userPoolId: process.env.NEXT_PUBLIC_USERPOOL_ID!,
            userPoolClientId: process.env.NEXT_PUBLIC_USERPOOL_CLIENT_ID!,
        }
    },
}, { ssr: true });

export default function ConfigureAmplifyClientSide() {
  return null;
}