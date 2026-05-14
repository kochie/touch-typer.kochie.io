import { redirect } from "next/navigation";
import AccountSettings from "@/components/AccountSettings";
import { OpenInAppBanner } from "@/components/OpenInAppBanner";
import SignOutButton from "@/components/SignOutButton";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SubscriptionCard } from "@/components/AccountSettings/SubscriptionCard";
import { getUserAndSubscription } from "@/lib/get-user-and-subscription";
import { Suspense } from "react";

export default async function AccountPage() {
  const { user, subscription } = await getUserAndSubscription();
  if (!user) redirect("/signin");

  return (
    <main>
      <Section tone="paper-soft" density="default">
        <Container width="wide">
          <Suspense fallback={null}>
            <OpenInAppBanner />
          </Suspense>
          <Eyebrow>Account</Eyebrow>
          <h1 className="mt-3 text-3xl font-bold text-fg">Your account</h1>
          <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="grid grid-cols-1 gap-6 lg:col-span-2">
              <SubscriptionCard subscription={subscription} />
              <Suspense>
                <AccountSettings />
              </Suspense>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <SettingsMenu />
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}

function SettingsMenu() {
  return (
    <div className="flex flex-col gap-5 sticky">
      <div className="overflow-hidden bg-bg shadow-sm rounded-xl border border-border">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg leading-6 font-medium text-fg">
              Settings
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-fg/60">
              Manage your account settings.
            </p>
            <div className="">
              <SignOutButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
