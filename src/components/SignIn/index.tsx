"use client";

import { useState } from "react";
import { Formik, Field, Form } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/assets/logo-dark.png";
import Image from "next/image";
import { useSupabaseClient } from "@/lib/supabase-provider";
import { toast } from "react-toastify";
import { Notification } from "../Notification";

type SignInMode = "password" | "magic_link";

export default function SignIn() {
  const router = useRouter();
  const supabase = useSupabaseClient();
  const [mode, setMode] = useState<SignInMode>("password");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState("");

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const callbackUrl = `${origin}/auth/callback`;

  return (
    <div className="h-full flex flex-col justify-center items-center bg-slate-100">
      <div className="w-full max-w-md">
        <div className="">
          <Image
            alt="Touch Typer Logo"
            src={Logo}
            className="mx-auto h-10 w-auto"
          />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="flex rounded-lg border border-gray-200 bg-white p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode("password")}
              className={`flex-1 rounded-md py-2 text-sm font-medium ${
                mode === "password"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setMode("magic_link")}
              className={`flex-1 rounded-md py-2 text-sm font-medium ${
                mode === "magic_link"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-gray-700 hover:bg-gray-50"
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
                <Form className="space-y-6 bg-white rounded-xl shadow-xl p-8">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium leading-6 text-gray-900"
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
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium leading-6 text-gray-900"
                      >
                        Password
                      </label>
                      <div className="text-sm">
                        <Link
                          href="/forgot-password"
                          className="font-semibold text-indigo-600 hover:text-indigo-500"
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
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                    >
                      {isSubmitting ? "Signing in..." : "Sign in"}
                    </button>
                  </div>
                </Form>
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
                <Form className="space-y-6 bg-white rounded-xl shadow-xl p-8">
                  <div>
                    <label
                      htmlFor="magic-email"
                      className="block text-sm font-medium leading-6 text-gray-900"
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
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                  >
                    {isSubmitting ? "Sending link..." : "Send sign-in link"}
                  </button>
                </Form>
              )}
            </Formik>
          )}

          {mode === "magic_link" && magicLinkSent && (
            <div className="bg-white rounded-xl shadow-xl p-8 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-green-800">Check your email</h3>
                <p className="mt-1 text-sm text-green-700">
                  We sent a sign-in link to <strong>{magicLinkEmail}</strong>. Click the link to sign in.
                </p>
              </div>
              <p className="text-xs text-gray-500">
                Link expires in about an hour. You can request a new link below.
              </p>
              <button
                type="button"
                onClick={() => setMagicLinkSent(false)}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                Send another link
              </button>
            </div>
          )}

          <p className="mt-10 text-center text-sm text-gray-500">
            Not a member?{" "}
            <Link
              href="/signup"
              className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
