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
    mounted && resolvedTheme === "dark" ? "/logo-white.svg" : "/logo-ink.svg";
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
                        className="block w-full rounded-md border border-border bg-bg py-1.5 text-fg shadow-sm placeholder:text-fg/40 focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-sm sm:leading-6"
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
                        className="block w-full rounded-md border border-border bg-bg py-1.5 text-fg shadow-sm placeholder:text-fg/40 focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-sm sm:leading-6"
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
                        className="block w-full rounded-md border border-border bg-bg py-1.5 text-fg shadow-sm placeholder:text-fg/40 focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-sm sm:leading-6"
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
            <div className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-green-800">
                  Check your email
                </h3>
                <p className="mt-2 text-sm text-green-700">
                  We sent a confirmation link to <strong>{email}</strong>.
                  Please click the link to verify your account.
                </p>
              </div>
              <button
                onClick={async () => {
                  const { error } = await supabase.auth.resend({
                    type: "signup",
                    email,
                  });
                  if (error) {
                    toast(Notification, {
                      type: "error",
                      data: {
                        title: "Error",
                        message: error.message,
                        type: "error",
                      },
                    });
                  } else {
                    toast(Notification, {
                      type: "success",
                      data: {
                        title: "Email Sent",
                        message: "Confirmation email resent successfully",
                        type: "success",
                      },
                    });
                  }
                }}
                className="text-sm text-accent hover:text-accent-deep"
              >
                Resend confirmation email
              </button>
            </div>
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
