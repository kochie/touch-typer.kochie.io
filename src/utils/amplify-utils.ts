// utils/amplify-utils.ts
import { cookies } from "next/headers";

import { createServerRunner } from "@aws-amplify/adapter-nextjs";
import { generateServerClientUsingCookies } from "@aws-amplify/adapter-nextjs/api";
import { getCurrentUser } from "aws-amplify/auth/server";

import { Schema } from "@/utils/resources";
// import outputs from "@/amplify_outputs.json";

console.log("USERPOOL", process.env.NEXT_PUBLIC_USERPOOL_ID);
console.log("CLIENT ID", process.env.NEXT_PUBLIC_USERPOOL_CLIENT_ID);

const outputs = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_USERPOOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_USERPOOL_CLIENT_ID!,
    },
  },
};

console.log(outputs)

export const { runWithAmplifyServerContext } = createServerRunner({
  config: outputs,
});

export const cookiesClient = generateServerClientUsingCookies<Schema>({
  config: outputs,
  cookies,
});

export async function AuthGetCurrentUserServer() {
  try {
    const currentUser = await runWithAmplifyServerContext({
      nextServerContext: { cookies },
      operation: (contextSpec) => getCurrentUser(contextSpec),
    });
    return currentUser;
  } catch (error) {
    console.error(error);
  }
}
