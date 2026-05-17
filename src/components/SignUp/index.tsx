"use client";

import { Formik, Field as FormikField, Form } from "formik";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button as HUIButton, Field, Label, Transition } from "@headlessui/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Notification } from "../Notification";
import { useSupabaseClient } from "@/lib/supabase-provider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Eyebrow } from "@/components/ui/Eyebrow";

type SignUpStep = "START_SIGNUP" | "CONFIRM_EMAIL" | "DONE";

export default function SignUp() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const logoSrc =
    mounted && resolvedTheme === "dark" ? "/logo-color.svg" : "/logo-ink.svg";
  const [step, setStep] = useState<SignUpStep>("START_SIGNUP");
  const [email, setEmail] = useState("");

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
          <h1 className="mt-3 text-3xl font-bold text-fg">Create account</h1>
        </div>

        {step === "START_SIGNUP" && (
          <Formik
            initialValues={{ email: "", password: "", name: "" }}
            onSubmit={async ({ email, password, name }, { setSubmitting }) => {
              try {
                const { data, error } = await supabase.auth.signUp({
                  email,
                  password,
                  options: {
                    data: {
                      name,
                    },
                    emailRedirectTo: `${window.location.origin}/account`,
                  },
                });

                if (error) {
                  toast(Notification, {
                    type: "error",
                    data: {
                      title: "Error Signing Up",
                      message: error.message,
                      type: "error",
                    },
                  });
                  return;
                }

                // Supabase anti-enumeration: when an email is already
                // registered, /signup returns 200 with a synthetic user
                // whose `identities` is an empty array — and no confirmation
                // email is sent. Surface this so users (especially Cognito-
                // migrated ones with a placeholder password) get routed to
                // sign-in / password reset instead of waiting for an email.
                if (data.user && (data.user.identities?.length ?? 0) === 0) {
                  toast(Notification, {
                    type: "error",
                    data: {
                      title: "Account already exists",
                      message:
                        "If you already have an account, please sign in instead — or reset your password if you don't remember it.",
                      type: "error",
                    },
                  });
                  return;
                }

                // Check if email confirmation is required
                if (data.user && !data.session) {
                  // Email confirmation required
                  setEmail(email);
                  setStep("CONFIRM_EMAIL");
                  toast(Notification, {
                    type: "success",
                    data: {
                      title: "Check Your Email",
                      message: "We sent you a confirmation link. Please check your email to verify your account.",
                      type: "success",
                    },
                  });
                } else if (data.session) {
                  // Auto signed in (email confirmation disabled)
                  router.push("/account");
                }
              } catch (error: any) {
                toast(Notification, {
                  type: "error",
                  data: {
                    title: "Error Signing Up",
                    message: error.message || "An unexpected error occurred",
                    type: "error",
                  },
                });
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting }) => (
              <Card tone="paper">
                <Form className="space-y-6">
                  <Field>
                    <Label
                      htmlFor="name"
                      className="block text-sm font-medium leading-6 text-fg"
                    >
                      Name
                    </Label>
                    <div className="mt-2">
                      <FormikField
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        className="block w-full rounded-md border border-border bg-bg py-2.5 sm:py-1.5 text-base text-fg shadow-sm placeholder:text-fg/40 focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </Field>

                  <Field>
                    <Label
                      htmlFor="email"
                      className="block text-sm font-medium leading-6 text-fg"
                    >
                      Email address
                    </Label>
                    <div className="mt-2">
                      <FormikField
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        className="block w-full rounded-md border border-border bg-bg py-2.5 sm:py-1.5 text-base text-fg shadow-sm placeholder:text-fg/40 focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </Field>

                  <Field>
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="password"
                        className="block text-sm font-medium leading-6 text-fg"
                      >
                        Password
                      </Label>
                    </div>
                    <div className="mt-2">
                      <FormikField
                        id="password"
                        name="password"
                        type="password"
                        required
                        autoComplete="new-password"
                        className="block w-full rounded-md border border-border bg-bg py-2.5 sm:py-1.5 text-base text-fg shadow-sm placeholder:text-fg/40 focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-sm sm:leading-6"
                      />
                    </div>
                    <p className="mt-1 text-xs text-fg/60">
                      At least 6 characters
                    </p>
                  </Field>

                  <Button
                    type="submit"
                    variant="accent"
                    size="md"
                    disabled={isSubmitting}
                    className="w-full justify-center"
                  >
                    {isSubmitting ? "Creating account..." : "Create account"}
                  </Button>
                </Form>
              </Card>
            )}
          </Formik>
        )}

        {step === "CONFIRM_EMAIL" && (
          <Card tone="paper">
            <ConfirmEmailStep
              email={email}
              supabase={supabase}
              onConfirmed={() => router.push("/account")}
            />
          </Card>
        )}

        <p className="mt-10 text-center text-sm text-fg/60">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="font-semibold leading-6 text-accent hover:text-accent-deep"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Post-signup step. Supabase sends an 8-digit confirmation code AND a
 * one-click link in the same email — this component lets the user paste
 * the code directly without round-tripping through their mail client.
 * If they click the link instead, /auth/callback handles it and this
 * component is bypassed entirely.
 *
 * Mirrors renderer/src/components/SignUp/step02.tsx in the desktop app.
 */
function ConfirmEmailStep({
  email,
  supabase,
  onConfirmed,
}: {
  email: string;
  // Loose-typed to avoid pulling the full SupabaseClient type signature
  // here; the only methods used are auth.verifyOtp and auth.resend.
  supabase: ReturnType<typeof useSupabaseClient>;
  onConfirmed: () => void;
}) {
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const canSubmit = code.length === 8 && !submitting;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "signup",
      });
      if (error) throw error;
      toast(Notification, {
        type: "success",
        data: {
          title: "Account confirmed",
          message: "Redirecting to your account…",
          type: "success",
        },
      });
      onConfirmed();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Couldn't confirm that code";
      toast(Notification, {
        type: "error",
        data: {
          title: "Invalid code",
          message,
          type: "error",
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) {
      toast(Notification, {
        type: "error",
        data: { title: "Error", message: error.message, type: "error" },
      });
      return;
    }
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    toast(Notification, {
      type: "success",
      data: {
        title: "Email Sent",
        message: "We sent a fresh 8-digit code to your inbox.",
        type: "success",
      },
    });
  };

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h3 className="text-lg font-medium text-fg">Confirm your account</h3>
        <p className="mt-2 text-sm text-fg/70">
          We sent an 8-digit code to <strong>{email}</strong>. Enter it below,
          or click the link in the email.
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <Field>
          <Label htmlFor="otp" className="block text-sm font-medium text-fg">
            Confirmation code
          </Label>
          <input
            id="otp"
            name="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{8}"
            maxLength={8}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
            disabled={submitting}
            placeholder="00000000"
            className="mt-2 block w-full rounded-md border-0 py-2 text-center text-2xl font-mono tracking-[0.4em] text-fg shadow-sm ring-1 ring-inset ring-border placeholder:text-fg/30 focus:ring-2 focus:ring-inset focus:ring-accent sm:text-2xl disabled:opacity-60"
          />
        </Field>

        <Button type="submit" disabled={!canSubmit}>
          {submitting ? "Confirming…" : "Confirm account"}
        </Button>
      </form>

      <div className="text-center text-sm">
        {resendCooldown > 0 ? (
          <span className="text-fg/50">
            Resend available in {resendCooldown}s
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="text-accent hover:text-accent-deep"
          >
            Didn&apos;t receive it? Resend code
          </button>
        )}
      </div>
    </div>
  );
}
