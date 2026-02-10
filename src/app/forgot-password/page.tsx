"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/assets/logo-dark.png";
import { useSupabaseClient } from "@/lib/supabase-provider";
import { toast } from "react-toastify";
import { Notification } from "@/components/Notification";
import { Field, Form, Formik } from "formik";

export default function ForgotPasswordPage() {
  const supabase = useSupabaseClient();
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const callbackUrl = `${origin}/auth/callback?next=/auth/set-password`;

  return (
    <div className="h-full flex flex-col justify-center items-center bg-slate-100 min-h-screen">
      <div className="w-full max-w-md">
        <Image
          alt="Touch Typer Logo"
          src={Logo}
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email and we’ll send you a link to set a new password.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
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
                      autoComplete="email"
                      required
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send reset link"}
                </button>
              </Form>
            )}
          </Formik>
        ) : (
          <div className="bg-white rounded-xl shadow-xl p-8 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-800">Check your email</h3>
              <p className="mt-1 text-sm text-green-700">
                We sent a password reset link to <strong>{email}</strong>. Click the link to set a new password.
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                const { error } = await supabase.auth.resend({
                  type: "recovery",
                  email,
                });
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
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Resend reset link
            </button>
          </div>
        )}

        <p className="mt-10 text-center text-sm text-gray-500">
          <Link
            href="/signin"
            className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
