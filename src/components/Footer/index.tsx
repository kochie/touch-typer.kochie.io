import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faCopyright } from "@fortawesome/pro-duotone-svg-icons";
import { faHeart } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { Logo } from "./Logo";

export default function Footer() {
  return (
    <div className="bg-[#464953] py-6 text-white">
      <div className="max-w-4xl w-5/6 mx-auto flex">
        <div className="self-center">{Logo}</div>

        <div className="mx-10 flex-grow">
          <div className="mb-5">
            <Link
              href="/privacy"
              className="hover:underline duration-200 transform"
            >
              Privacy Policy
            </Link>
          </div>
          <div>
            Copyright 2022 <FontAwesomeIcon icon={faCopyright} /> Robert Koch
          </div>
          <div>
            Made with{" "}
            <FontAwesomeIcon
              icon={faHeart}
              className="hover:text-red-500 duration-150 transform"
            />{" "}
            in Melbourne
          </div>
        </div>
        <div className="place-self-end self-center">
          <Link href="https://github.com/kochie/touch-type" className="">
            <FontAwesomeIcon icon={faGithub} size={"2x"} />
          </Link>
        </div>
      </div>
    </div>
  );
}
