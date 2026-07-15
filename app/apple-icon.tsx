import { ImageResponse } from "next/og";
import { getLogoDataUri, logoWidthForHeight } from "@/lib/logo";

// Apple touch icon (home-screen shortcut). iOS applies its own rounded mask,
// so the background is a solid full-bleed fill rather than a rounded card.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const logo = await getLogoDataUri();
  const height = 120;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
      }}
    >
      <img
        src={logo}
        height={height}
        width={logoWidthForHeight(height)}
        alt=""
      />
    </div>,
    { ...size },
  );
}
