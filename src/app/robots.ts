import { MetadataRoute } from "next";

const SITE = "https://touch-typer.kochie.io";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/account", "/checkout", "/buy", "/api/", "/auth/"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
