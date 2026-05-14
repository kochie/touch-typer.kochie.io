import { createServerSupabaseClient } from "@/lib/supabase-server";
import { UserDetails } from "./UserDetails";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { MfaSection } from "./MfaSection";

export default async function AccountSettings() {
  const supabase = await createServerSupabaseClient();

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="bg-bg border border-border rounded-xl p-6">
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

  // Format user data for UserDetails component
  const userData = {
    email: user.email,
    name: profile?.name || user.user_metadata?.name,
    preferred_username: profile?.preferred_username,
    phone_number: profile?.phone_number,
  };

  return (
    <div className="flex flex-col gap-5">
      <UserDetails user={userData} />
      <ChangePasswordForm />
      <MfaSection />
    </div>
  );
}
