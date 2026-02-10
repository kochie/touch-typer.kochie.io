"use client";

import { Formik, Field as FormikField, Form } from "formik";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "@/assets/logo.svg";
import { Button, Field, Label, Transition } from "@headlessui/react";
import { useState } from "react";
import { toast } from "react-toastify";
import { Notification } from "../Notification";
import { useSupabaseClient } from "@/lib/supabase-provider";

type SignUpStep = "START_SIGNUP" | "CONFIRM_EMAIL" | "DONE";

export default function SignUp() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [step, setStep] = useState<SignUpStep>("START_SIGNUP");
  const [email, setEmail] = useState("");

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <Image alt="Touch Typer" src={Logo} className="mx-auto h-10 w-auto" />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign Up and Start Learning
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
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
                <Form className="space-y-6">
                  <Field>
                    <Label
                      htmlFor="name"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Name
                    </Label>
                    <div className="mt-2">
                      <FormikField
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </Field>

                  <Field>
                    <Label
                      htmlFor="email"
                      className="block text-sm font-medium leading-6 text-gray-900"
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
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </Field>

                  <Field>
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="password"
                        className="block text-sm font-medium leading-6 text-gray-900"
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
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      At least 6 characters
                    </p>
                  </Field>

                  <div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                    >
                      {isSubmitting ? "Creating account..." : "Create account"}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          )}

          {step === "CONFIRM_EMAIL" && (
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
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Resend confirmation email
              </button>
            </div>
          )}

          <p className="mt-10 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
