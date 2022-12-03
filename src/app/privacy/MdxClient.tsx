"use client";
import { MDXRemote, MDXRemoteProps } from "next-mdx-remote";
import { ReactNode } from "react";


const components = {
  h1: ({children}: {children?: ReactNode}) => <h1 className="text-2xl my-6">{children}</h1>,
  h2: ({children}: {children?: ReactNode}) => <h2 className="text-xl my-3">{children}</h2>,
  a: ({children, href}: {children?: ReactNode, href?: string}) => <a href={href} className="text-blue-500 hover:underline">{children}</a>
}


export default function MDXClient(props: MDXRemoteProps) {
  return <MDXRemote {...props} components={components} />;
}
