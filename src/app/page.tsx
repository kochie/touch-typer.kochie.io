import logo from "@/assets/logo.svg";
import divider from "@/assets/layered-waves-haikei.svg";
import divider2 from "@/assets/layered-peaks-haikei.svg";
import divider3 from "@/assets/stacked-steps-haikei.svg";
import divider4 from "@/assets/layered-peaks-haikei-1.svg";
import DOTMS from "@/assets/Download_on_the_Mac_App_Store_Badge_US-UK_RGB_wht_092917.svg";
import example1 from "@/assets/example_1.png";
import Image from "next/image";
import { Inconsolata } from "@next/font/google";

const inconsolata = Inconsolata({ subsets: ["latin"] });

export default function Page() {
  return (
    <div className={inconsolata.className}>
      <div className="bg-[#464953] w-full min-h-[50vh] flex flex-col pt-24 gap-28 items-center justify-center">
        <Image src={logo} alt="logo" width="300" className="min-w-min" />
        <div className="text-white text-2xl typewriter">
          <p>Learn at your own pace</p>
        </div>
        <div className="flex gap-6">
          <a href="https://snapcraft.io/touch-typer">
            <img
              alt="Get it from the Snap Store"
              className=""
              src="https://snapcraft.io/static/images/badges/en/snap-store-white.svg"
            />
          </a>
          <a>
            <Image src={DOTMS} alt="" height="56" />
          </a>
        </div>
      </div>
      <Image src={divider} alt="" height="100" className="w-full" />

      <div className="flex justify-between items-center my-32">
        <Image src={example1} alt="example 1" className="lg:w-1/3 w-1/2" />
        <div className="lg:mr-36 mr-4 text-lg max-w-md">
          Want to get better at typing? Maybe you want to type faster, or maybe
          you want to learn a different keyboard layout? Touch Typer is your
          tutor that helps you improve your typing skills. Open source and free
          to use it's available on Linux, Windows and macOS.
        </div>
      </div>

      <div>
        <Image src={divider2} alt="" height="100" className="w-full" />
        <div className="bg-[#2d85d2]">Hello</div>
        <Image src={divider3} alt="" height="240" className="w-full" />
      </div>

      <div>
        <Image src={divider4} alt="" height="200" className="w-full" />
      </div>

      <div className="bg-[#464953] py-32 text-white">Footer</div>
    </div>
  );
}
