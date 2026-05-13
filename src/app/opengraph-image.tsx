import { ImageResponse } from "next/og";

export const alt = "Touch Typer — Practice typing. Get measurably faster.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#fafaf9",
          color: "#0f1115",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: 32, color: "#6b7280", marginBottom: 32 }}>⌨ Touch Typer</div>
        <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
          Practice typing.
        </div>
        <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
          Get measurably <span style={{ color: "#2d85d2" }}>faster.</span>
        </div>
        <div style={{ fontSize: 28, color: "#6b7280", marginTop: 32 }}>
          Free desktop typing tutor · Mac, Windows, Linux
        </div>
      </div>
    ),
    { ...size }
  );
}
