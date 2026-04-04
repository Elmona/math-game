import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          background: "#1e1b4b",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: 300,
            fontWeight: 900,
            color: "#facc15",
            lineHeight: 1,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          ×
        </span>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
