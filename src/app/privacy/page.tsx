import { compile, run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import PrivacyPolicy from "./privacy_policy.md";
import { ReactNode } from "react";

const components = {
  h1: ({children}: {children?: ReactNode}) => <h1 className="text-2xl my-6">{children}</h1>,
  h2: ({children}: {children?: ReactNode}) => <h2 className="text-xl my-3">{children}</h2>,
  a: ({children, href}: {children?: ReactNode, href?: string}) => <a href={href} className="text-blue-500 hover:underline">{children}</a>
}

export default async function Page() {
  const code = String(
    await compile(PrivacyPolicy, { outputFormat: "function-body" })
  );

  const { default: MDXContent } = await run(code, {
    ...runtime as any,
    baseUrl: import.meta.url,
  });

  return (
    <div className="w-96 mx-auto">
      <MDXContent components={components}/>
    </div>
  );
}
