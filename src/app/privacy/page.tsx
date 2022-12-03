import { serialize } from "next-mdx-remote/serialize";
import PrivacyPolicy from "./privacy_policy.md";
import MDXClient from "./MdxClient";

export default async function Page() {
  const encoded = (PrivacyPolicy as unknown as string).replace(
    "data:text/markdown;base64,",
    ""
  );
  const data = Buffer.from(encoded, "base64");

  const mdxSource = await serialize(data);

  return (
    <div className="w-96 mx-auto">
      <MDXClient {...mdxSource} />
    </div>
  );
}
