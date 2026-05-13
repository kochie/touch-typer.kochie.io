"use client";

import { useEffect, useState } from "react";
import { Formik, Field, Form } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useSupabaseClient } from "@/lib/supabase-provider";
import { toast } from "react-toastify";
import { Notification } from "../Notification";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";

type SignInMode = "password" | "magic_link";

export default function SignIn() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const logoSrc =
    mounted && resolvedTheme === "dark" ? "/logo-color.svg" : "/logo-ink.svg";
  const [mode, setMode] = useState<SignInMode>("password");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState("");

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const callbackUrl = `${origin}/auth/callback`;

  return (
    <div className="min-h-screen bg-bg-elevated flex flex-col justify-center items-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src={logoSrc}
            alt="Touch Typer"
            width={730}
            height={284}
            className="mx-auto h-10 w-auto"
          />
          <Eyebrow className="mt-6 block">Account</Eyebrow>
          <h1 className="mt-3 text-3xl font-bold text-fg">
            Sign in
          </h1>
        </div>

        <div className="flex rounded-lg border border-border bg-bg p-1 mb-6">
          <button
            type="button"
            onClick={() => setMode("password")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              mode === "password"
                ? "bg-accent text-paper shadow"
                : "text-fg/70 hover:bg-bg-elevated"
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => setMode("magic_link")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              mode === "magic_link"
                ? "bg-accent text-paper shadow"
                : "text-fg/70 hover:bg-bg-elevated"
            }`}
          >
            Email link
          </button>
        </div>

        {mode === "password" && (
          <Formik
            initialValues={{ email: "", password: "" }}
            onSubmit={async ({ email, password }, { setSubmitting }) => {
              try {
                const { error } = await supabase.auth.signInWithPassword({
                  email,
                  password,
                });

                if (error) {
                  toast(Notification, {
                    type: "error",
                    data: {
                      title: "Error Signing In",
                      message: error.message,
                      type: "error",
                    },
                  });
                  return;
                }

                router.replace("/account");
                router.refresh();
              } catch (error: unknown) {
                const message = error instanceof Error ? error.message : "An unexpected error occurred";
                toast(Notification, {
                  type: "error",
                  data: { title: "Error Signing In", message, type: "error" },
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
                        required
                        autoComplete="email"
                        className="block w-full rounded-md border border-border bg-bg py-2.5 sm:py-1.5 text-base text-fg shadow-sm placeholder:text-fg/40 focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium leading-6 text-fg"
                      >
                        Password
                      </label>
                      <div className="text-sm">
                        <Link
                          href="/forgot-password"
                          className="font-semibold text-accent hover:text-accent-deep"
                        >
                          Forgot password?
                        </Link>
                      </div>
                    </div>
                    <div className="mt-2">
                      <Field
                        id="password"
                        name="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        className="block w-full rounded-md border border-border bg-bg py-2.5 sm:py-1.5 text-base text-fg shadow-sm placeholder:text-fg/40 focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-sm sm:leading-6"
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
                    {isSubmitting ? "Signing in..." : "Sign in"}
                  </Button>
                </Form>
              </Card>
            )}
          </Formik>
        )}

        {mode === "magic_link" && !magicLinkSent && (
          <Formik
            initialValues={{ email: "" }}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const { error } = await supabase.auth.signInWithOtp({
                  email: values.email,
                  options: { emailRedirectTo: callbackUrl },
                });
                if (error) throw error;
                setMagicLinkEmail(values.email);
                setMagicLinkSent(true);
                toast(Notification, {
                  type: "success",
                  data: {
                    title: "Check your email",
                    message: "We sent you a sign-in link. Click it to sign in.",
                    type: "success",
                  },
                });
              } catch (error: unknown) {
                const message = error instanceof Error ? error.message : "Something went wrong";
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
                      htmlFor="magic-email"
                      className="block text-sm font-medium leading-6 text-fg"
                    >
                      Email address
                    </label>
                    <div className="mt-2">
                      <Field
                        id="magic-email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        className="block w-full rounded-md border border-border bg-bg py-2.5 sm:py-1.5 text-base text-fg shadow-sm placeholder:text-fg/40 focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-sm sm:leading-6"
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
                    {isSubmitting ? "Sending link..." : "Send sign-in link"}
                  </Button>
                </Form>
              </Card>
            )}
          </Formik>
        )}

        {mode === "magic_link" && magicLinkSent && (
          <Card tone="paper">
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-green-800">Check your email</h3>
                <p className="mt-1 text-sm text-green-700">
                  We sent a sign-in link to <strong>{magicLinkEmail}</strong>. Click the link to sign in.
                </p>
              </div>
              <p className="text-xs text-fg/60">
                Link expires in about an hour. You can request a new link below.
              </p>
              <button
                type="button"
                onClick={() => setMagicLinkSent(false)}
                className="text-sm text-accent hover:text-accent-deep"
              >
                Send another link
              </button>
            </div>
          </Card>
        )}

        <p className="mt-10 text-center text-sm text-fg/60">
          Not a member?{" "}
          <Link
            href="/signup"
            className="font-semibold leading-6 text-accent hover:text-accent-deep"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
