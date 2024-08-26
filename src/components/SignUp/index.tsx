"use client";
import {
  signUp,
  confirmSignUp,
  SignUpOutput,
  ConfirmSignUpOutput,
  autoSignIn,
} from "aws-amplify/auth";
import { Formik, Field as FormikField, Form } from "formik";
import Image from "next/image";
import { useRouter } from "next/navigation";

import Logo from "@/assets/logo.svg";
import { Button, Field, Label, Transition } from "@headlessui/react";
import { useState } from "react";
import { toast } from "react-toastify";
import { Notification } from "../Notification";

export default function SignIn() {
  const router = useRouter();
  const [nextStep, setStep] = useState("START_SIGNUP");

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
          <Formik
            initialValues={{ email: "", password: "", code: "" }}
            onSubmit={async ({ email, password, code }) => {
              // if (nextStep === "START_SIGNUP") {
              //   const signUpResult = await signUp({
              //     username: email,
              //     password: password,
              //     options: {
              //       autoSignIn: true,
              //       userAttributes: {
              //         email: email,
              //       },
              //     },
              //   });
              //   setStep(signUpResult.nextStep.signUpStep)
              //   if (signUpResult.isSignUpComplete) router.push("/account");
              // } else if (nextStep === "CONFIRM_SIGN_UP") {
              //   const confirmSignUpResult = await confirmSignUp({confirmationCode: code, username: email})
              //   setStep(confirmSignUpResult.nextStep.signUpStep)
              //   if (confirmSignUpResult.nextStep) router.push("/account");
              // } else if (nextStep === "COMPLETE_AUTO_SIGN_IN") {
              //   const signInResult = await autoSignIn()
              //   if (signInResult.isSignedIn) router.push("/account");
              // }
              // console.log(nextStep)
              try {
                switch (nextStep) {
                  case "START_SIGNUP": {
                    const signUpResult = await signUp({
                      username: email,
                      password: password,
                      options: {
                        autoSignIn: true,
                        userAttributes: {
                          email: email,
                        },
                      },
                    });
                    setStep(signUpResult.nextStep.signUpStep);
                    if (signUpResult.isSignUpComplete) router.push("/account");
                    break;
                  }
                  case "CONFIRM_SIGN_UP": {
                    const confirmSignUpResult = await confirmSignUp({
                      confirmationCode: code,
                      username: email,
                    });
                    setStep(confirmSignUpResult.nextStep.signUpStep);
                    if (confirmSignUpResult.nextStep) router.push("/account");
                    break;
                  }
                  case "COMPLETE_AUTO_SIGN_IN": {
                    const signInResult = await autoSignIn();
                    if (signInResult.isSignedIn) router.push("/account");
                    break;
                  }
                  case "DONE": {
                    router.push("/account");
                    break;
                  }
                }
              } catch (error) {


                toast(Notification, {
                  // toastId: id,
                  type: "error",
                  data: {
                    title: "Error Signing Up",
                    message: error as any,
                    type: "error",
                  },
                });
              }
            }}
          >
            <Form className="space-y-6">
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

              <Transition show={nextStep === "START_SIGNUP"}>
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
                      autoComplete="current-password"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </Field>
              </Transition>

              <Transition show={nextStep === "CONFIRM_SIGN_UP"}>
                <Field>
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Verification Code
                    </Label>
                  </div>
                  <div className="mt-2">
                    <FormikField
                      id="code"
                      name="code"
                      type="code"
                      required
                      autoComplete="otp"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </Field>
              </Transition>

              <div>
                <Button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Sign in
                </Button>
              </div>
            </Form>
          </Formik>
        </div>
      </div>
    </>
  );
}
