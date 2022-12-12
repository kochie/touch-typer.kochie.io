import { NextSeo } from "next-seo";

export default function Head() {
  return (
    <>
      <meta name="viewport" content="width=device-width" />
      <link rel="manifest" href="/manifest.json" />
      <meta charSet="utf-8" />
      <link rel="icon" type="image/png" href="/favicon.png" />
      <meta name="author" content="Robert Koch" />

      <NextSeo
        useAppDir={true}
        canonical="https://touch-typer.kochie.io"
        title="Touch Typer"
        description="Touch Typer is an app that lets you practice your typing skills."
        openGraph={{
          type: "website",
          images: [
            {
              url: `https://${
                process.env.NEXT_PUBLIC_PROD_URL ||
                process.env.NEXT_PUBLIC_VERCEL_URL ||
                process.env.VERCEL_URL
              }/og.png`,
              // height: 630,
              // width: 1200,
              alt: "OpenGraph image",
            },
          ],
          description:
            "Touch Typer is an app that lets you practice your typing skills.",
          siteName: "Touch Typer",
          url: "https://touch-typer.kochie.io",
          title: "Touch Typer",
        }}
        twitter={{
          handle: "@kochie",
          site: "@kochie",
          cardType: "summary_large_image",
        }}
        themeColor="#42444D"
      />
    </>
  );
}
