"use client";

import { Field, Input, Label } from "@headlessui/react";
import { Field as FormikField, Form, Formik } from "formik";
import { toast } from "react-toastify";
import { Notification } from "../Notification";
import { useSupabaseClient } from "@/lib/supabase-provider";

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
          <div className="divide-y divide-gray-200  overflow-hidden bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6">Account Details</div>
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <Field className="sm:col-span-3 row-start-1">
                  <Label
                    htmlFor="username"
                    className="block text-sm font-medium leading-6 text-gray-900"
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
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </Field>
                <Field className="sm:col-span-3">
                  <Label
                    htmlFor="name"
                    className="block text-sm font-medium leading-6 text-gray-900"
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
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </Field>
                <Field className="sm:col-span-4 row-start-2">
                  <Label
                    htmlFor="email"
                    className="block text-sm font-medium leading-6 text-gray-900"
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
                      className="block w-full rounded-md border-0 py-1.5 text-gray-500 bg-gray-50 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Contact support to change your email
                    </p>
                  </div>
                </Field>
                <Field className="sm:col-span-4 row-start-3">
                  <Label
                    htmlFor="phone"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Phone Number
                  </Label>
                  <div className="mt-2">
                    <FormikField
                      id="phone"
                      name="phone"
                      type="text"
                      autoComplete="tel"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </Field>
              </div>
            </div>
            <div className="px-4 py-5 sm:px-6">
              <div className="flex items-center justify-end gap-x-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
}
