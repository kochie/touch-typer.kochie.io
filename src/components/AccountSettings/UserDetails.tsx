"use client";

import { Field, Input, Label } from "@headlessui/react";
import { Field as FormikField, Form, Formik } from "formik";
import { toast } from "react-toastify";
import { Notification } from "../Notification";
import { useSupabaseClient } from "@/lib/supabase-provider";
import { Button } from "@/components/ui/Button";

interface UserData {
  email?: string | null;
  name?: string | null;
  preferred_username?: string | null;
  phone_number?: string | null;
}

export function UserDetails({ user }: { user: UserData }) {
  const supabase = useSupabaseClient();

  return (
    <Formik
      initialValues={{
        name: user.name || "",
        email: user.email || "",
        phone: user.phone_number || "",
        username: user.preferred_username || "",
      }}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          // Update auth user metadata (email requires verification)
          const { error: authError } = await supabase.auth.updateUser({
            data: {
              name: values.name,
            },
          });

          if (authError) {
            throw authError;
          }

          // Update profile in profiles table
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          if (currentUser) {
            const { error: profileError } = await supabase
              .from('profiles')
              .update({
                name: values.name,
                preferred_username: values.username,
                phone_number: values.phone,
              })
              .eq('id', currentUser.id);

            if (profileError) {
              throw profileError;
            }
          }

          toast(Notification, {
            type: "success",
            data: {
              title: "User details updated",
              message: "Your details have been updated successfully",
              type: "success",
            },
          });
        } catch (error: any) {
          toast(Notification, {
            type: "error",
            data: {
              title: "Error updating details",
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
        <Form>
          <div className="divide-y divide-border overflow-hidden bg-bg border border-border rounded-xl">
            <div className="px-4 py-5 sm:px-6 text-fg font-medium">Account Details</div>
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <Field className="sm:col-span-3 row-start-1">
                  <Label
                    htmlFor="username"
                    className="block text-sm font-medium leading-6 text-fg"
                  >
                    Username
                  </Label>
                  <div className="mt-2">
                    <FormikField
                      as={Input}
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      className="block w-full rounded-md border border-border bg-bg py-1.5 text-fg shadow-sm placeholder:text-fg/40 focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-sm sm:leading-6"
                    />
                  </div>
                </Field>
                <Field className="sm:col-span-3">
                  <Label
                    htmlFor="name"
                    className="block text-sm font-medium leading-6 text-fg"
                  >
                    Name
                  </Label>
                  <div className="mt-2">
                    <FormikField
                      as={Input}
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      className="block w-full rounded-md border border-border bg-bg py-1.5 text-fg shadow-sm placeholder:text-fg/40 focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-sm sm:leading-6"
                    />
                  </div>
                </Field>
                <Field className="sm:col-span-4 row-start-2">
                  <Label
                    htmlFor="email"
                    className="block text-sm font-medium leading-6 text-fg"
                  >
                    Email
                  </Label>
                  <div className="mt-2">
                    <FormikField
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      disabled
                      className="block w-full rounded-md border border-border bg-bg-elevated py-1.5 text-fg/50 shadow-sm placeholder:text-fg/40 sm:text-sm sm:leading-6"
                    />
                    <p className="mt-1 text-xs text-fg/60">
                      Contact support to change your email
                    </p>
                  </div>
                </Field>
                <Field className="sm:col-span-4 row-start-3">
                  <Label
                    htmlFor="phone"
                    className="block text-sm font-medium leading-6 text-fg"
                  >
                    Phone Number
                  </Label>
                  <div className="mt-2">
                    <FormikField
                      id="phone"
                      name="phone"
                      type="text"
                      autoComplete="tel"
                      className="block w-full rounded-md border border-border bg-bg py-1.5 text-fg shadow-sm placeholder:text-fg/40 focus:border-accent focus:ring-2 focus:ring-accent/20 sm:text-sm sm:leading-6"
                    />
                  </div>
                </Field>
              </div>
            </div>
            <div className="px-4 py-5 sm:px-6">
              <div className="flex items-center justify-end gap-x-6">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
}
