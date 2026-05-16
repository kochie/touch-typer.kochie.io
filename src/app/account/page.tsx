import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getUserAndSubscription } from "@/lib/get-user-and-subscription";
import { OpenInAppBanner } from "@/components/OpenInAppBanner";
import SignOutButton from "@/components/SignOutButton";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { AccountHero } from "@/components/AccountSettings/AccountHero";
import { SectionNav } from "@/components/AccountSettings/SectionNav";
import { SubscriptionCard } from "@/components/AccountSettings/SubscriptionCard";
import { UserDetails } from "@/components/AccountSettings/UserDetails";
import { ChangePasswordForm } from "@/components/AccountSettings/ChangePasswordForm";
import { MfaSection } from "@/components/AccountSettings/MfaSection";
import { DeleteAccountDialog } from "@/components/AccountSettings/DeleteAccountDialog";

export default async function AccountPage() {
  const { user, subscription } = await getUserAndSubscription();
  if (!user) redirect("/signin");

  const supabase = await createServerSupabaseClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, preferred_username, phone_number")
    .eq("id", user.id)
    .single();

  const userData = {
    email: user.email,
    name: profile?.name,
    preferred_username: profile?.preferred_username,
    phone_number: profile?.phone_number,
  };

  return (
    <main>
      <Section tone="paper-soft" density="default">
        <Container width="default">
          <Suspense fallback={null}>
            <OpenInAppBanner />
          </Suspense>

          <AccountHero user={user} subscription={subscription} />

          <div className="mt-12 grid gap-10 lg:grid-cols-[180px_1fr] lg:gap-16">
            <SectionNav />

            <div className="flex min-w-0 flex-col gap-12">
              <AccountSection id="profile" title="Profile">
                <UserDetails user={userData} />
              </AccountSection>

              <AccountSection id="security" title="Security">
                <div className="flex flex-col gap-5">
                  <ChangePasswordForm />
                  <MfaSection />
                </div>
              </AccountSection>

              <AccountSection id="subscription" title="Subscription">
                <SubscriptionCard subscription={subscription} />
              </AccountSection>

              <AccountSection
                id="danger"
                title="Danger zone"
                tone="danger"
                description="Irreversible actions. Proceed with care."
              >
                <div className="flex flex-col gap-4 rounded-xl border border-red-500/30 bg-red-500/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-fg">Sign out of this device</div>
                    <p className="text-sm text-fg/60">
                      You can sign back in any time.
                    </p>
                  </div>
                  <SignOutButton />
                </div>

                <div className="mt-4 flex flex-col gap-4 rounded-xl border border-red-500/30 bg-red-500/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-fg">Delete account</div>
                    <p className="text-sm text-fg/60">
                      Permanently remove your account, results, goals, and subscription. This cannot be undone.
                    </p>
                  </div>
                  <DeleteAccountDialog userEmail={user.email} />
                </div>
              </AccountSection>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}

interface AccountSectionProps {
  id: string;
  title: string;
  description?: string;
  tone?: "default" | "danger";
  children: React.ReactNode;
}

function AccountSection({ id, title, description, tone = "default", children }: AccountSectionProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <header className="mb-5">
        <h2
          className={
            tone === "danger"
              ? "text-xl font-semibold text-red-600 dark:text-red-400"
              : "text-xl font-semibold text-fg"
          }
        >
          {title}
        </h2>
        {description && <p className="mt-1 text-sm text-fg/60">{description}</p>}
      </header>
      {children}
    </section>
  );
}
