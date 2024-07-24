"use client";
import { Field, Input, Label } from "@headlessui/react";
import {
  FetchUserAttributesOutput,
  updateUserAttributes,
} from "aws-amplify/auth";
import { Field as FormikField, Form, Formik } from "formik";
import { toast } from "react-toastify";
import { Notification } from "../Notification";

export function UserDetails({ user }: { user: FetchUserAttributesOutput }) {
  // const user = {}
  // useEffect(() => {
  //   const fetchUser = async () => {
  //     console.log("fetching user");
  //     const user = await fetchUserAttributes();
  //   }
  //   fetchUser()
  // }, [])

  return (
    <Formik
      initialValues={{
        name: user.name,
        email: user.email,
        phone: user.phone_number,
      }}
      onSubmit={async (values) => {
        console.log(values);
        await updateUserAttributes({
          userAttributes: {
            name: values.name,
            email: values.email,
            phone_number: values.phone,
          },
        });
        const id = Math.random().toString(36);
        toast(
          Notification,
          {
            toastId: id,
            type: "success",
            data: {
              title: "User details updated",
              message: "User details updated successfully",
              type: "success",
            },
          }
        );
      }}
    >
      <Form>
        <div className="divide-y divide-gray-200  overflow-hidden bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">Account Details</div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <Field className="sm:col-span-4 row-start-1">
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
                  htmlFor="first-name"
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
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </Field>
              <Field className="sm:col-span-4 row-start-3">
                <Label
                  htmlFor="first-name"
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
            <div className="flex items-center justify-end gap-x-6 px-4 sm:px-8">
              <button
                type="button"
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </Form>
    </Formik>
  );
}
