import { cookies } from "next/headers";
import { fetchUserAttributes } from "aws-amplify/auth/server";
import { UserDetails } from "./UserDetails";
import { runWithAmplifyServerContext } from "@/utils/amplify-utils";
import PricingPlans from "../PlanSelection";
import { getClient } from "@/utils/apollo-client";
import { Plan } from "@/generated/graphql";
import { GET_SUBSCRIPTIONS } from "@/transactions/getSubscription";

export default async function AccountSettings() {
  const currentUser = await runWithAmplifyServerContext({
    nextServerContext: { cookies },
    operation: (contextSpec) => fetchUserAttributes(contextSpec),
  });

  const { data } = await getClient().query<{ subscription: Plan }>({
    query: GET_SUBSCRIPTIONS,
  });

  return (
    <div className="flex flex-col gap-5">
      <UserDetails user={currentUser ?? {}} />
      <div className="divide-y divide-gray-200 overflow-hidden bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">Subscription Plans</div>
        <div className="px-4 py-5 sm:p-6">
          <PricingPlans subscription={data.subscription} />
        </div>
      </div>
    </div>
  );
}
