import logo from "@/assets/logo.svg";
import divider from "@/assets/layered-waves-haikei.svg";
import divider2 from "@/assets/layered-peaks-haikei.svg";
import divider3 from "@/assets/stacked-steps-haikei.svg";
import divider4 from "@/assets/layered-peaks-haikei-1.svg";
import DOTMS from "@/assets/Download_on_the_Mac_App_Store_Badge_US-UK_RGB_wht_092917.svg";
import example1 from "@/assets/example_1.png";
import Image from "next/image";
import { Inconsolata } from "@next/font/google";
import Script from "next/script";
import analytics from "@/assets/analytics.png";
import Link from "next/link";
import { DOMAttributes } from "react";
import { NextSeo } from "next-seo";

const inconsolata = Inconsolata({ subsets: ["latin"] });

interface MsStoreBadge {
  size: string;
  productid: string;
  theme: string;
  language: string;
  animation: string;
}

type CustomElement<T> = Partial<T & DOMAttributes<T> & { children: any }>;

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ["ms-store-badge"]: CustomElement<HTMLDivElement & MsStoreBadge>;
    }
  }
}

const description =
  "Improve your typing skills or learn a new keyboard layout with Touch Typer. Available on Mac, Windows, and Linux.";

export default function Page() {
  return (
    <>
      <NextSeo
        useAppDir={true}
        canonical="https://touch-typer.kochie.io"
        title="Touch Typer"
        description={description}
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
          description,
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
      <div className={inconsolata.className}>
        <div className="bg-[#464953] w-full min-h-[50vh] flex flex-col pt-24 gap-28 items-center justify-center">
          <Image src={logo} alt="logo" width="300" className="min-w-min" />
          <div className="text-white text-2xl typewriter">
            <p>Learn at your own pace</p>
          </div>
          <div className="flex flex-col items-center gap-10">
            <Link href="https://snapcraft.io/touch-typer">
              <img
                alt="Get it from the Snap Store"
                className="hover:iconHover transform"
                src="https://snapcraft.io/static/images/badges/en/snap-store-white.svg"
              />
            </Link>
            <Link href="https://apps.apple.com/au/app/touch-typer/id1637786724">
              <Image src={DOTMS} alt="" className="hover:iconHover" />
            </Link>
            <Script
              type="module"
              src="https://get.microsoft.com/badge/ms-store-badge.bundled.js"
            />

            <ms-store-badge
              className="h-[56px]"
              size="small"
              productid="9NG3CCFL631D"
              window-mode="full"
              theme="auto"
              language="en"
              animation="on"
            />
          </div>
        </div>
        <Image src={divider} alt="" height="100" className="w-full" />

        <div className="flex justify-between items-center my-32">
          <Image src={example1} alt="example 1" className="lg:w-1/3 w-1/2" />
          <div className="lg:mr-36 mr-4 text-2xl max-w-4xl">
            Want to get better at typing? Maybe you want to type faster, or
            maybe you want to learn a different keyboard layout? Touch Typer is
            your tutor that helps you improve your typing skills. Open source
            and free to use it's available on Linux, Windows and macOS.
          </div>
        </div>

        <div>
          <Image src={divider2} alt="" height="100" className="w-full" />
          <div className="bg-[#2d85d2] py-14 text-2xl">
            <div className="text-white text-center max-w-3xl mx-auto my-12">
              Like any skill if you don't practice typing you'll never get
              better at it. Touch Typer allows you to practice typing in a fun
              and engaging way.
            </div>
            <div className="relative w-[1000px] mx-auto shadow-2xl">
              <div className="absolute bg-[#232323] rounded-md w-full h-full">
                {buttons}
              </div>
              <video
                src="/demo.mov"
                autoPlay
                muted
                className="h-auto relative pt-[40px] px-3 pb-5"
              />
            </div>
          </div>
          <Image src={divider3} alt="" height="240" className="w-full" />
          <div className="bg-[#464953] py-10 flex justify-evenly">
            <div className="text-white self-center max-w-xl text-2xl">
              Track your improvement with analytics. See how fast you're typing,
              the amount of typos you make, and your accuracy over time.
            </div>
            <Image src={analytics} alt="" className="w-[50vw]" />
          </div>
          <Image src={divider4} alt="" height="200" className="w-full" />
        </div>
      </div>
    </>
  );
}

const buttons = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="54"
    height="14"
    viewBox="0 0 54 14"
    className="ml-2 mt-2"
  >
    <g fill="none" fill-rule="evenodd" transform="translate(1 1)">
      <circle
        cx="6"
        cy="6"
        r="6"
        fill="#FF5F56"
        stroke="#E0443E"
        stroke-width=".5"
      ></circle>
      <circle
        cx="26"
        cy="6"
        r="6"
        fill="#FFBD2E"
        stroke="#DEA123"
        stroke-width=".5"
      ></circle>
      <circle
        cx="46"
        cy="6"
        r="6"
        fill="#27C93F"
        stroke="#1AAB29"
        stroke-width=".5"
      ></circle>
    </g>
  </svg>
);
