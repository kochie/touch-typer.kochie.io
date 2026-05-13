"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@/lib/supabase-provider";
import { Field, Form, Formik } from "formik";
import { toast } from "react-toastify";
import { Notification } from "@/components/Notification";
import Image from "next/image";
import { useTheme } from "next-themes";

function ThemedLogo() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const logoSrc =
    mounted && resolvedTheme === "dark" ? "/logo-white.svg" : "/logo-ink.svg";
  return (
    <Image
      src={logoSrc}
      alt="Touch Typer"
      width={730}
      height={284}
      className="mx-auto h-10 w-auto"
    />
  );
}

export default function SetPasswordPage() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setHasSession(!!session);
      setChecking(false);
      if (!session) {
        router.replace("/signin");
      }
    };
    check();
  }, [supabase, router]);

  if (checking) {
    return (
      <div className="flex min-h-full flex-1 flex-col justify-center items-center px-6 py-12">
        <p className="text-fg/70">Loading...</p>
      </div>
    );
  }

  if (!hasSession) {
    return null;
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-bg-elevated">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <ThemedLogo />
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-fg">
          Set new password
        </h2>
        <p className="mt-2 text-center text-sm text-fg/70">
          Enter your new password below.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <Formik
          initialValues={{ password: "", confirmPassword: "" }}
          validate={(values) => {
            const errors: Record<string, string> = {};
            if (values.password.length < 6) {
              errors.password = "At least 6 characters";
            }
            if (values.password !== values.confirmPassword) {
              errors.confirmPassword = "Passwords do not match";
            }
            return errors;
          }}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const { error } = await supabase.auth.updateUser({
                password: values.password,
              });
              if (error) throw error;
              toast(Notification, {
                type: "success",
                data: {
                  title: "Password updated",
                  message: "You can now sign in with your new password.",
                  type: "success",
                },
              });
              router.replace("/account");
              router.refresh();
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : "Failed to update password";
              toast(Notification, {
                type: "error",
                data: { title: "Error", message, type: "error" },
              });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting, errors }) => (
            <Form className="space-y-6 bg-bg rounded-xl shadow-xl p-8">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-fg"
                >
                  New password
                </label>
                <div className="mt-2">
                  <Field
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-fg shadow-sm ring-1 ring-inset ring-border placeholder:text-fg/40 focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-bad">{errors.password}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium leading-6 text-fg"
                >
                  Confirm password
                </label>
                <div className="mt-2">
                  <Field
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-fg shadow-sm ring-1 ring-inset ring-border placeholder:text-fg/40 focus:ring-2 focus:ring-inset focus:ring-accent sm:text-sm"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-bad">{errors.confirmPassword}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full justify-center rounded-md bg-accent px-3 py-1.5 text-sm font-semibold leading-6 text-paper shadow-sm hover:bg-accent-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
              >
                {isSubmitting ? "Updating..." : "Update password"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
