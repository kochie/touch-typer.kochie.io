"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseClient } from "@/lib/supabase-provider";
import { Field, Form, Formik } from "formik";
import { toast } from "react-toastify";
import { Notification } from "@/components/Notification";
import Image from "next/image";
import Logo from "@/assets/logo-dark.png";

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
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!hasSession) {
    return null;
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Image alt="Touch Typer" src={Logo} className="mx-auto h-10 w-auto" />
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Set new password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
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
            <Form className="space-y-6 bg-white rounded-xl shadow-xl p-8">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
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
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium leading-6 text-gray-900"
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
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
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
