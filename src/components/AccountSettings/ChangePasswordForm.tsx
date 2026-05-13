"use client";

import { Field, Form, Formik } from "formik";
import { Input } from "@headlessui/react";
import { useSupabaseClient } from "@/lib/supabase-provider";
import { toast } from "react-toastify";
import { Notification } from "../Notification";
import { Button } from "@/components/ui/Button";

export function ChangePasswordForm() {
  const supabase = useSupabaseClient();

  return (
    <div className="divide-y divide-line overflow-hidden bg-paper border border-line rounded-xl">
      <div className="px-4 py-5 sm:px-6 text-ink font-medium">Change password</div>
      <div className="px-4 py-5 sm:p-6">
        <Formik
          initialValues={{
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          }}
          validate={(values) => {
            const errors: Record<string, string> = {};
            if (values.newPassword.length > 0 && values.newPassword.length < 6) {
              errors.newPassword = "At least 6 characters";
            }
            if (values.newPassword !== values.confirmPassword) {
              errors.confirmPassword = "Passwords do not match";
            }
            return errors;
          }}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (!user?.email) {
                toast(Notification, {
                  type: "error",
                  data: { title: "Error", message: "No email found.", type: "error" },
                });
                return;
              }
              const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: values.currentPassword,
              });
              if (signInError) {
                toast(Notification, {
                  type: "error",
                  data: { title: "Error", message: "Current password is incorrect.", type: "error" },
                });
                return;
              }
              const { error: updateError } = await supabase.auth.updateUser({
                password: values.newPassword,
              });
              if (updateError) throw updateError;
              toast(Notification, {
                type: "success",
                data: {
                  title: "Password updated",
                  message: "Your password has been changed.",
                  type: "success",
                },
              });
              resetForm();
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
            <Form className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-ink">
                  Current password
                </label>
                <div className="mt-1">
                  <Field
                    as={Input}
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-md border border-line bg-paper py-1.5 text-ink shadow-sm focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-ink">
                  New password
                </label>
                <div className="mt-1">
                  <Field
                    as={Input}
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    className="block w-full rounded-md border border-line bg-paper py-1.5 text-ink shadow-sm focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-sm"
                  />
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-xs text-red-600">{errors.newPassword}</p>
                )}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink">
                  Confirm new password
                </label>
                <div className="mt-1">
                  <Field
                    as={Input}
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    className="block w-full rounded-md border border-line bg-paper py-1.5 text-ink shadow-sm focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-sm"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update password"}
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
