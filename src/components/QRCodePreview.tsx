// src/components/QRCodePreview.tsx

import { useRef, useEffect } from "react";
import QRCodeStyling, { type Options as QRCodeOptions } from "qr-code-styling";
import { getRedirectUrl } from "@/lib/qr-utils";

// Define the shape of the design data
type DesignOptions = {
  dot_color: string | null;
  background_color: string | null;
  corner_color: string | null;
  logo_url: string | null;
  frame_text: string | null;
};

type QRPreviewProps = {
  type: "static" | "dynamic";
  data: string; // This will be destination_url or short_url
  design: Partial<DesignOptions>;
  width?: number;
  height?: number;
};

const QRCodePreview = ({ type, data, design, width = 200, height = 200 }: QRPreviewProps) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCode = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (!qrRef.current) return;

    // Clear previous QR code
    qrRef.current.innerHTML = "";

    // Determine the data to encode. Dynamic codes use the redirect URL.
    const qrData = type === 'dynamic' ? getRedirectUrl(data) : data;

    // Define a narrowed option type for qr-code-styling constructor to avoid `any`.
    const qrOptions: Partial<QRCodeOptions> = {
      width,
      height,
      type: "svg",
      data: qrData,
      dotsOptions: {
        color: design.dot_color || "#000000",
        type: "rounded" as const,
      },
      backgroundOptions: {
        color: design.background_color || "#ffffff",
      },
      cornersSquareOptions: {
        color: design.corner_color || design.dot_color || "#000000",
        type: "extra-rounded" as const,
      },
      cornersDotOptions: {
        color: design.corner_color || design.dot_color || "#000000",
        type: "dot" as const,
      },
    };

    // Always supply imageOptions object to avoid library accessing properties of undefined (hideBackgroundDots)
    qrOptions.imageOptions = {
      crossOrigin: "anonymous",
      margin: design.logo_url ? 8 : 0,
      hideBackgroundDots: false,
      imageSize: 0.4,
    };
    if (design.logo_url) {
      qrOptions.image = design.logo_url;
    }

    // Create and append new QR code
    qrCode.current = new QRCodeStyling(qrOptions);
    qrCode.current.append(qrRef.current);

  }, [type, data, design, width, height]);

  // This renders the QR code *and* the frame, styled like your screenshot
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative p-4 bg-white rounded-2xl shadow-lg">
        
        {/* The QR Code itself will be injected here */}
        <div ref={qrRef} />
        
        {/* Frame / Banner */}
        {design.frame_text && (
          <div className="relative w-full -mt-2">
            <div 
              className="absolute left-1/2 -translate-x-1/2 bottom-2 w-[90%] py-2 px-4 rounded-md text-center bg-primary text-primary-foreground"
              style={{
                // A bit of clipping to make it look like a banner
                clipPath: 'polygon(0% 0%, 100% 0%, 95% 100%, 5% 100%)'
              }}
            >
              <p className="font-semibold text-sm">{design.frame_text}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodePreview;