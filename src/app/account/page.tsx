import AccountSettings from "@/components/AccountSettings";
import { OpenInAppBanner } from "@/components/OpenInAppBanner";
import SignOutButton from "@/components/SignOutButton";
import { Suspense } from "react";

export default function AccountPage() {
  return (
    <div className="min-h-full py-10 bg-slate-200">
      <main className="">
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <Suspense fallback={null}>
            <OpenInAppBanner />
          </Suspense>
          <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3 lg:gap-8 mt-0">
          <div className="grid grid-cols-1 gap-4 lg:col-span-2">
            <Suspense>
              <AccountSettings />
            </Suspense>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <SettingsMenu />
          </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SettingsMenu() {
  return (
    <div className="flex flex-col gap-5 sticky">
      <div className="overflow-hidden bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Settings
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
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
