import { ImageResponse } from "next/og";
import { getLogoDataUri, logoWidthForHeight } from "@/lib/logo";

// Browser-tab favicon, generated from the brand logo.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  const logo = await getLogoDataUri();
  const height = 48;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        borderRadius: 14,
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
