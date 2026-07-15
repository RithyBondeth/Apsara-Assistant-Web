import { ImageResponse } from "next/og";
import { getLogoDataUri, logoWidthForHeight } from "@/lib/logo";

// Social share card shown when the landing page is linked on
// social networks and messaging apps.
export const alt =
  "Apsara Assistant — AI-powered sales assistant for Cambodian sellers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = await getLogoDataUri();
  // Square brand mark — sized so the title never clips the 1200px canvas.
  const logoHeight = 300;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 72,
          padding: "0 96px",
          background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 58%)",
        }}
      >
        <img
          src={logo}
          height={logoHeight}
          width={logoWidthForHeight(logoHeight)}
          alt=""
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "10px 24px",
              borderRadius: 999,
              background: "#2563eb",
              color: "#ffffff",
              fontSize: 30,
              fontWeight: 600,
              marginBottom: 28,
            }}
          >
            AI Sales Assistant
          </div>
          <div
            style={{
              fontSize: 88,
              fontWeight: 700,
              color: "#0a0a0a",
              lineHeight: 1.05,
            }}
          >
            Apsara Assistant
          </div>
          <div
            style={{
              fontSize: 36,
              color: "#404040",
              marginTop: 24,
              maxWidth: 620,
              lineHeight: 1.3,
            }}
          >
            For Cambodian sellers. Understands Khmer, English, and romanized
            Khmer.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
