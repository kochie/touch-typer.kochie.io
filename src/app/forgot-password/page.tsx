"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/assets/logo-dark.png";
import { useSupabaseClient } from "@/lib/supabase-provider";
import { toast } from "react-toastify";
import { Notification } from "@/components/Notification";
import { Field, Form, Formik } from "formik";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";

// Base URL for auth redirects. Prefer NEXT_PUBLIC_SITE_URL in production so the redirect
// we send to Supabase is correct. The link in the reset email is also controlled by
// Supabase Dashboard → Authentication → URL Configuration → Site URL (set that to your
// production URL, e.g. https://touch-typer.kochie.io).
function getAuthBaseUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL ?? "";
}

export default function ForgotPasswordPage() {
  const supabase = useSupabaseClient();
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  const baseUrl = getAuthBaseUrl();
  const callbackUrl = `${baseUrl}/auth/callback?next=/auth/set-password`;

  return (
    <div className="min-h-screen bg-bg-elevated flex flex-col justify-center items-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            alt="Touch Typer Logo"
            src={Logo}
            className="mx-auto h-10 w-auto"
          />
          <Eyebrow className="mt-6 block">Account</Eyebrow>
          <h1 className="mt-3 text-3xl font-bold text-fg">
            Reset password
          </h1>
          <p className="mt-2 text-sm text-fg/60">
            Enter your email and we&apos;ll send you a link to set a new password.
          </p>
        </div>

        {!sent ? (
          <Formik
            initialValues={{ email: "" }}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const { error } = await supabase.auth.resetPasswordForEmail(
                  values.email,
                  { redirectTo: callbackUrl }
                );
                if (error) throw error;
                setEmail(values.email);
                setSent(true);
                toast(Notification, {
                  type: "success",
                  data: {
                    title: "Check your email",
                    message: "We sent a password reset link to your email.",
                    type: "success",
                  },
                });
              } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Something went wrong";
                toast(Notification, {
                  type: "error",
                  data: { title: "Error", message, type: "error" },
                });
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting }) => (
              <Card tone="paper">
                <Form className="space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium leading-6 text-fg"
                    >
                      Email address
                    </label>
                    <div className="mt-2">
                      <Field
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="block w-full rounded-md border border-border bg-bg py-1.5 text-fg shadow-sm placeholder:text-fg/40 focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-sm"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    variant="accent"
                    size="md"
                    disabled={isSubmitting}
                    className="w-full justify-center"
                  >
                    {isSubmitting ? "Sending..." : "Send reset link"}
                  </Button>
                </Form>
              </Card>
            )}
          </Formik>
        ) : (
          <Card tone="paper">
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-green-800">Check your email</h3>
                <p className="mt-1 text-sm text-green-700">
                  We sent a password reset link to <strong>{email}</strong>. Click the link to set a new password.
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const { error } = await supabase.auth.resetPasswordForEmail(
                    email,
                    { redirectTo: callbackUrl }
                  );
                  if (error) {
                    toast(Notification, {
                      type: "error",
                      data: { title: "Error", message: error.message, type: "error" },
                    });
                  } else {
                    toast(Notification, {
                      type: "success",
                      data: {
                        title: "Email sent",
                        message: "Reset link resent.",
                        type: "success",
                      },
                    });
                  }
                }}
                className="text-sm text-accent hover:text-accent-deep"
              >
                Resend reset link
              </button>
            </div>
          </Card>
        )}

        <p className="mt-10 text-center text-sm text-fg/60">
          <Link
            href="/signin"
            className="font-semibold leading-6 text-accent hover:text-accent-deep"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
