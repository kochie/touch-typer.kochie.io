import { ReactNode } from "react";

import "@/styles/main.css";
import Link from "next/link";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
config.autoAddCss = false;
import { faCopyright } from "@fortawesome/pro-duotone-svg-icons";
import { faHeart } from "@fortawesome/pro-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import Fathom from "./Fathom";

const Logo = (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 2501 1054"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    xmlSpace="preserve"
    style={{
      fillRule: "evenodd",
      clipRule: "evenodd",
      strokeLinejoin: "round",
      strokeMiterlimit: 2,
      height: 40,
      width: 80,
    }}
    className="group"
  >
    <g transform="matrix(1147.41,396.01,396.01,-1147.41,-58.2764,785.467)">
      <path
        d="M0.154,-0.177L0.065,0.081L0.027,0.068L0.006,0.129L0.146,0.177L0.167,0.116L0.129,0.103L0.218,-0.155L0.154,-0.177Z"
        className="fill-white fillRuleNonZero group-hover:fill-[#2d85d2] transform duration-200"
      />
    </g>
    <g transform="matrix(1147.41,396.01,396.01,-1147.41,-35.9875,720.886)">
      <path
        d="M0.206,0.121C0.198,0.103 0.198,0.079 0.208,0.052L0.26,-0.1C0.27,-0.129 0.285,-0.149 0.303,-0.16C0.322,-0.17 0.344,-0.171 0.37,-0.162C0.395,-0.154 0.412,-0.139 0.42,-0.119C0.429,-0.099 0.428,-0.074 0.418,-0.045L0.365,0.106C0.356,0.134 0.342,0.152 0.324,0.162C0.305,0.171 0.283,0.172 0.258,0.163C0.232,0.154 0.215,0.14 0.206,0.121ZM0.336,-0.101C0.332,-0.098 0.328,-0.091 0.325,-0.081L0.271,0.075C0.266,0.091 0.268,0.101 0.279,0.104C0.288,0.108 0.296,0.101 0.301,0.086L0.355,-0.07C0.361,-0.089 0.36,-0.1 0.35,-0.103C0.345,-0.105 0.34,-0.105 0.336,-0.101Z"
        className="fill-white fillRuleNonZero group-hover:fill-[#2d85d2] transform duration-200"
      />
    </g>
    <g transform="matrix(1147.41,396.01,396.01,-1147.41,-6.63137,635.829)">
      <path
        d="M0.471,0.159L0.551,-0.072C0.553,-0.078 0.555,-0.083 0.556,-0.088C0.557,-0.093 0.557,-0.098 0.556,-0.101C0.555,-0.105 0.552,-0.108 0.547,-0.11C0.542,-0.111 0.538,-0.111 0.534,-0.109C0.531,-0.106 0.528,-0.103 0.526,-0.098C0.524,-0.093 0.522,-0.088 0.52,-0.083L0.44,0.148L0.378,0.127L0.459,-0.107C0.469,-0.136 0.483,-0.156 0.5,-0.166C0.518,-0.177 0.54,-0.178 0.567,-0.169C0.594,-0.159 0.611,-0.145 0.618,-0.126C0.625,-0.107 0.624,-0.082 0.614,-0.053L0.533,0.181L0.471,0.159Z"
        className="fill-white fillRuleNonZero group-hover:fill-[#2d85d2] transform duration-200"
      />
    </g>
    <g transform="matrix(1147.41,396.01,396.01,-1147.41,17.3042,566.477)">
      <path
        d="M0.6,0.119C0.593,0.098 0.595,0.072 0.606,0.041L0.657,-0.106C0.666,-0.132 0.68,-0.15 0.699,-0.159C0.718,-0.169 0.739,-0.17 0.762,-0.162C0.788,-0.153 0.805,-0.14 0.815,-0.122C0.825,-0.105 0.825,-0.082 0.815,-0.054L0.794,0.007L0.73,-0.016L0.75,-0.073C0.752,-0.08 0.753,-0.086 0.753,-0.092C0.752,-0.097 0.749,-0.1 0.743,-0.102C0.738,-0.104 0.734,-0.104 0.73,-0.101C0.726,-0.098 0.723,-0.092 0.72,-0.083L0.665,0.077C0.662,0.084 0.661,0.09 0.662,0.095C0.662,0.1 0.666,0.103 0.672,0.105C0.677,0.107 0.681,0.107 0.685,0.104C0.688,0.102 0.692,0.096 0.695,0.086L0.711,0.039L0.775,0.061L0.756,0.116C0.75,0.133 0.742,0.146 0.731,0.154C0.72,0.163 0.708,0.168 0.695,0.17C0.681,0.171 0.666,0.169 0.651,0.164C0.624,0.155 0.606,0.139 0.6,0.119Z"
        className="fill-white fillRuleNonZero group-hover:fill-[#2d85d2] transform duration-200"
      />
    </g>
    <g transform="matrix(1147.41,396.01,396.01,-1147.41,44.8904,486.548)">
      <path
        d="M0.865,0.165L0.904,0.051L0.874,0.04L0.835,0.155L0.771,0.133L0.882,-0.187L0.945,-0.165L0.895,-0.02L0.925,-0.01L0.975,-0.155L1.039,-0.133L0.929,0.187L0.865,0.165Z"
        className="fill-white fillRuleNonZero group-hover:fill-[#2d85d2] transform duration-200"
      />
    </g>
    <g transform="matrix(1132.18,401.087,401.087,-1132.18,1309.98,784.419)">
      <path
        d="M0.004,0.129L0.026,0.067L0.065,0.081L0.157,-0.179L0.221,-0.156L0.129,0.104L0.167,0.117L0.145,0.179L0.004,0.129Z"
        className="fill-white fillRuleNonZero"
      />
    </g>
    <g transform="matrix(1132.18,401.087,401.087,-1132.18,1335.97,711.061)">
      <path
        d="M0.269,0.158L0.29,0.043L0.233,0.146L0.169,0.123L0.297,-0.075L0.335,-0.181L0.396,-0.159L0.358,-0.053L0.333,0.181L0.269,0.158Z"
        className="fill-white fillRuleNonZero"
      />
    </g>
    <g transform="matrix(1132.18,401.087,401.087,-1132.18,1356.75,652.404)">
      <path
        d="M0.368,0.141L0.482,-0.181L0.545,-0.158L0.5,-0.031L0.526,-0.021C0.544,-0.015 0.556,-0.006 0.563,0.005C0.57,0.017 0.573,0.03 0.571,0.046C0.57,0.062 0.566,0.079 0.559,0.099C0.552,0.119 0.544,0.136 0.534,0.149C0.524,0.162 0.513,0.17 0.499,0.175C0.486,0.179 0.471,0.178 0.453,0.172L0.368,0.141ZM0.452,0.105L0.459,0.108C0.469,0.111 0.476,0.11 0.481,0.104C0.486,0.099 0.491,0.09 0.495,0.077C0.5,0.064 0.502,0.054 0.502,0.046C0.501,0.039 0.495,0.033 0.483,0.028L0.48,0.027L0.452,0.105Z"
        className="fill-white fillRuleNonZero"
      />
    </g>
    <g transform="matrix(1132.18,401.087,401.087,-1132.18,1385.85,570.274)">
      <path
        d="M0.563,0.138L0.677,-0.184L0.81,-0.137L0.788,-0.074L0.721,-0.098L0.695,-0.024L0.755,-0.003L0.734,0.058L0.673,0.036L0.651,0.099L0.714,0.122L0.692,0.184L0.563,0.138Z"
        className="fill-white fillRuleNonZero"
      />
    </g>
    <g transform="matrix(1132.18,401.087,401.087,-1132.18,1409.9,502.369)">
      <path
        d="M0.736,0.139L0.85,-0.183L0.916,-0.159L0.863,-0.013C0.872,-0.01 0.879,-0.008 0.883,-0.009C0.888,-0.01 0.892,-0.015 0.895,-0.025L0.94,-0.151L1.003,-0.128L0.96,-0.006C0.956,0.006 0.95,0.016 0.943,0.022C0.936,0.029 0.927,0.031 0.916,0.03C0.927,0.038 0.933,0.048 0.934,0.061C0.935,0.073 0.932,0.087 0.926,0.105C0.919,0.123 0.912,0.138 0.905,0.151C0.897,0.163 0.888,0.172 0.876,0.176C0.865,0.181 0.852,0.18 0.835,0.174L0.736,0.139ZM0.823,0.103L0.838,0.108C0.843,0.11 0.848,0.11 0.851,0.106C0.854,0.103 0.858,0.095 0.863,0.083C0.87,0.063 0.869,0.052 0.86,0.049L0.844,0.043L0.823,0.103Z"
        className="fill-white fillRuleNonZero"
      />
    </g>
    <g transform="matrix(673.979,445.512,445.512,-673.979,69.0085,124.109)">
      <path
        d="M0.565,0.434C0.5,0.374 0.419,0.31 0.326,0.249C0.233,0.188 0.142,0.138 0.062,0.101C0.029,0.086 0.012,0.049 0.023,0.015L0.157,-0.388C0.172,-0.432 0.224,-0.45 0.263,-0.425L0.97,0.043C1.009,0.069 1.013,0.124 0.978,0.155L0.66,0.435C0.636,0.457 0.601,0.459 0.575,0.441C0.571,0.439 0.568,0.437 0.565,0.434Z"
        className="fill-white fillRuleNonZero group-hover:fill-[#2d85d2] transform duration-200"
      />
    </g>
    <g transform="matrix(696.826,456.935,456.935,-696.826,1764.96,122.367)">
      <path
        d="M0.556,0.42C0.493,0.363 0.413,0.301 0.323,0.242C0.233,0.183 0.144,0.134 0.066,0.099C0.034,0.085 0.018,0.049 0.029,0.016L0.157,-0.375C0.171,-0.418 0.222,-0.436 0.259,-0.411L0.947,0.04C0.985,0.064 0.989,0.118 0.955,0.148L0.647,0.421C0.624,0.442 0.59,0.444 0.565,0.427C0.562,0.425 0.559,0.423 0.556,0.42Z"
        className="fill-white fillRuleNonZero group-hover:fill-[#2d85d2] transform duration-200"
      />
    </g>
    <g transform="matrix(651.132,319.854,319.854,-651.132,933.586,236.985)">
      <clipPath id="_clip1">
        <path
          d="M0.683,0.361C0.603,0.304 0.503,0.245 0.392,0.19C0.281,0.136 0.174,0.093 0.08,0.064C0.041,0.053 0.017,0.014 0.025,-0.026L0.078,-0.298C0.088,-0.348 0.144,-0.376 0.19,-0.353L0.946,0.019C0.993,0.041 1.005,0.102 0.971,0.141L0.788,0.349C0.764,0.376 0.726,0.383 0.694,0.368C0.69,0.366 0.687,0.364 0.683,0.361Z"
          clipRule="nonzero"
        />
      </clipPath>
      <g clipPath="url(#_clip1)">
        <rect
          x="0.017"
          y="-0.376"
          width="0.987"
          height="0.759"
          style={{ fill: "white" }}
        />
      </g>
    </g>
  </svg>
);

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head></head>
      <body className="min-h-screen grid grid-rows-[1fr_auto]">
        <Fathom />
        <div>{children}</div>
        <div className="bg-[#464953] py-12 text-white">
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
                Copyright 2022 <FontAwesomeIcon icon={faCopyright} /> Robert
                Koch
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
      </body>
    </html>
  );
}
