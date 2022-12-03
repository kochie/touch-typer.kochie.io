import { serialize } from "next-mdx-remote/serialize";
import PrivacyPolicy from "./privacy_policy.md";
import MDXClient from "./MdxClient";
import { readFile } from "fs/promises";
import { join } from "path";

export default async function Page() {
  console.log("PP", PrivacyPolicy);
  const encoded = (PrivacyPolicy as unknown as string).replace(
    "data:text/markdown;base64,",
    ""
  );
  const data = Buffer.from(encoded, "base64");

  const mdxSource = await serialize(data);

  return (
    <div className="">
      <MDXClient {...mdxSource} />
    </div>
  );
}
