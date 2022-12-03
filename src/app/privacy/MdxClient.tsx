"use client";
import { MDXRemote, MDXRemoteProps } from "next-mdx-remote";

export default function MDXClient(props: MDXRemoteProps) {
  return <MDXRemote {...props} />;
}
