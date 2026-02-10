import { createServerSupabaseClient } from "@/lib/supabase-server";
import { UserDetails } from "./UserDetails";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { MfaSection } from "./MfaSection";
import PricingPlans from "../PlanSelection";

export default async function AccountSettings() {
  const supabase = await createServerSupabaseClient();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p>Please sign in to view your account settings.</p>
      </div>
    );
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Get subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Format user data for UserDetails component
  const userData = {
    email: user.email,
    name: profile?.name || user.user_metadata?.name,
    preferred_username: profile?.preferred_username,
    phone_number: profile?.phone_number,
  };

  // Format subscription for PricingPlans component
  const subscriptionData = subscription ? {
    billing_plan: subscription.billing_plan,
    billing_period: subscription.billing_period,
    next_billing_date: subscription.next_billing_date,
    auto_renew: subscription.auto_renew,
    status: subscription.status,
  } : {
    billing_plan: 'free',
    billing_period: null,
    next_billing_date: null,
    auto_renew: false,
    status: 'active',
  };

  return (
    <div className="flex flex-col gap-5">
      <UserDetails user={userData} />
      <ChangePasswordForm />
      <MfaSection />
      <div className="divide-y divide-gray-200 overflow-hidden bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">Subscription Plans</div>
        <div className="px-4 py-5 sm:p-6">
          <PricingPlans subscription={subscriptionData} />
        </div>
      </div>
    </div>
  );
}
