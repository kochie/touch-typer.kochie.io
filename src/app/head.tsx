import { NextSeo } from "next-seo";

export default function Head() {
  return (
    <>
      <meta name="viewport" content="width=device-width" />
      <link rel="manifest" href="/manifest.json" />
      <meta charSet="utf-8" />
      <link rel="icon" type="image/png" href="/favicon.png" />

      <NextSeo
        useAppDir={true}
        canonical="https://touch-typer.kochie.io"
        title="Touch Typer"
        description="Touch Typer is an app that lets you practice your typing skills."
        openGraph={{
          type: "website",
          images: [
            {
              url: "https://touch-typer.kochie.io/og.png",
              height: 630,
              width: 1200,
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
