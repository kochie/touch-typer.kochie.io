import { cookies } from "next/headers";
import { Field, Input, Label } from "@headlessui/react";
import { fetchAuthSession, fetchUserAttributes } from "aws-amplify/auth/server";
import { UserDetails } from "./UserDetails";
import { runWithAmplifyServerContext } from "@/utils/amplify-utils";
import { generateServerClientUsingCookies } from "@aws-amplify/adapter-nextjs/dist/esm/api";
import { StripeCheckout } from "../Payment";


// const amplify = generateServerClientUsingCookies({
//   config: {
//     Auth: {
//         Cognito: {
//             userPoolId: process.env.NEXT_PUBLIC_USERPOOL_ID!,
//             userPoolClientId: process.env.NEXT_PUBLIC_USERPOOL_CLIENT_ID!,
//         }
//     },
// }, cookies
// })

export default async function AccountSettings() {
  const currentUser = await runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: (contextSpec) => fetchUserAttributes(contextSpec),
  });
  return (
    <div className="flex flex-col gap-5">
      <UserDetails user={currentUser ?? {}} />
      <div className="divide-y divide-gray-200 overflow-hidden bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">Billing Details</div>
        <div className="px-4 py-5 sm:p-6">
          <BillingPlans />
        </div>
      </div>
    </div>
  );
}

function Loading() {
  return <div>Loading...</div>;
}


function BillingPlans() {
  return (
    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
      <Field className="sm:col-span-5">
        <Label
          htmlFor="first-name"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Name
        </Label>
        <div className="mt-2">
          <Input
            id="first-name"
            name="first-name"
            type="text"
            autoComplete="given-name"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </Field>
    </div>
  );
}
